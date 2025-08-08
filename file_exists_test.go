package main

import (
	"os"
	"testing"
)

func TestFileExists(t *testing.T) {
	f, err := os.CreateTemp("", "fileExists")
	if err != nil {
		t.Fatalf("CreateTemp failed: %v", err)
	}
	fname := f.Name()
	f.Close()

	if !fileExists(fname) {
		t.Errorf("expected %s to exist", fname)
	}

	os.Remove(fname)
	if fileExists(fname) {
		t.Errorf("expected %s to not exist", fname)
	}
}
