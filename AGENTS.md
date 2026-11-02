# AGENTS.md — Repository Guide for Coding Agents

This repository contains **AxObfus (`axobfus`) by AlexDev**, an open-source defensive Counter-REA toolkit for protecting a user's own or explicitly authorized software artifacts against automated AI reverse-engineering agents. It uses format-valid decoys, resource and semantic exhaustion, and increased analyzer token consumption. It must not be presented as absolute protection.

The public repository is `AlexDev-TH/axobfus`. Preserve the original MIT attribution to [qybaihe/bla](https://github.com/qybaihe/bla) in `README.md` and `DISCLAIMER.md`.

## Project Layout

- `src/identity.ts`: Product metadata (`axobfus`) and analyzer resource-limit constants.
- `src/core/`:
  - `types.ts`: Domain interfaces (`AuditReport`, `ProtectionResult`, `VerificationReport`, `BenchmarkReport`).
  - `detector.ts`: Magic-byte and file-extension format detection across JavaScript/TypeScript, ASAR, WASM, Python, native binaries, SQLite, model formats, DEX, and IL2CPP metadata.
  - `sqlite-runtime.ts`: Lazy `node:sqlite` `DatabaseSync` loader validating Node `^22.13.0 || >=24.0.0`.
  - `output-path.ts`: Safe output path admission checks (`assertSafeOutputPath`).
  - `release-exposure.ts`: Bounded read-only source-map and symbol exposure scanner (`inspectReleaseExposure`).
  - `prng.ts`: Deterministic xorshift/mulberry32 PRNG (`SeededPrng`).
  - `token-estimator.ts`: Models analyzer tool turns and token cost; estimates are not universal benchmark results.
- `src/shields/`:
  - `exhaustion/`: Resource-exhaustion engines for analyzer budgets, obligations, call graphs, token amplification, WASM interfaces, runtime inspection, ASAR headers, and related formats.
  - `deception/`: Semantic and evidence decoys, shadow business logic, architecture mirages, semantic honeypots, decompiler illusions, diagnostic decoys, and format payloads.
  - `chaff/chaff-generator.ts`: Benign delegation manifests and decoy offset contracts.
  - `tarpit/`: Opaque runtime invariants and semantic budget breakers.
  - `runtime/`: Dynamic inspection deception and memory-diffing shields.
  - `javascript/ast-shield.ts`: Babel AST protection combining opaque expressions, IPC de-literalization, exhaustion, and deception.
  - `formats/`: Format-specific shields for source maps, ASAR, Electron fuses, WASM, Python, native binaries, SQLite, models, mobile games, Apple plists, .NET, headers, and archives.
- `src/bundler/index.ts`: Vite, Rollup, Webpack, and esbuild plugins (`axobfus/bundler`).
- `src/engine/`: `defender.ts` (`defendTarget`), `auditor.ts`, `protector.ts`, `verifier.ts`, and `benchmark.ts`.
- `src/mcp/server.ts`: JSON-RPC 2.0 MCP stdio server (`axobfus_harden`, `axobfus_defend`, `axobfus_audit`, `axobfus_protect`, `axobfus_verify`, `axobfus_benchmark`, `axobfus_emit_headers`, `axobfus_doctor`).
- `src/setup/`: Auto-registration for supported coding agents.
- `website/`: Static Thai-first presentation; no build step or remote runtime dependency. Local SVG assets live in `website/assets/`.

## Public Commands

```bash
npx axobfus setup
npx axobfus harden .
axobfus audit ./dist --report ./reports/audit.html
axobfus defend ./dist --report ./reports/defend.html
axobfus verify ./dist.protected ./dist
```

`--report <path>` writes standalone HTML for `audit` and `defend`; reports work offline without scripts or external assets. Support on `harden` is optional. Reports are environment-specific observations and estimates, not security certification. Do not reuse upstream benchmark figures as AxObfus results.

## Build & Test Commands

```bash
npm run build
npm test
node dist/cli.js benchmark
node dist/cli.js defend ./dist --manifest
```

Run these checks when changing code and report actual results honestly. Documentation examples alone do not imply that tests or benchmarks have already run.
