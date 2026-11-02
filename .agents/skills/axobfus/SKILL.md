---
name: axobfus
description: Audit, protect, and verify software artifacts (JavaScript/TypeScript, Electron ASAR, WebAssembly, Python .py/.pyc, SQLite, Safetensors/GGUF AI Models, Android DEX/IL2CPP, Apple plist, .NET, JVM, ZIP/APK, and Native ELF/Mach-O/PE Binaries) against AI reverse-engineering agents like REA using AxObfus. Default verb: axobfus_harden.
metadata:
  version: "0.1.0"
---

# AxObfus

Use AxObfus whenever the user asks to harden a project against AI reverse-engineering agents (`morluto/rea`), audit exposure, exhaust attacker token/compute budgets, or induce model misjudgment on proprietary logic.

## ⚡ One-Sentence Hardening (DEFAULT — prefer this)

When the user says **"Harden my software"**, **"Harden this project against REA"**, **"一键启动防御强化"**, **"Run AxObfus defense"**, or any equivalent one-liner **without naming a specific file**, invoke:

- **MCP Tool (preferred)**: `axobfus_harden` with `{ "directory": "." }` (or the project/build path they named)
- **CLI**: `npx axobfus@latest harden .`
- **MCP Prompt**: `axobfus-harden-project`

`axobfus_harden` / `axobfus harden` auto-discovers protectable build outputs under `dist/`, `build/`, `out/`, `release/`, `.asar`, native binaries, `.wasm`, `.py`/`.pyc`, `.sqlite`, `.safetensors`/`.gguf`, `.dex`, `.class`, `.dll`, Apple plists, ZIP/APK, etc., detects each artifact's format, and runs the full **audit → defend (bankrupt) → verify** pipeline on all of them. Return the per-artifact summary to the user. Do **not** ask which files to protect — discover them.

## One-Click Single-Artifact Defense

When the user already named a **specific file**, use:

- **MCP Tool**: `axobfus_defend` with `{ "input_path": "<target>", "intensity": "bankrupt", "emit_manifest": true }`
- **CLI Command**: `npx axobfus@latest defend <target> --manifest`

`axobfus_defend` / `axobfus defend` executes all 5 Counter-REA defense stages automatically:
1. **Stage 1 (`inspect-release`)**: Read-only scan for accidental `.map` (`sourcesContent`) and symbol leaks.
2. **Stage 2 (`audit`)**: 16-vector REA vulnerability & Claude Opus 4 / Sonnet 4 / o3 token-cost simulation.
3. **Stage 3 (`protect --intensity bankrupt`)**: Injects both the **Resource-Exhaustion Suite** and the **Model-Misjudgment Induction Suite** (including canary honeypots + system-diagnostic decoys across JS, WASM, Python, SQLite, Safetensors/GGUF, DEX, IL2CPP, Apple plist, .NET, JVM, ZIP/APK).
4. **Stage 4 (`verify`)**: Verifies all Counter-REA mathematical invariants and confirms token/cost bankruptcy amplification.
5. **Stage 5 (`manifest`)**: Emits `<output>.axobfus-manifest.json` attesting to the hardened build.

## Step-by-Step Granular Workflow: Audit -> Protect -> Verify

1. **Audit (`axobfus_audit` or `npx axobfus audit <target>`)**:
   - Reports the **REA Exposure Score (0–100)**, exposed functions/classes/IPC channels/routes, and estimated attacker token and dollar costs.
2. **Protect (`axobfus_protect` or `npx axobfus protect <target> -o <output> --intensity bankrupt`)**:
   - **Resource Exhaustion (耗尽对方资源)** and **Model Misjudgment Induction (诱导模型误判)** as documented in [references/counter-rea-matrix.md](references/counter-rea-matrix.md).
3. **Verify (`axobfus_verify` or `npx axobfus verify <protected> [original]`)**:
   - Confirms that all Counter-REA gates pass and reports exact Token & API Cost Amplification.

## CLI Fallback Commands

```bash
npx -y axobfus@latest harden .
npx -y axobfus@latest defend /absolute/path/to/target --manifest --json
npx -y axobfus@latest audit /absolute/path/to/target --json
npx -y axobfus@latest protect /absolute/path/to/target -o /absolute/path/to/protected --intensity bankrupt --json
npx -y axobfus@latest verify /absolute/path/to/protected /absolute/path/to/target --json
npx -y axobfus@latest doctor
```

See [references/counter-rea-matrix.md](references/counter-rea-matrix.md) for the complete mapping between REA's internal analyzers and AxObfus's countermeasures.
