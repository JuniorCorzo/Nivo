import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const req = createRequire(import.meta.url);
const compilerCliPath = req.resolve("@angular/compiler-cli");
const reqCli = createRequire(compilerCliPath);
const reflectMetadataPath = reqCli.resolve("reflect-metadata");

let designSystemPath = resolve(
  __dirname,
  "../../libs/design-system/src/index.ts",
);
if (!existsSync(designSystemPath)) {
  let curr = __dirname;
  while (curr !== dirname(curr)) {
    const candidate = resolve(curr, "libs/design-system/src/index.ts");
    if (existsSync(candidate)) {
      designSystemPath = candidate;
      break;
    }
    curr = dirname(curr);
  }
}

// When loaded as a setup file inside test environment:
if (typeof window !== "undefined") {
  await import("@angular/compiler");
  const { getTestBed } = await import("@angular/core/testing");
  const { BrowserTestingModule, platformBrowserTesting } = await import(
    "@angular/platform-browser/testing"
  );
  try {
    getTestBed().initTestEnvironment(
      BrowserTestingModule,
      platformBrowserTesting(),
    );
  } catch {
    // Already initialized
  }
}

function angularDecoratorPlugin(): Plugin {
  return {
    name: "angular-decorator-plugin",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".ts") || id.endsWith(".d.ts")) {
        return null;
      }
      if (
        !code.includes("@Injectable") &&
        !code.includes("@Component") &&
        !code.includes("@Directive") &&
        !code.includes("@Pipe")
      ) {
        return null;
      }
      const result = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          useDefineForClassFields: false,
        },
      });
      return {
        code: result.outputText,
        map: result.sourceMapText,
      };
    },
  };
}

export default defineConfig({
  plugins: [angularDecoratorPlugin()],
  resolve: {
    alias: {
      "@nivo-sass/design-system": designSystemPath,
      "@core": resolve(__dirname, "src/app/core"),
      "@features": resolve(__dirname, "src/app/features"),
      "@layouts": resolve(__dirname, "src/app/layouts"),
      "@shared": resolve(__dirname, "src/app/shared"),
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    include: [
      "src/app/core/**/*.spec.ts",
      "src/app/features/**/facades/**/*.spec.ts",
      "src/app/shared/utils/**/*.spec.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.stryker-tmp/**"],
    setupFiles: [reflectMetadataPath, resolve(__dirname, "vitest.config.ts")],
  },
});
