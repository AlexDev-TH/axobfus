import { AXOBFUS_IDENTITY } from "../identity.js";
import type {
  AuditReport,
  BenchmarkReport,
  ProtectionResult,
  VerificationReport,
} from "../core/types.js";
import type { DoctorDiagnosticReport } from "../setup/doctor.js";
import type { SetupRunResult } from "../setup/setup.js";
import type { OneClickDefenseReport } from "../engine/defender.js";

const ANSI_CODES = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
} as const;

type AnsiPalette = { readonly [K in keyof typeof ANSI_CODES]: string };

const PLAIN_ANSI: AnsiPalette = {
  reset: "",
  bold: "",
  dim: "",
  red: "",
  green: "",
  yellow: "",
  blue: "",
  magenta: "",
  cyan: "",
  white: "",
};

const ESTIMATE_NOTICE = "ค่าประมาณจากแบบจำลองภายใน ไม่ใช่ผลการทดสอบ REA จริง";

function ansi(): AnsiPalette {
  return process.env.NO_COLOR === undefined && process.stdout.isTTY === true
    ? ANSI_CODES
    : PLAIN_ANSI;
}

export function formatBanner(): string {
  const c = ansi();
  return [
    `${c.bold}${c.cyan}AxObfus${c.reset} by AlexDev`,
    `${c.dim}${AXOBFUS_IDENTITY.packageName} v${AXOBFUS_IDENTITY.version} · Counter-REA defensive toolkit${c.reset}`,
  ].join("\n");
}

