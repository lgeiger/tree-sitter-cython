package tree_sitter_cython_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_cython.Language())
	if language == nil {
		t.Errorf("Error loading Cython grammar")
	}
}
