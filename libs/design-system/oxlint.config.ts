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
  rules: {
    "anti-slop/no-unknown-parameters": "off",
    "max-classes-per-file": "off",
    "typescript/no-extraneous-class": [
      "error",
      {
        allowWithDecorator: true,
      },
    ],
  },
});
