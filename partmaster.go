package main

import (
	"fmt"
	"path/filepath"
	"sort"
)

type partmasterLine struct {
	IPN          ipn    `csv:"IPN"`
	Description  string `csv:"Description"`
	Footprint    string `csv:"Footprint"`
	Value        string `csv:"Value"`
	Manufacturer string `csv:"Manufacturer"`
	MPN          string `csv:"MPN"`
	Datasheet    string `csv:"Datasheet"`
	Priority     int    `csv:"Priority"`
	Checked      string `csv:"Checked"`
}

func (p *partmasterLine) String() string {
	return fmt.Sprintf("%s, %s, %s, %s, %s, %s",
		p.IPN, p.Description, p.Footprint, p.Value, p.Manufacturer, p.MPN)
}

type partmaster []*partmasterLine

func (p partmaster) String() string {
	result := ""
	for _, line := range p {
		result += line.String() + "\n"
	}
	return result
}

// findPartSources returns all matching parts for a given IPN sorted by priority.
// Missing description, footprint, and value fields are populated from the
// highest priority part so every returned entry has the same core data. This
// enables callers to access an arbitrary number of sources for a single part
// number.
func (p *partmaster) findPartSources(pn ipn) ([]*partmasterLine, error) {
	found := []*partmasterLine{}
	for _, l := range *p {
		if l.IPN == pn {
			found = append(found, l)
		}
	}

	if len(found) == 0 {
		return nil, fmt.Errorf("Part not found")
	}

	sort.Sort(byPriority(found))

	base := found[0]
	if len(found) > 1 {
		// fill in blank fields on the highest priority entry
		for i := 1; i < len(found); i++ {
			if base.Description == "" && found[i].Description != "" {
				base.Description = found[i].Description
			}
			if base.Footprint == "" && found[i].Footprint != "" {
				base.Footprint = found[i].Footprint
			}
			if base.Value == "" && found[i].Value != "" {
				base.Value = found[i].Value
			}
		}
	}

	// propagate common fields to all returned parts
	for _, f := range found {
		if f.Description == "" {
			f.Description = base.Description
		}
		if f.Footprint == "" {
			f.Footprint = base.Footprint
		}
		if f.Value == "" {
			f.Value = base.Value
		}
	}

	return found, nil
}

// findPart returns part with highest priority
func (p *partmaster) findPart(pn ipn) (*partmasterLine, error) {
	parts, err := p.findPartSources(pn)
	if err != nil {
		return nil, err
	}
	return parts[0], nil
}

// type for sorting
type byPriority []*partmasterLine

func (p byPriority) Len() int           { return len(p) }
func (p byPriority) Swap(i, j int)      { p[i], p[j] = p[j], p[i] }
func (p byPriority) Less(i, j int) bool { return p[i].Priority < p[j].Priority }

// loadPartmasterFromDir loads all CSV files from a directory and combines them into a single partmaster
func loadPartmasterFromDir(dir string) (partmaster, error) {
	pm := partmaster{}

	files, err := filepath.Glob(filepath.Join(dir, "*.csv"))
	if err != nil {
		return pm, fmt.Errorf("error finding CSV files in directory %s: %v", dir, err)
	}

	for _, file := range files {
		var temp partmaster
		err := loadCSV(file, &temp)
		if err != nil {
			return pm, fmt.Errorf("error loading CSV file %s: %v", file, err)
		}

		// Post-process to fix missing values
		for _, part := range temp {
			if part.Value == "" && part.MPN != "" {
				part.Value = part.MPN
			}
		}

		pm = append(pm, temp...)
	}

	return pm, nil
}
