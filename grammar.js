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
  new: 23,
  cast: 24,
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

  conflicts: ($, original) =>
    original.concat([
      [$.maybe_typed_name],
      [$.int_type, $.maybe_typed_name],
      [$.c_name, $.maybe_typed_name],
      [$.c_name, $.cvar_decl],
      [$.c_type, $.maybe_typed_name],
    ]),

  rules: {
    module: $ => seq(optional($.run_directive), repeat($._statement)),

    run_directive: $ => seq("PYTHON", /[^\r\n]+/, $._newline),

    // Cython allows 'cimport'
    import_statement: $ =>
      seq(
        choice("import", "cimport"),
        $._import_list,
      ),

    import_from_statement: $ =>
      seq(
        "from",
        field(
          "module_name",
          choice(
            $.relative_import,
            $.dotted_name,
          ),
        ),
        choice("import", "cimport"),
        choice(
          $.wildcard_import,
          $._import_list,
          seq("(", $._import_list, ")"),
        ),
      ),

    class_definition: $ =>
      seq(
        repeat($.storageclass),
        "class",
        field("name", $.identifier),
        repeat(seq(".", $.identifier)),
        optional(seq("(", $.c_type, ")")),
        choice(
          seq(
            choice(
              field("superclasses", optional($.argument_list)),
              field("name_specification", optional($.external_definition)),
            ),
            ":",
            field("body", $._suite),
          ),
          $._newline,
        ),
      ),
    external_definition: $ =>
      seq(
        "[",
        commaSep1(seq(choice("object", "type"), $.c_type)),
        "]",
      ),

    property_definition: $ =>
      seq(
        "property",
        $.identifier,
        ":",
        field("body", $._suite),
      ),

    include_statement: $ =>
      seq(
        "include",
        choice(
          $.string,
          seq("<", $.string, ">"),
        ),
      ),

    _simple_statement: ($, original) =>
      choice(
        original,
        $.include_statement,
      ),

    _compound_statement: ($, original) =>
      choice(
        original,
        $.def_statement,
        $.cdef_statement,
        $.ctypedef_statement,
        $.property_definition,
      ),

    decorated_definition: $ =>
      seq(
        repeat1($.decorator),
        field(
          "definition",
          choice(
            $.class_definition,
            $.function_definition,
            $.cdef_statement,
          ),
        ),
      ),

    def_statement: $ =>
      seq(
        "DEF",
        field("name", $.identifier),
        "=",
        $.expression,
        $._newline,
      ),

    cdef_statement: $ =>
      seq(
        choice("cdef", "cpdef"),
        choice(
          $.cvar_def,
          $.cdef_type_declaration,
          $.extern_block,
          seq(
            repeat($.storageclass),
            optional(choice($.identifier, $.keyword_identifier)),
            ":",
            $._indent,
            repeat1(choice($.cvar_def, $.ctypedef_statement, $.cdef_type_declaration, $.extern_block)),
            $._dedent,
          ),
        ),
      ),

    cvar_def: $ =>
      seq(
        repeat($.storageclass),
        $.maybe_typed_name,
        choice(
          seq(
            optional(seq("=", $.expression)),
            repeat(seq(
              ",",
              optional($.type_qualifier),
              $.identifier,
              optional(seq("=", $.expression)),
            )),
            optional(","),
            $._newline,
          ),
          $.c_function_definition,
        ),
      ),

    cdef_type_declaration: $ => choice($.ctype_declaration, $.fused, $.class_definition),

    extern_block: $ =>
      seq(
        "extern",
        optional(seq(
          "from",
          choice($.string, "*"),
          optional(seq("namespace", $.string)),
          optional("nogil"),
        )),
        choice(
          seq(":", $.extern_suite),
          $.class_definition,
          $.cvar_def,
        ),
      ),

    extern_suite: $ =>
      choice(
        $.pass_statement,
        seq(
          $._indent,
          choice(
            repeat1(choice(
              seq(
                optional(choice("cdef", "cpdef")),
                choice($.cvar_decl, $.cdef_type_declaration),
              ),
              $.ctypedef_statement,
              $.string,
            )),
            $.pass_statement,
          ),
          $._dedent,
        ),
        alias($._newline, $.block),
      ),

    ctype_declaration: $ => choice($.struct, $.enum, $.cppclass),

    cvar_decl: $ =>
      seq(
        repeat($.storageclass),
        $.c_type,
        optional(seq($.c_name, optional(field("alias", $.string)))),
        choice(
          seq(
            $.identifier,
            optional(field("alias", $.string)),
            repeat($.type_index),
            optional(seq("=", $.expression)),
            repeat(seq(
              ",",
              $.identifier,
              optional(field("alias", $.string)),
              optional(seq("=", $.expression)),
            )),
            $._newline,
          ),
          $.c_function_definition,
        ),
      ),

    int_type: $ =>
      prec.right(choice(
        seq(
          $._signedness,
          optional($._longness),
        ),
        $._longness,
        seq(
          optional($._signedness),
          optional($._longness),
          choice("int", "double"),
        ),
        "complex",
      )),

    operator_name: $ =>
      seq(
        "operator",
        choice(
          "co_await",
          "+",
          "-",
          "*",
          "/",
          "%",
          "^",
          "&",
          "|",
          "~",
          "!",
          "=",
          "<",
          ">",
          "+=",
          "-=",
          "*=",
          "/=",
          "%=",
          "^=",
          "&=",
          "|=",
          "<<",
          ">>",
          ">>=",
          "<<=",
          "==",
          "!=",
          "<=",
          ">=",
          "<=>",
          "&&",
          "||",
          "++",
          "--",
          ",",
          "->*",
          "->",
          "()",
          "[]",
          "xor",
          "bitand",
          "bitor",
          "compl",
          "not",
          "xor_eq",
          "and_eq",
          "or_eq",
          "not_eq",
          "and",
          "or",
          seq(choice("new", "delete"), optional("[]")),
          seq("\"\"", $.identifier),
        ),
      ),

    _signedness: _ => choice("signed", "unsigned"),
    _longness: _ =>
      prec.right(choice(
        "char",
        "short",
        "long",
        alias(seq("long", "long"), "long long"),
      )),

    // type: ['const'] (NAME ('.' PY_NAME)* | int_type | '(' type ')') ['complex'] [type_qualifier]
    c_type: $ =>
      prec.right(
        1,
        seq(
          optional(choice("const", "volatile")),
          choice(
            seq(
              field("type", $.identifier),
              repeat(seq(
                ".",
                $.identifier,
              )),
            ),
            $.int_type,
            seq("(", commaSep1($.c_type), ")"),
          ),
          optional("complex"),
          repeat($.type_qualifier),
        ),
      ),

    c_name: $ =>
      choice(
        seq(optional($.type_qualifier), $.identifier),
        seq("(", optional($.type_qualifier), $.identifier, ")"),
      ),

    maybe_typed_name: $ =>
      choice(
        seq(
          optional(choice("const", "volatile")),
          field("type", choice($.identifier, $.int_type)),
          optional(seq(
            repeat(seq(
              ".",
              $.identifier,
            )),
            optional("complex"),
            repeat($.type_qualifier),
          )),
          field("name", optional(choice($.identifier, $.operator_name))),
          repeat($.type_qualifier),
        ),
        seq(
          optional(choice("const", "volatile")),
          field("name", choice($.identifier, $.operator_name)),
          repeat($.type_qualifier),
        ),
      ),

    // type_qualifier: '*' | '**' | '&' | type_index ('.' NAME [type_index])*
    type_qualifier: $ =>
      choice(
        "*",
        "**",
        "&",
        "__stdcall",
        seq(
          $.type_index,
          repeat(seq(
            ".",
            $.identifier,
            optional($.type_index),
          )),
        ),
      ),

    type_index: $ =>
      seq(
        "[",
        optional(choice(
          $.integer,
          commaSep1(seq($.c_type, optional(seq("=", $.expression)))),
          commaSep1($.memory_view_index),
        )),
        "]",
      ),
    memory_view_index: $ =>
      seq(
        ":",
        optional($.expression),
        optional(seq(
          ":",
          optional($.expression),
        )),
      ),

    ctypedef_statement: $ =>
      seq(
        "ctypedef",
        choice($.cvar_decl, $.struct, $.enum, $.fused, $.class_definition, $.extern_block),
        optional(";"),
      ),

    c_function_declaration: $ =>
      seq(
        optional($.template_params),
        $.c_parameters,
        optional($.gil_spec),
        optional($.exception_value),
        optional($.gil_spec),
      ),

    c_function_definition: $ =>
      seq(
        optional($.template_params),
        $.c_parameters,
        optional($.gil_spec),
        optional($.exception_value),
        optional($.gil_spec),
        choice(
          seq(":", $._suite),
          $._newline,
        ),
      ),

    template_params: $ =>
      seq(
        "[",
        commaSep1($.identifier),
        "]",
      ),

    c_parameters: $ => seq("(", optional($._typedargslist), ")"),
    _typedargslist: $ =>
      seq(
        commaSep1(seq(
          $.maybe_typed_name,
          optional(seq(":", $.c_type)),
          optional(seq("=", choice($.expression, "*"))),
        )),
        optional(","),
      ),

    gil_spec: _ => choice(seq("with", choice("gil", "nogil")), "nogil"),
    exception_value: $ =>
      choice(
        prec(
          1,
          seq(
            "except",
            choice(
              seq(optional("?"), $.expression),
              "*",
              seq("+", optional($.identifier)),
            ),
          ),
        ),
        "noexcept",
      ),

    typed_parameter: $ =>
      prec(
        PREC.typed_parameter,
        choice(
          seq(
            field("type", $.c_type),
            choice(
              seq($.identifier, optional($.type_index)),
              $.list_splat_pattern,
              $.dictionary_splat_pattern,
            ),
            optional(seq(
              choice("not", "or"),
              "None",
            )),
          ),
          seq(
            choice(
              $.identifier,
              $.list_splat_pattern,
              $.dictionary_splat_pattern,
            ),
            ":",
            field("type", $.c_type),
          ),
        ),
      ),

    typed_default_parameter: $ =>
      prec(
        PREC.typed_parameter,
        seq(
          field("type", $.c_type),
          field("name", $.identifier),
          optional($.type_index),
          "=",
          field("value", $.expression),
        ),
      ),

    struct: $ =>
      seq(
        repeat($.storageclass),
        choice("struct", "union"),
        $.identifier,
        optional(field("alias", $.string)),
        choice($._newline, seq(":", $.struct_suite)),
      ),
    struct_suite: $ =>
      choice(
        $.pass_statement,
        seq(
          $._indent,
          choice(
            repeat($.cvar_decl),
            $.pass_statement,
          ),
          $._dedent,
        ),
        alias($._newline, $.block),
      ),

    enum: $ =>
      seq(
        repeat($.storageclass),
        "enum",
        optional(choice("class", "struct")),
        optional(
          seq(
            $.identifier,
            optional(seq("(", $.c_type, ")")),
            optional(seq(":", $.c_type)),
          ),
        ),
        choice($._newline, seq(":", $._suite)),
      ),

    cppclass: $ =>
      seq(
        "cppclass",
        $.identifier,
        optional($.template_params),
        optional("nogil"),
        choice($._newline, seq(":", $._cppclass_suite)),
      ),

    _cppclass_suite: $ =>
      choice(
        $.pass_statement,
        seq(
          $._indent,
          repeat(choice(
            $.cvar_def,
            $.cppclass,
          )),
          $._dedent,
        ),
      ),

    fused: $ =>
      seq(
        "fused",
        $.identifier,
        ":",
        $._indent,
        repeat(seq(
          $.c_type,
          $._newline,
        )),
        $._dedent,
      ),

    storageclass: _ => choice("public", "packed", "inline", "api", "readonly"),

    expression: ($, original) =>
      choice(
        original,
        $.new_expression,
      ),

    primary_expression: ($, original) =>
      choice(
        original,
        $.cast_expression,
        $.sizeof_expression,
      ),

    new_expression: $ =>
      prec(
        PREC.new,
        seq(
          "new",
          $.c_type,
          $.argument_list,
        ),
      ),

    sizeof_expression: $ =>
      prec(
        PREC.new,
        seq(
          "sizeof",
          "(",
          $.c_type,
          ")",
        ),
      ),

    cast_expression: $ =>
      prec(
        PREC.cast,
        seq(
          "<",
          $.c_type,
          optional("?"),
          ">",
          $.expression,
        ),
      ),

    unary_operator: $ =>
      prec(
        PREC.unary,
        seq(
          field("operator", choice("+", "-", "~", "&")),
          field("argument", $.primary_expression),
        ),
      ),

    for_statement: $ =>
      seq(
        optional("async"),
        "for",
        optional(seq(
          field("left", $._left_hand_side),
          choice("in", "from"),
        )),
        field("right", $._expressions),
        ":",
        field("body", $._suite),
        field("alternative", optional($.else_clause)),
      ),

    keyword_identifier: $ =>
      prec(
        -3,
        alias(
          choice(
            "print",
            "exec",
            "async",
            "await",
            "match",
            "api",
          ),
          $.identifier,
        ),
      ),
  },
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
