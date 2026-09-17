// Node ESM resolver hook (registered via node:module's register() in scripts/smoke-test.js) that
// rewrites the "@/" specifier lib/*.js files use (jsconfig.json's path alias, resolved by
// Next.js's own bundler at build time) to a real project-root-relative URL — the one thing that
// lets smoke-test.js import real app code (lib/products.js, lib/productPhotos.js) under plain
// `node`, which has no idea what "@/" means on its own.
import { pathToFileURL } from "node:url";
import path from "node:path";

const projectRootUrl = pathToFileURL(path.join(import.meta.dirname, "..") + "/").href;

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) return nextResolve(specifier, context);

  const rewritten = projectRootUrl + specifier.slice(2);
  try {
    // Next's bundler resolves extensionless imports itself; plain Node ESM doesn't, so try the
    // specifier as written first (already-extensioned imports still work), then fall back to
    // appending .js — every lib/*.js import this hook needs to handle is extensionless.
    return await nextResolve(rewritten, context);
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    return nextResolve(`${rewritten}.js`, context);
  }
}
