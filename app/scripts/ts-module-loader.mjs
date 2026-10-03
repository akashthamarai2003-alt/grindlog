import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const appRoot = fileURLToPath(new URL("../", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  let candidate = specifier;
  if (specifier.startsWith("@/")) {
    candidate = pathToFileURL(path.join(appRoot, specifier.slice(2))).href;
  } else if (specifier.startsWith("next/") && !path.extname(specifier)) {
    candidate = `${specifier}.js`;
  }

  if (candidate.startsWith("file:") || candidate.startsWith("./") || candidate.startsWith("../")) {
    const url = new URL(candidate, context.parentURL);
    const filePath = fileURLToPath(url);
    if (!path.extname(filePath)) {
      for (const extension of [".ts", ".tsx", ".mjs", ".js"]) {
        if (fs.existsSync(filePath + extension)) {
          candidate = pathToFileURL(filePath + extension).href;
          break;
        }
      }
    }
  }

  return nextResolve(candidate, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const source = fs.readFileSync(fileURLToPath(url), "utf8");
    const output = ts.transpileModule(source, {
      fileName: fileURLToPath(url),
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    return { format: "module", shortCircuit: true, source: output.outputText };
  }
  return nextLoad(url, context);
}
