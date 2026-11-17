import { defineConfig } from "oxlint";
import angular from "ultracite/oxlint/angular";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import { selectJsPlugins } from "ultracite/oxlint/js-plugins";

const jsPlugins = selectJsPlugins(["github"]);

export default defineConfig({
  extends: [core, angular, antiSlop, jsPlugins],
  ignorePatterns: core.ignorePatterns,
  jsPlugins: jsPlugins.jsPlugins,
  overrides: [
    {
      files: ["e2e/**"],
      rules: {
        "github/filenames-match-regex": "off",
        "unicorn/filename-case": "off",
      },
    },
    {
      files: ["**/*.spec.ts", "**/*.test.ts"],
      rules: {
        "anti-slop/no-chained-type-assertions": "off",
        "anti-slop/no-known-value-widening": "off",
        "anti-slop/no-runtime-typeof": "off",
        "anti-slop/require-safety-comment-for-type-assertion": "off",
        "no-empty-function": "off",
        "no-inline-comments": "off",
        "no-promise-executor-return": "off",
        "promise/avoid-new": "off",
        "promise/param-names": "off",
        "require-await": "off",
        "typescript/no-dynamic-delete": "off",
        "typescript/no-explicit-any": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-useless-spread": "off",
        "unicorn/no-useless-undefined": "off",
      },
    },
    {
      files: ["vitest.config.ts", "vitest-runner.mjs"],
      rules: {
        "anti-slop/no-runtime-typeof": "off",
        "func-style": "off",
        "no-inline-comments": "off",
        "promise/avoid-new": "off",
        "promise/param-names": "off",
        "unicorn/import-style": "off",
        "unicorn/prefer-module": "off",
      },
    },
  ],
  rules: {
    "anti-slop/no-unknown-parameters": "off",
    "class-methods-use-this": "off",
    "github/filenames-match-regex": ["error", "^[a-z0-9-]+(\\.[a-z0-9-]+)*$"],
    "no-empty-function": "off",
    "unicorn/prefer-export-from": "off",
  },
});
