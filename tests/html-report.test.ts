import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  AuditReport,
  ProtectionResult,
  VerificationReport,
} from "../src/core/types.js";
import type { OneClickDefenseReport } from "../src/engine/defender.js";
import {
  renderAuditHtmlReport,
  renderDefenseHtmlReport,
  writeHtmlReport,
} from "../src/ui/html-report.js";

function auditFixture(overrides: Partial<AuditReport> = {}): AuditReport {
  return {
    targetPath: "/workspace/src/payment-engine.ts",
    detectedFormat: "typescript",
    sha256: "a".repeat(64),
    byteSize: 42_120,
    timestamp: "2026-11-02T09:00:00.000Z",
    exposureScore: 72,
    protectionStatus: "UNPROTECTED",
    reaSimulation: {
      parseStatus: "complete",
      examinationStatus: "complete",
      triggeredResourceLimits: ["call-graph-node-budget"],
      semanticUncertainties: [],
      visitedAstNodes: 1_200,
      totalFunctions: 18,
      decoyFunctionsDetectedAsReal: 0,
      staticStringsResolved: 22,
      staticStringsOpaque: 3,
      ipcChannelsTotal: 2,
      ipcChannelsPairedUniquely: 1,
      ipcChannelsAmbiguousOrDynamic: 1,
      routesDiscovered: 4,
      decoyRoutesHarvested: 0,
      obligationLedgerNodes: 24,
      architecturalChaffPayloads: 0,
    },
    exposedItems: [
      {
        id: "payment.verify",
        name: "verifyEnterpriseLicense",
        kind: "function",
        location: "src/payment-engine.ts:4",
        riskLevel: "high",
        reaToolUsed: "js-static-semantics",
        estimatedTokensToReconstruct: 850,
        estimatedCostUsd: 0.08,
        reason: "Exported license decision is visible in the source.",
      },
    ],
    vulnerableReaVectors: ["js-static-semantics", "call-graph-tracing"],
    agentEstimates: [
      {
        modelName: "Internal reference model",
        estimatedInputTokens: 12_500,
        estimatedOutputTokens: 2_400,
        estimatedMcpToolCalls: 18,
        estimatedWallClockSeconds: 95,
        estimatedCostUsd: 0.75,
        contextWindowOverflowProbability: 0.12,
        outcomeVerdict: "MODERATE_EFFORT",
      },
    ],
    headlineWarning: "Review the exposed license path.",
    recommendedCommand: "axobfus defend ./src/payment-engine.ts",
    ...overrides,
  };
}

function defenseFixture(): OneClickDefenseReport {
  const beforeAudit = auditFixture({
    exposureScore: 91,
    agentEstimates: [
      {
        ...auditFixture().agentEstimates[0]!,
        estimatedInputTokens: 1_000,
        estimatedCostUsd: 0.5,
      },
    ],
  });
  const afterAudit = auditFixture({
    exposureScore: 8,
    protectionStatus: "AXOBFUS_PROTECTED",
    reaSimulation: {
      ...auditFixture().reaSimulation,
      examinationStatus: "limited",
      triggeredResourceLimits: ["semantic-budget", "call-graph-node-budget"],
      obligationLedgerNodes: 480,
    },
    agentEstimates: [
      {
        ...auditFixture().agentEstimates[0]!,
        estimatedInputTokens: 18_000,
        estimatedCostUsd: 12,
      },
    ],
  });
  const protection: ProtectionResult = {
    inputPath: beforeAudit.targetPath,
    outputPath: "/workspace/defended/payment-engine.ts",
    detectedFormat: "typescript",
    intensity: "bankrupt",
    seed: "test-seed",
    originalSha256: beforeAudit.sha256,
    protectedSha256: "b".repeat(64),
    metrics: {
      originalBytes: beforeAudit.byteSize,
      protectedBytes: 88_000,
      decoyFunctionsInjected: 42,
      fakeCrossReferencesCreated: 126,
      primitiveCandidateBranchesCreated: 300,
      aliasSelectionStatesCreated: 600,
      ipcAmbiguitySitesInjected: 7,
      decoyRoutesInjected: 9,
      chaffPayloadsEmbedded: 11,
      honeySourceMapsGenerated: 1,
      binarySectionsPatched: 0,
    },
    counteredReaVectors: ["js-static-semantics"],
    beforeAudit,
    afterAudit,
    elapsedMs: 125,
  };
  const verification: VerificationReport = {
    targetPath: protection.outputPath,
    originalPath: protection.inputPath,
    detectedFormat: "typescript",
    overallPassed: true,
    defenseScore: 96,
    checks: [
      {
        id: "semantic-budget-check",
        name: "Semantic budget invariant",
        targetReaComponent: "call graph",
        passed: true,
        details: "The internal structural invariant passed.",
      },
      {
        id: "runtime-check",
        name: "Runtime smoke check",
        targetReaComponent: "runtime",
        passed: false,
        details: "Independent runtime testing is still required.",
      },
    ],
    tokenAmplificationFactor: 18,
    costAmplificationFactor: 24,
    obligationGraphExpansionFactor: 20,
    functionalIntegrityVerified: false,
  };

  return {
    axobfusVersion: "0.1.0",
    inputPath: beforeAudit.targetPath,
    outputPath: protection.outputPath,
    intensity: "bankrupt",
    weaveDecoys: false,
    overallSuccess: true,
    stages: [
      {
        stage: "2-preflight-rea-audit",
        status: "passed",
        headline: "Baseline audit completed.",
      },
      {
        stage: "4-counter-rea-invariant-verification",
        status: "warn",
        headline: "Independent runtime checks remain necessary.",
      },
    ],
    releaseExposure: null,
    beforeAudit,
    protection,
    verification,
    exhaustionSummary: {
      reaBudgetsTripped: afterAudit.reaSimulation.triggeredResourceLimits,
      obligationLedgerNodesBefore: 24,
      obligationLedgerNodesAfter: 480,
      tokenAmplificationFactor: 18,
      costAmplificationFactor: 24,
      attackerEstimatedBillUsd: 12,
    },
    deceptionSummary: {
      decoyFunctionsInjected: 42,
      fakeCrossReferencesCreated: 126,
      chaffAndEvidenceLuresEmbedded: 11,
      ipcAmbiguityAndObligationSites: 7,
      decoyRoutesAndGrpcMethods: 9,
    },
  };
}

