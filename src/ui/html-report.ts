import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AuditReport } from "../core/types.js";
import type { OneClickDefenseReport } from "../engine/defender.js";

const ESTIMATE_NOTICE =
  "ค่าประมาณภายจากแบบจำลองภายในของ AxObfus เท่านั้น ไม่ใช่ผลวัดเชิงประจักษ์หรือการทดสอบ REA จริง";

function escapeHtml(value: string | number | boolean): string {
  return String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function formatInteger(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("en-US") : "—";
}

function formatDecimal(value: number, digits = 2): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function detailList(entries: ReadonlyArray<readonly [string, string]>): string {
  return `<dl class="details">${entries
    .map(
      ([label, value]) =>
        `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`,
    )
    .join("")}</dl>`;
}

function dataTable(headers: readonly string[], rows: ReadonlyArray<readonly string[]>): string {
  return `<div class="table-wrap"><table><thead><tr>${headers
    .map((header) => `<th scope="col">${escapeHtml(header)}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}

function bulletList(items: readonly string[], emptyMessage: string): string {
  if (items.length === 0) {
    return `<p class="empty">${escapeHtml(emptyMessage)}</p>`;
  }
  return `<ul class="plain-list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function metric(label: string, value: string, note = ""): string {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${
    note ? `<small>${escapeHtml(note)}</small>` : ""
  }</div>`;
}

function documentShell(title: string, eyebrow: string, content: string): string {
  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
<style>
:root{--paper:#f7f6f2;--surface:#fff;--ink:#20201e;--muted:#65645f;--line:#d8d5cd;--signal:#d92d20;--soft:#f0eee8}
*{box-sizing:border-box}html{background:var(--paper);color:var(--ink);font-family:"Noto Sans Thai","Leelawadee UI",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.55}body{margin:0}.page{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:36px 0 56px}.masthead{display:flex;align-items:center;justify-content:space-between;gap:24px;padding-bottom:24px;border-bottom:2px solid var(--ink)}.brand{display:flex;align-items:center;gap:14px}.brand-name{font-size:24px;font-weight:800;letter-spacing:-.04em}.brand-by{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase}.doc-type{text-align:right;color:var(--muted);font-size:12px;letter-spacing:.12em;text-transform:uppercase}.hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:end;padding:42px 0 28px}.eyebrow{margin:0 0 8px;color:var(--signal);font-size:12px;font-weight:750;letter-spacing:.14em;text-transform:uppercase}h1{max-width:780px;margin:0;font-size:clamp(32px,5vw,58px);font-weight:780;letter-spacing:-.045em;line-height:1.04}.edition{margin:0;color:var(--muted);font-size:13px}.notice{border-left:3px solid var(--signal);padding:10px 16px;color:var(--muted);font-size:13px}.section{padding:30px 0;border-top:1px solid var(--line)}.section-head{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px;margin-bottom:20px}h2{margin:0;font-size:20px;letter-spacing:-.02em}h3{margin:0 0 12px;font-size:14px}.section-description{max-width:700px;margin:0;color:var(--muted);font-size:14px}.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;border-top:1px solid var(--line)}.details>div{display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}.details>div:nth-child(odd){padding-right:24px}.details>div:nth-child(even){padding-left:24px;border-left:1px solid var(--line)}dt{color:var(--muted);font-size:13px}dd{min-width:0;margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;overflow-wrap:anywhere;word-break:break-word}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}.metric{min-width:0;padding:20px;border-right:1px solid var(--line)}.metric:first-child{padding-left:0}.metric:last-child{border-right:0}.metric>span,.metric>small{display:block;color:var(--muted);font-size:12px}.metric>strong{display:block;margin:8px 0 4px;font-size:clamp(24px,3vw,38px);letter-spacing:-.04em;line-height:1.1;overflow-wrap:anywhere}.metric>strong.accent{color:var(--signal)}.table-wrap{overflow-x:auto;border-top:1px solid var(--ink)}table{width:100%;border-collapse:collapse;text-align:left;font-size:13px}th{padding:11px 14px;color:var(--muted);font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}td{padding:13px 14px;border-top:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}th:first-child,td:first-child{padding-left:0}th:last-child,td:last-child{padding-right:0}.plain-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;margin:0;padding:0;list-style:none}.plain-list li{padding:9px 0 9px 16px;border-bottom:1px solid var(--line);position:relative;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;overflow-wrap:anywhere}.plain-list li:before{content:"";position:absolute;left:0;top:17px;width:5px;height:5px;background:var(--signal)}.callout{padding:18px 20px;background:var(--soft);border-left:3px solid var(--ink)}.callout p{margin:0}.callout p+p{margin-top:8px}.callout code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}.checks{display:grid;gap:0;border-top:1px solid var(--ink)}.check{display:grid;grid-template-columns:92px minmax(0,1fr);gap:20px;padding:18px 0;border-bottom:1px solid var(--line)}.status{display:inline-block;align-self:start;padding:3px 8px;border:1px solid currentColor;font-size:10px;font-weight:800;letter-spacing:.08em;text-align:center}.status-pass{color:#276443}.status-warn{color:#a13716}.check h3{margin-bottom:3px}.check-meta{margin:0 0 7px;color:var(--muted);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;overflow-wrap:anywhere}.check-details{margin:0;font-size:13px;overflow-wrap:anywhere}.empty{color:var(--muted);font-size:13px}.footnote{margin-top:28px;padding-top:18px;border-top:1px solid var(--ink);color:var(--muted);font-size:11px}.two-column{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}
@media(max-width:800px){.page{width:min(100% - 28px,1180px);padding-top:20px}.hero{grid-template-columns:1fr;gap:12px;padding-top:30px}.section-head{grid-template-columns:1fr;gap:8px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metric:nth-child(2){border-right:0}.metric:nth-child(n+3){border-top:1px solid var(--line)}.metric:nth-child(3){padding-left:0}.details{grid-template-columns:1fr}.details>div:nth-child(odd){padding-right:0}.details>div:nth-child(even){padding-left:0;border-left:0}.plain-list,.two-column{grid-template-columns:1fr}.doc-type{display:none}}
@media(max-width:480px){.details>div{grid-template-columns:1fr;gap:3px}.metrics{grid-template-columns:1fr}.metric,.metric:nth-child(3){padding-left:0;border-right:0;border-top:1px solid var(--line)}.metric:first-child{border-top:0}.check{grid-template-columns:1fr;gap:10px}.brand-name{font-size:21px}}
@media print{html{background:#fff}.page{width:100%;padding:0}.section{break-inside:avoid}.table-wrap{overflow:visible}.notice,.callout{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
</head>
<body>
<main class="page">
<header class="masthead">
<div class="brand">
<svg width="44" height="44" viewBox="0 0 44 44" role="img" aria-label="AxObfus">
<rect x="1" y="1" width="42" height="42" fill="#d92d20"/>
<path d="M10 32L20 11L30 32M14 25H26M30 11V32" fill="none" stroke="#20201e" stroke-width="2.4"/>
</svg>
<div><span class="brand-name">AxObfus</span><span class="brand-by">by AlexDev</span></div>
</div>
<div class="doc-type">Counter-REA defensive toolkit<br>Offline report</div>
</header>
<section class="hero"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1></div><p class="edition">สร้างเพื่อเปิดอ่านแบบออฟไลน์<br>ไม่มีสคริปต์หรือทรัพยากรภายนอก</p></section>
${content}
<footer class="footnote">AxObfus by AlexDev · เอกสารนี้เป็นสรุปการตรวจสอบเชิงป้องกัน ไม่ใช่การรับรองความปลอดภัยสมบูรณ์</footer>
</main>
</body>
</html>`;
}

export function renderAuditHtmlReport(report: AuditReport): string {
  const simulation = report.reaSimulation;
  const estimates = report.agentEstimates.map((estimate) => [
    estimate.modelName,
    formatInteger(estimate.estimatedInputTokens),
    formatInteger(estimate.estimatedOutputTokens),
    formatInteger(estimate.estimatedMcpToolCalls),
    `${formatInteger(estimate.estimatedWallClockSeconds)} วินาที`,
    `$${formatDecimal(estimate.estimatedCostUsd)}`,
    `${formatDecimal(estimate.contextWindowOverflowProbability * 100, 1)}%`,
    estimate.outcomeVerdict,
  ]);

  const exposedItems = report.exposedItems.map((item) => [
    item.name,
    `${item.kind} · ${item.riskLevel}`,
    item.location,
    item.reaToolUsed,
    formatInteger(item.estimatedTokensToReconstruct),
    `$${formatDecimal(item.estimatedCostUsd)}`,
    item.reason,
  ]);

  const content = `
<section class="notice">${ESTIMATE_NOTICE}</section>
<section class="section" aria-labelledby="audit-target">
<div class="section-head"><h2 id="audit-target">เป้าหมายที่ตรวจสอบ</h2><p class="section-description">ข้อมูลอาร์ติแฟกต์และลายนิ้วมือที่ใช้ระบุชุดข้อมูลในรายงานนี้</p></div>
${detailList([
  ["เส้นทางเป้าหมาย", report.targetPath],
  ["รูปแบบที่ตรวจพบ", report.detectedFormat],
  ["ขนาด", `${formatInteger(report.byteSize)} ไบต์`],
  ["SHA-256", report.sha256],
  ["เวลาที่ตรวจสอบ", report.timestamp],
  ["สถานะการป้องกัน", report.protectionStatus],
])}
</section>
<section class="section" aria-labelledby="audit-exposure">
<div class="section-head"><h2 id="audit-exposure">ภาพรวมการเปิดเผย</h2><p class="section-description">คะแนน 0 หมายถึงเปิดเผยน้อยที่สุดในแบบจำลอง และ 100 หมายถึงเปิดเผยมากที่สุด</p></div>
<div class="metrics">
${metric("คะแนนการเปิดเผย", `${formatInteger(report.exposureScore)} / 100`)}
${metric("สถานะการตรวจสอบ", simulation.examinationStatus)}
${metric("โหนดภาระผูกพัน", formatInteger(simulation.obligationLedgerNodes))}
${metric("รายการที่เปิดเผย", formatInteger(report.exposedItems.length))}
</div>
</section>
<section class="section" aria-labelledby="audit-limits">
<div class="section-head"><h2 id="audit-limits">ข้อจำกัดที่ถูกกระตุ้น</h2><p class="section-description">ข้อจำกัดทรัพยากรที่แบบจำลองการตรวจสอบรายงาน ไม่ใช่ผลการโจมตีจริง</p></div>
${bulletList(simulation.triggeredResourceLimits, "ไม่มีข้อจำกัดที่ถูกกระตุ้น")}
</section>
<section class="section" aria-labelledby="audit-estimates">
<div class="section-head"><h2 id="audit-estimates">ค่าประมาณภายใน</h2><p class="section-description">${ESTIMATE_NOTICE} ตัวเลขโทเคน ค่าใช้จ่าย เวลา และความน่าจะเป็นไม่ควรใช้เป็นผลวัดประสิทธิภาพจริง</p></div>
${estimates.length > 0
  ? dataTable(
      ["โมเดล", "โทเคนขาเข้า", "โทเคนขาออก", "การเรียกเครื่องมือ", "เวลาโดยประมาณ", "ค่าใช้จ่ายโดยประมาณ", "โอกาสล้นบริบท", "ผลลัพธ์โดยประมาณ"],
      estimates,
    )
  : '<p class="empty">ไม่มีค่าประมาณสำหรับรายงานนี้</p>'}
</section>
<section class="section" aria-labelledby="audit-surface">
<div class="section-head"><h2 id="audit-surface">พื้นผิวที่เปิดเผย</h2><p class="section-description">รายการสัญลักษณ์ โมดูล และจุดเชื่อมต่อที่ควรตรวจทาน ค่าโทเคนและค่าใช้จ่ายในตารางเป็นค่าประมาณภายใน</p></div>
${exposedItems.length > 0
  ? dataTable(
      ["ชื่อ", "ชนิด / ความเสี่ยง", "ตำแหน่ง", "เครื่องมือ", "โทเคนโดยประมาณ", "ค่าใช้จ่ายโดยประมาณ", "เหตุผล"],
      exposedItems,
    )
  : '<p class="empty">ไม่พบรายการพื้นผิวที่เปิดเผย</p>'}
</section>
<section class="section" aria-labelledby="audit-vectors">
<div class="section-head"><h2 id="audit-vectors">เวกเตอร์ที่มีช่องโหว่</h2><p class="section-description">รหัสเวกเตอร์ที่ระบบตรวจพบจากอาร์ติแฟกต์นี้</p></div>
${bulletList(report.vulnerableReaVectors, "ไม่พบเวกเตอร์ที่มีช่องโหว่")}
</section>
<section class="section" aria-labelledby="audit-recommendation">
<div class="section-head"><h2 id="audit-recommendation">ข้อสังเกตและคำแนะนำ</h2></div>
<div class="callout"><p>${escapeHtml(report.headlineWarning)}</p><p>คำสั่งที่แนะนำ: <code>${escapeHtml(report.recommendedCommand)}</code></p></div>
</section>`;

  return documentShell("รายงานการตรวจสอบการเปิดเผย", "Audit / การตรวจสอบ", content);
}

export function renderDefenseHtmlReport(report: OneClickDefenseReport): string {
  const before = report.beforeAudit;
  const after = report.protection.afterAudit;
  const beforeEstimate = before.agentEstimates[0];
  const afterEstimate = after.agentEstimates[0];

  const beforeAfterRows = [
    ["คะแนนการเปิดเผย", `${formatInteger(before.exposureScore)} / 100`, `${formatInteger(after.exposureScore)} / 100`],
    ["สถานะการป้องกัน", before.protectionStatus, after.protectionStatus],
    ["สถานะการตรวจสอบ", before.reaSimulation.examinationStatus, after.reaSimulation.examinationStatus],
    ["โหนดภาระผูกพัน", formatInteger(before.reaSimulation.obligationLedgerNodes), formatInteger(after.reaSimulation.obligationLedgerNodes)],
    [
      "โทเคนขาเข้าโดยประมาณ",
      beforeEstimate ? formatInteger(beforeEstimate.estimatedInputTokens) : "—",
      afterEstimate ? formatInteger(afterEstimate.estimatedInputTokens) : "—",
    ],
    [
      "ค่าใช้จ่ายโดยประมาณ",
      beforeEstimate ? `$${formatDecimal(beforeEstimate.estimatedCostUsd)}` : "—",
      afterEstimate ? `$${formatDecimal(afterEstimate.estimatedCostUsd)}` : "—",
    ],
  ];

  const decoyRows = [
    ["ฟังก์ชันล่อที่เพิ่ม", formatInteger(report.deceptionSummary.decoyFunctionsInjected)],
    ["การอ้างอิงข้ามปลอม", formatInteger(report.deceptionSummary.fakeCrossReferencesCreated)],
    ["Chaff และหลักฐานล่อ", formatInteger(report.deceptionSummary.chaffAndEvidenceLuresEmbedded)],
    ["จุดกำกวม IPC และภาระผูกพัน", formatInteger(report.deceptionSummary.ipcAmbiguityAndObligationSites)],
    ["เส้นทางล่อและเมธอด gRPC", formatInteger(report.deceptionSummary.decoyRoutesAndGrpcMethods)],
  ];

  const checks = report.verification.checks
    .map(
      (check) => `<article class="check"><span class="status ${check.passed ? "status-pass" : "status-warn"}">${check.passed ? "ผ่าน" : "ไม่ผ่าน"}</span><div><h3>${escapeHtml(check.name)}</h3><p class="check-meta">${escapeHtml(check.id)} · ${escapeHtml(check.targetReaComponent)}</p><p class="check-details">${escapeHtml(check.details)}</p></div></article>`,
    )
    .join("");

  const stages = report.stages.map((stage) => [
    stage.stage,
    stage.status === "passed" ? "ผ่าน" : "คำเตือน",
    stage.headline,
  ]);

  const content = `
<section class="notice">${ESTIMATE_NOTICE} การลดคะแนนหรือเพิ่มตัวคูณไม่ได้พิสูจน์ความทนทานต่อการวิเคราะห์ย้อนกลับจริง</section>
<section class="section" aria-labelledby="defense-target">
<div class="section-head"><h2 id="defense-target">งานป้องกัน</h2><p class="section-description">สรุปอินพุต เอาต์พุต และผลการตรวจสอบจากกระบวนการ One-Click Defense</p></div>
${detailList([
  ["อินพุต", report.inputPath],
  ["เอาต์พุตที่ป้องกันแล้ว", report.outputPath],
  ["รูปแบบ", report.protection.detectedFormat],
  ["ระดับการป้องกัน", report.intensity],
  ["เวอร์ชัน AxObfus", report.axobfusVersion],
  ["ผลรวม", report.overallSuccess ? "ผ่าน" : "ต้องตรวจทาน"],
  ["คะแนนป้องกัน", `${formatInteger(report.verification.defenseScore)} / 100`],
  ["ไฟล์ manifest", report.manifestPath ?? "ไม่ได้สร้าง"],
])}
</section>
<section class="section" aria-labelledby="defense-impact">
<div class="section-head"><h2 id="defense-impact">ก่อนและหลังการป้องกัน</h2><p class="section-description">เปรียบเทียบผลจากการตรวจสอบภายในชุดเดียวกัน โทเคนและค่าใช้จ่ายเป็นค่าประมาณ ไม่ใช่การวัด REA จริง</p></div>
<div class="metrics">
${metric("การเปิดเผยก่อน", `${formatInteger(before.exposureScore)} / 100`)}
${metric("การเปิดเผยหลัง", `${formatInteger(after.exposureScore)} / 100`)}
${metric("ตัวคูณโทเคนโดยประมาณ", `${formatDecimal(report.exhaustionSummary.tokenAmplificationFactor)}×`, "ค่าประมาณภายใน")}
${metric("ตัวคูณต้นทุนโดยประมาณ", `${formatDecimal(report.exhaustionSummary.costAmplificationFactor)}×`, "ค่าประมาณภายใน")}
</div>
<div style="height:24px"></div>
${dataTable(["ตัวชี้วัด", "ก่อน", "หลัง"], beforeAfterRows)}
</section>
<section class="section" aria-labelledby="defense-decoys">
<div class="section-head"><h2 id="defense-decoys">ตัวชี้วัด decoy</h2><p class="section-description">จำนวนโครงสร้างล่อที่เพิ่มระหว่างการป้องกัน ไม่ใช่หลักฐานว่าผู้วิเคราะห์จะตีความโครงสร้างเหล่านี้ผิดเสมอไป</p></div>
${dataTable(["โครงสร้าง", "จำนวน"], decoyRows)}
</section>
<section class="section" aria-labelledby="defense-limits">
<div class="section-head"><h2 id="defense-limits">ข้อจำกัดที่ถูกกระตุ้นหลังป้องกัน</h2><p class="section-description">รายการจากแบบจำลองหลังการป้องกัน ค่าใช้จ่ายผู้โจมตีโดยประมาณ: $${escapeHtml(formatDecimal(report.exhaustionSummary.attackerEstimatedBillUsd))}</p></div>
${bulletList(after.reaSimulation.triggeredResourceLimits, "ไม่มีข้อจำกัดที่ถูกกระตุ้น")}
</section>
<section class="section" aria-labelledby="defense-verification">
<div class="section-head"><h2 id="defense-verification">การตรวจสอบ</h2><p class="section-description">ผลการตรวจสอบ invariant และความสมบูรณ์ตามเงื่อนไขภายในของ AxObfus</p></div>
${checks || '<p class="empty">ไม่มีรายการตรวจสอบ</p>'}
<div class="callout" style="margin-top:20px"><p><strong>ข้อควรทราบเรื่องความเท่าเทียมของรันไทม์:</strong> สถานะ functionalIntegrityVerified = ${escapeHtml(String(report.verification.functionalIntegrityVerified))} เป็นผลจากการตรวจสอบภายในเท่านั้น ไม่ใช่หลักฐานเชิงประจักษ์ว่าโปรแกรมก่อนและหลังป้องกันทำงานเท่าเทียมกันในทุกสภาพแวดล้อมหรือทุกกรณี ผู้ใช้ต้องทดสอบการทำงานจริง การทดสอบ regression และ runtime ที่ใช้งานจริงแยกต่างหาก</p></div>
</section>
<section class="section" aria-labelledby="defense-stages">
<div class="section-head"><h2 id="defense-stages">ขั้นตอนการทำงาน</h2><p class="section-description">บันทึกสถานะจากกระบวนการป้องกันแต่ละขั้นตอน</p></div>
${stages.length > 0 ? dataTable(["ขั้นตอน", "สถานะ", "รายละเอียด"], stages) : '<p class="empty">ไม่มีข้อมูลขั้นตอน</p>'}
</section>`;

  return documentShell("รายงานผลการป้องกัน", "Defense / ผลการป้องกัน", content);
}

export function writeHtmlReport(outputPath: string, html: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, "utf8");
}