export function formatAuditReport(report: AuditReport): string {
  const c = ansi();
  const statusColor =
    report.protectionStatus === "AXOBFUS_PROTECTED"
      ? c.green
      : report.protectionStatus === "PARTIALLY_SHIELDED"
        ? c.yellow
        : c.red;
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}เป้าหมาย${c.reset}: ${report.targetPath}`,
    `${c.bold}รูปแบบ${c.reset}: ${report.detectedFormat} (${report.byteSize.toLocaleString()} bytes)`,
    `${c.bold}SHA-256${c.reset}: ${report.sha256}`,
    `${c.bold}สถานะ${c.reset}: ${statusColor}${report.protectionStatus}${c.reset} · exposure ${report.exposureScore}/100`,
    `${c.bold}การตรวจสอบ${c.reset}: ${report.reaSimulation.examinationStatus}`,
    `${c.bold}Obligation graph${c.reset}: ${report.reaSimulation.obligationLedgerNodes} nodes · ${report.reaSimulation.decoyFunctionsDetectedAsReal} decoys · ${report.reaSimulation.architecturalChaffPayloads} chaff`,
  ];

  if (report.reaSimulation.triggeredResourceLimits.length > 0) {
    lines.push(`${c.bold}ข้อจำกัดที่ถูกกระตุ้น${c.reset}: ${report.reaSimulation.triggeredResourceLimits.join(", ")}`);
  }

  lines.push("", `${c.bold}ค่าประมาณการ reconstruct${c.reset}`, `${c.dim}${ESTIMATE_NOTICE}${c.reset}`);
  for (const agent of report.agentEstimates) {
    lines.push(
      `- ${agent.modelName}: ${agent.estimatedInputTokens.toLocaleString()} tokens · ${agent.estimatedMcpToolCalls} calls · ${agent.estimatedWallClockSeconds}s · $${agent.estimatedCostUsd.toFixed(2)} · ${agent.outcomeVerdict}`,
    );
  }

  lines.push("", report.headlineWarning);
  if (report.protectionStatus !== "AXOBFUS_PROTECTED") {
    lines.push(`${c.bold}คำสั่งที่แนะนำ${c.reset}: ${report.recommendedCommand}`);
  }

  if (report.exposedItems.length > 0) {
    lines.push("", `${c.bold}พื้นผิวที่ควรตรวจทาน (${Math.min(6, report.exposedItems.length)}/${report.exposedItems.length})${c.reset}`);
    for (const item of report.exposedItems.slice(0, 6)) {
      lines.push(`- [${item.riskLevel}] ${item.name} (${item.kind}) — ${item.reason}`);
    }
  }

  return lines.join("\n");
}

export function formatProtectionResult(res: ProtectionResult): string {
  const c = ansi();
  const bEst = res.beforeAudit.agentEstimates[0]!;
  const aEst = res.afterAudit.agentEstimates[0]!;
  const tokenMult = (aEst.estimatedInputTokens / Math.max(1, bEst.estimatedInputTokens)).toFixed(1);
  const costMult = (aEst.estimatedCostUsd / Math.max(0.01, bEst.estimatedCostUsd)).toFixed(1);

  return [
    formatBanner(),
    "",
    `${c.bold}เพิ่มการป้องกันแล้ว${c.reset} (${res.elapsedMs} ms)`,
    `อินพุต: ${res.inputPath}`,
    `เอาต์พุต: ${res.outputPath}`,
    `รูปแบบ / ระดับ: ${res.detectedFormat} / ${res.intensity} · seed: ${res.seed}`,
    "",
    `${c.bold}ตัวชี้วัดการป้องกัน${c.reset}`,
    `- Decoy functions: ${res.metrics.decoyFunctionsInjected} · fake xrefs: ${res.metrics.fakeCrossReferencesCreated}`,
    `- Primitive candidates: ${res.metrics.primitiveCandidateBranchesCreated} · alias states: ${res.metrics.aliasSelectionStatesCreated.toLocaleString()}`,
    `- IPC ambiguity: ${res.metrics.ipcAmbiguitySitesInjected} · decoy routes: ${res.metrics.decoyRoutesInjected}`,
    `- Chaff manifests: ${res.metrics.chaffPayloadsEmbedded} · honey source maps: ${res.metrics.honeySourceMapsGenerated}`,
    `- Binary sections patched: ${res.metrics.binarySectionsPatched}`,
    "",
    `${c.bold}ก่อน / หลัง${c.reset} ${c.dim}(${ESTIMATE_NOTICE})${c.reset}`,
    `- Exposure: ${res.beforeAudit.exposureScore}/100 -> ${res.afterAudit.exposureScore}/100`,
    `- Examination: ${res.beforeAudit.reaSimulation.examinationStatus} -> ${res.afterAudit.reaSimulation.examinationStatus}`,
    `- Obligation nodes: ${res.beforeAudit.reaSimulation.obligationLedgerNodes} -> ${res.afterAudit.reaSimulation.obligationLedgerNodes}`,
    `- Estimated tokens: ${bEst.estimatedInputTokens.toLocaleString()} -> ${aEst.estimatedInputTokens.toLocaleString()} (${tokenMult}x)`,
    `- Estimated cost: $${bEst.estimatedCostUsd.toFixed(2)} -> $${aEst.estimatedCostUsd.toFixed(2)} (${costMult}x)`,
    `- Estimated verdict: ${bEst.outcomeVerdict} -> ${aEst.outcomeVerdict}`,
  ].join("\n");
}

export function formatVerificationReport(report: VerificationReport): string {
  const c = ansi();
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}เป้าหมาย${c.reset}: ${report.targetPath}`,
    `${c.bold}Defense score${c.reset}: ${report.defenseScore}/100 (${report.overallPassed ? "ผ่านเกณฑ์ภายใน" : "ต้องตรวจทาน"})`,
    `${c.bold}ตัวคูณโดยประมาณ${c.reset}: ${report.tokenAmplificationFactor}x tokens · ${report.costAmplificationFactor}x cost · ${report.obligationGraphExpansionFactor}x graph`,
    `${c.dim}${ESTIMATE_NOTICE}; คะแนนนี้ไม่ใช่การรับรองความปลอดภัยหรือ preimage hardness${c.reset}`,
    "",
    `${c.bold}การตรวจสอบ invariant${c.reset}`,
  ];

  for (const check of report.checks) {
    lines.push(`- [${check.passed ? "PASS" : "FAIL"}] ${check.name} (${check.targetReaComponent})`);
    lines.push(`  ${check.details}`);
  }

  return lines.join("\n");
}

