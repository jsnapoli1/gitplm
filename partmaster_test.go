package main

import (
	"testing"

	"github.com/gocarina/gocsv"
)

var pmIn = `
IPN,Description,Value,Manufacturer,MPN,Priority
CAP-001-1001,superduper cap,,CapsInc,10045,2
CAP-001-1001,,10k,MaxCaps,abc2322,1
CAP-001-1002,,,MaxCaps,abc2323,
`

func TestPartmaster(t *testing.T) {
	initCSV()
	pm := partmaster{}
	err := gocsv.UnmarshalBytes([]byte(pmIn), &pm)
	if err != nil {
		t.Fatalf("Error parsing pmIn: %v", err)
	}

	p, err := pm.findPart("CAP-001-1001")
	if err != nil {
		t.Fatalf("Error finding part CAP-001-1001: %v", err)
	}

	if p.MPN != "abc2322" {
		t.Errorf("Got wrong part for CAP-001-1001, %v", p.MPN)
	}

	if p.Description != "superduper cap" {
		t.Errorf("Got wrong description for CAP-001-1001: %v", p.Description)
	}

	if p.Value != "10k" {
		t.Errorf("Got wrong value for CAP-001-1001: %v", p.Value)
	}

	_, err = pm.findPart("CAP-001-1002")
	if err != nil {
		t.Fatalf("Error finding part CAP-001-1002: %v", err)
	}
}

func TestPartmasterFindPartSources(t *testing.T) {
	initCSV()
	pm := partmaster{}
	err := gocsv.UnmarshalBytes([]byte(pmIn), &pm)
	if err != nil {
		t.Fatalf("Error parsing pmIn: %v", err)
	}

	parts, err := pm.findPartSources("CAP-001-1001")
	if err != nil {
		t.Fatalf("Error finding sources for CAP-001-1001: %v", err)
	}

	if len(parts) != 2 {
		t.Fatalf("Expected 2 sources for CAP-001-1001, got %v", len(parts))
	}

	if parts[0].MPN != "abc2322" || parts[1].MPN != "10045" {
		t.Errorf("Sources not sorted by priority: got %v then %v", parts[0].MPN, parts[1].MPN)
	}

	for i, p := range parts {
		if p.Description != "superduper cap" {
			t.Errorf("Wrong description for source %v: %v", i, p.Description)
		}
		if p.Value != "10k" {
			t.Errorf("Wrong value for source %v: %v", i, p.Value)
		}
	}
}