describe("standalone HTML reports", () => {
  it("escapes malicious target paths, item names, and other dynamic strings", () => {
    const maliciousPath = '"><img src=x onerror=alert(1)><script>alert("path")</script>';
    const maliciousName = "</td><script>alert('name')</script><svg onload=alert(1)>";
    const base = auditFixture();
    const html = renderAuditHtmlReport(
      auditFixture({
        targetPath: maliciousPath,
        headlineWarning: '<img src=x onerror="alert(2)">',
        recommendedCommand: 'axobfus defend "<script>alert(3)</script>"',
        exposedItems: [
          {
            ...base.exposedItems[0]!,
            name: maliciousName,
            location: '"><script>alert("location")</script>',
            reason: "<script>alert('reason')</script>",
          },
        ],
      }),
    );

    expect(html).not.toContain(maliciousPath);
    expect(html).not.toContain(maliciousName);
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<svg onload=");
    expect(html).toContain("&quot;&gt;&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;name&#39;)&lt;/script&gt;");
    expect(html).toContain("&lt;script&gt;alert(&#39;reason&#39;)&lt;/script&gt;");
    expect(html).toContain("axobfus defend &quot;&lt;script&gt;alert(3)&lt;/script&gt;&quot;");
  });

  it("renders before/after exposure, decoys, and estimated multipliers", () => {
    const html = renderDefenseHtmlReport(defenseFixture());

    expect(html).toContain("91 / 100");
    expect(html).toContain("8 / 100");
    expect(html).toContain("1,000");
    expect(html).toContain("18,000");
    expect(html).toContain("$0.50");
    expect(html).toContain("$12.00");
    expect(html).toContain("18.00×");
    expect(html).toContain("24.00×");
    expect(html).toContain("ฟังก์ชันล่อที่เพิ่ม");
    expect(html).toContain("126");
    expect(html).toContain("ค่าประมาณภายใน");
    expect(html).toContain("Semantic budget invariant");
    expect(html).toContain("Runtime smoke check");
    expect(html).toContain("ข้อควรทราบเรื่องความเท่าเทียมของรันไทม์");
    expect(html).toContain("functionalIntegrityVerified = false");
  });

  it("contains no scripts or remote resource dependencies", () => {
    const auditHtml = renderAuditHtmlReport(auditFixture());
    const defenseHtml = renderDefenseHtmlReport(defenseFixture());

    for (const html of [auditHtml, defenseHtml]) {
      expect(html).toMatch(/^<!doctype html>/);
      expect(html).toContain('<html lang="th">');
      expect(html).toContain("<style>");
      expect(html).toContain("<svg");
      expect(html).not.toMatch(/<script\b/i);
      expect(html).not.toMatch(/<(?:link|iframe|img)\b/i);
      expect(html).not.toMatch(/\s(?:src|href)\s*=/i);
      expect(html).not.toMatch(/@import|url\s*\(/i);
    }
  });

  it("creates parent directories and writes exact UTF-8 content", () => {
    const dir = mkdtempSync(join(tmpdir(), "axobfus-html-report-test-"));
    try {
      const outputPath = join(dir, "nested", "reports", "ผลการตรวจสอบ.html");
      const html = '<!doctype html><html lang="th"><body>รายงาน AxObfus — ทดสอบ</body></html>';

      writeHtmlReport(outputPath, html);

      expect(readFileSync(outputPath, "utf8")).toBe(html);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