export function formatBenchmarkReport(bench: BenchmarkReport): string {
  const c = ansi();
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}Benchmark ${bench.cases.length} เป้าหมาย${c.reset}`,
    `${c.dim}${ESTIMATE_NOTICE}; runtime check เป็นผลภายในเท่านั้น${c.reset}`,
    "",
  ];

  for (const item of bench.cases) {
    lines.push(
      `- ${item.title}: exposure ${item.before.exposureScore}/100 -> ${item.after.exposureScore}/100 · tokens ${item.before.estimatedTokens.toLocaleString()} -> ${item.after.estimatedTokens.toLocaleString()} · ${item.tokenMultiplier}x · runtime [${item.functionalCheckPassed ? "PASS" : "FAIL"}]`,
    );
  }

  lines.push(
    "",
    `${c.bold}รวม${c.reset}: ${bench.aggregateTokenMultiplier}x tokens · ${bench.aggregateCostMultiplier}x estimated cost`,
  );
  return lines.join("\n");
}

export function formatDoctorReport(doc: DoctorDiagnosticReport): string {
  const c = ansi();
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}สถานะความพร้อม${c.reset}: ${doc.healthy ? "PASS" : "FAIL"} · v${doc.axobfusVersion} · Node ${doc.nodeVersion} · ${doc.platform}`,
    "",
    `${c.bold}Subsystem${c.reset}`,
    `- JavaScript/TypeScript AST: ${doc.engines.javascriptAstShield}`,
    `- Electron ASAR: ${doc.engines.electronAsarPacker}`,
    `- WebAssembly: ${doc.engines.wasmBinaryShield}`,
    `- Python marshal: ${doc.engines.pythonPycMarshalShield}`,
    `- Native binary: ${doc.engines.nativeElfMachoPeShield}`,
    `- ZIP/APK archive: ${doc.engines.zipApkArchiveShield}`,
    `- SQLite runtime: ${doc.engines.sqliteRuntime}`,
    "",
    `${c.bold}Agent integration${c.reset}`,
  ];

  for (const client of doc.agentClients) {
    lines.push(
      `- ${client.displayName} (${client.id}): ${client.detected ? "detected" : "not found"} · ${client.mcpRegistered ? "MCP registered" : "MCP not registered"} · ${client.skillInstalled ? "skill installed" : "skill missing"}`,
    );
  }

  if (doc.issues.length > 0) {
    lines.push("", `${c.bold}ประเด็นที่ต้องตรวจทาน${c.reset}`, ...doc.issues.map((issue) => `- ${issue}`));
  }
  return lines.join("\n");
}

export function formatSetupReport(res: SetupRunResult): string {
  const c = ansi();
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}สถานะการติดตั้ง${c.reset}: ${res.status}`,
    res.message,
    "",
    `${c.bold}Agent registration (${res.actions.length})${c.reset}`,
  ];

  for (const action of res.actions) {
    lines.push(`- ${action.displayName} (${action.clientId}) [${action.status}]`);
    lines.push(`  Config: ${action.configPath}`);
    lines.push(`  Skill: ${action.skillPath}`);
    lines.push(`  MCP: ${action.mcpCommand} ${action.mcpArgs.join(" ")}`);
  }

  return lines.join("\n");
}

export function formatOneClickDefenseReport(rep: OneClickDefenseReport): string {
  const c = ansi();
  const lines: string[] = [
    formatBanner(),
    "",
    `${c.bold}สรุป One-Click Defense${c.reset}`,
    `อินพุต: ${rep.inputPath}`,
    `เอาต์พุต: ${rep.outputPath}`,
    `ระดับ: ${rep.intensity} · defense score: ${rep.verification.defenseScore}/100`,
    `${c.dim}${ESTIMATE_NOTICE}; คะแนนไม่ใช่การรับรองความปลอดภัย${c.reset}`,
    "",
    `${c.bold}ขั้นตอนการทำงาน${c.reset}`,
  ];

  for (const stage of rep.stages) {
    lines.push(`- [${stage.status === "passed" ? "PASS" : "WARN"}] ${stage.stage}: ${stage.headline}`);
  }

  lines.push(
    "",
    `${c.bold}Resource exhaustion${c.reset}`,
    `- REA budgets: ${rep.exhaustionSummary.reaBudgetsTripped.join(", ") || "binary-container-limits"}`,
    `- Obligation nodes: ${rep.exhaustionSummary.obligationLedgerNodesBefore} -> ${rep.exhaustionSummary.obligationLedgerNodesAfter} (${rep.verification.obligationGraphExpansionFactor}x)`,
    `- Estimated token factor: ${rep.exhaustionSummary.tokenAmplificationFactor}x · estimated cost: ~$${rep.exhaustionSummary.attackerEstimatedBillUsd.toFixed(2)}`,
    "",
    `${c.bold}Model misjudgment induction${c.reset}`,
    `- Shadow logic / honeypots: ${rep.deceptionSummary.decoyFunctionsInjected}`,
    `- Tarjan SCC xrefs: ${rep.deceptionSummary.fakeCrossReferencesCreated}`,
    `- Evidence contract lures: ${rep.deceptionSummary.chaffAndEvidenceLuresEmbedded}`,
    `- Decoy IPC / gRPC: ${rep.deceptionSummary.ipcAmbiguityAndObligationSites} / ${rep.deceptionSummary.decoyRoutesAndGrpcMethods}`,
  );

  if (rep.manifestPath) {
    lines.push("", `${c.bold}Unsigned manifest${c.reset}: ${rep.manifestPath}`);
  }

  return lines.join("\n");
}
