package main

import "testing"

func TestNewIpn(t *testing.T) {
	tests := []struct {
		s     string
		valid bool
	}{
		{"PCA-001-0001", true},
		{"BAD", false},
	}
	for _, tt := range tests {
		_, err := newIpn(tt.s)
		if tt.valid && err != nil {
			t.Errorf("%v should be valid, got %v", tt.s, err)
		}
		if !tt.valid && err == nil {
			t.Errorf("%v expected error", tt.s)
		}
	}
}

func TestNewIpnParts(t *testing.T) {
	tests := []struct {
		c     string
		n, v  int
		valid bool
	}{
		{"PCB", 1, 1, true},
		{"PC", 1, 1, false},
		{"PCB", -1, 1, false},
		{"PCB", 1000, 1, false},
		{"PCB", 1, -1, false},
		{"PCB", 1, 10000, false},
		{"pcB", 1, 1, false},
	}
	for _, tt := range tests {
		_, err := newIpnParts(tt.c, tt.n, tt.v)
		if tt.valid && err != nil {
			t.Errorf("%v-%03v-%04v should be valid, got %v", tt.c, tt.n, tt.v, err)
		}
		if !tt.valid && err == nil {
			t.Errorf("%v-%03v-%04v expected error", tt.c, tt.n, tt.v)
		}
	}
}

func TestIpnMethods(t *testing.T) {
	i := ipn("ASY-123-0004")
	c, err := i.c()
	if err != nil || c != "ASY" {
		t.Errorf("c failed: %v %v", c, err)
	}
	n, err := i.n()
	if err != nil || n != 123 {
		t.Errorf("n failed: %v %v", n, err)
	}
	v, err := i.v()
	if err != nil || v != 4 {
		t.Errorf("v failed: %v %v", v, err)
	}
}

func TestIsOurIPN(t *testing.T) {
	tests := []struct {
		ipn  string
		want bool
	}{
		{"PCA-001-0001", true},
		{"XYZ-001-0001", false},
	}
	for _, tt := range tests {
		got, err := ipn(tt.ipn).isOurIPN()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != tt.want {
			t.Errorf("isOurIPN(%v) got %v want %v", tt.ipn, got, tt.want)
		}
	}
}

func TestHasBOM(t *testing.T) {
	tests := []struct {
		ipn  string
		want bool
	}{
		{"PCA-001-0001", true},
		{"DOC-001-0001", false},
	}
	for _, tt := range tests {
		got, err := ipn(tt.ipn).hasBOM()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != tt.want {
			t.Errorf("hasBOM(%v) got %v want %v", tt.ipn, got, tt.want)
		}
	}
}
