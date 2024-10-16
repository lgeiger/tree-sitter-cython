import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("google"),
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
      },

      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "arrow-parens": "off",
      "camel-case": "off",
      "valid-jsdoc": "off",
      "require-jsdoc": "off",
      "object-curly-spacing": "off",
      "operator-linebreak": "off",
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "always-multiline",
      }],

      "quotes": ["error", "double", { "avoidEscape": true }],

      "indent": ["error", 2, {
        SwitchCase: 1,
      }],

      "max-len": ["error", {
        code: 160,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
      }],

      "spaced-comment": ["warn", "always", {
        line: {
          markers: ["/"],
        },
      }],
    },
  },
];
