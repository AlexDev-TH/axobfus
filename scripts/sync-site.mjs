#!/usr/bin/env node
/**
 * Validates the local website tree. This script performs no network access,
 * git mutations, or publishing.
 * Usage: npm run sync:site
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "website/index.html",
  "website/get-started/index.html",
  "website/showcase/index.html",
  "website/guides/index.html",
  "website/faq/index.html",
  "website/assets/styles.css",
  "website/assets/main.js",
  "website/assets/i18n.js",
  "website/assets/home.js",
  "website/assets/logo.svg",
  "website/assets/logo.png",
  "website/assets/favicon.svg",
  "website/assets/favicon.png",
  "website/assets/social-card.svg",
  "website/schemas/axobfus.config.v1.json",
  "website/schemas/defense-manifest-v1.json",
];

for (const relativePath of requiredFiles) {
  if (!existsSync(join(rootDir, relativePath))) {
    throw new Error(`Missing required website file: ${relativePath}`);
  }
}

for (const schemaName of ["axobfus.config.v1.json", "defense-manifest-v1.json"]) {
  const relativePath = `website/schemas/${schemaName}`;
  const schema = JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
  const expectedId = `https://raw.githubusercontent.com/AlexDev-TH/axobfus/main/${relativePath}`;
  if (schema.$id !== expectedId) {
    throw new Error(`Unexpected $id in ${relativePath}: ${schema.$id ?? "missing"}`);
  }
}

console.log(`Validated ${requiredFiles.length} local website files and 2 schemas. No sync or publishing performed.`);
