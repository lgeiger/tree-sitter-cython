/**
 * @file Cython grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 * @see {@link https://github.com/bazelbuild/cython|official website}
 * @see {@link https://github.com/bazelbuild/cython/blob/master/spec.md|official syntax spec}
 * @see {@link https://bazel.build/rules/language|official language guide}
 */

/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const Python = require("tree-sitter-python/grammar");

const PREC = Object.assign({}, Python.PREC, {
  // as_pattern: 1,
  // parenthesized_list_splat: 2,
  // with_item: 3,
  // pointer: 4,
});

module.exports = grammar(Python, {
  name: "cython",

  // conflicts: ($, original) =>
  //   original.filter((conflict) => {
  //     const unnecessaryConflicts = [
  //       // ["type_alias_statement", "primary_expression"],
  //       // ["with_item", "_collection_elements"],
  //       // ["named_expression", "as_pattern"],
  //     ];
  //
  //     return !unnecessaryConflicts.some(pair =>
  //       conflict.length === 2
  //       && ("name" in conflict[0] && conflict[0].name === pair[0])
  //       && ("name" in conflict[1] && conflict[1].name === pair[1])
  //     );
  //   }).concat([
  //     // [$.argument_list, $.tuple],
  //     // [$.type],
  //   ]),

  rules: {},
});

module.exports.PREC = PREC;

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 */
function commaSep1(rule) {
  return sep1(rule, ",");
}

/**
 * Creates a rule to match one or more of the rules separated by the separator
 *
 * @param {Rule} rule
 * @param {string} separator - The separator to use.
 *
 * @return {SeqRule}
 */
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
