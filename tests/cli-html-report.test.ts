import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseCliArgs, runCli } from "../src/cli.js";
import { formatAuditReport, formatBanner } from "../src/ui/reporter.js";
import { auditTarget } from "../src/engine/auditor.js";

const tempDirs: string[] = [];
const originalNoColor = process.env.NO_COLOR;

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "axobfus-cli-html-"));
  tempDirs.push(dir);
  return dir;
}

function writeSample(dir: string): string {
  const input = join(dir, "sample.js");
  writeFileSync(input, "export function verify(key) { return key.length > 8; }\n", "utf8");
  return input;
}

afterEach(() => {
  vi.restoreAllMocks();
  if (originalNoColor === undefined) delete process.env.NO_COLOR;
  else process.env.NO_COLOR = originalNoColor;
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("CLI offline HTML reports", () => {
  it("parses --report into reportPath", () => {
    const parsed = parseCliArgs(["audit", "sample.js", "--report", "reports/audit.html"]);
    expect(parsed.command).toBe("audit");
    expect(parsed.reportPath).toBe("reports/audit.html");
  });

  it("documents only axobfus commands and removes the update package alias", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await runCli(["--help"])).toBe(0);
    const help = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(help).toContain("npx axobfus <command>");
    expect(help).toContain("--report <path>");
    expect(help).not.toMatch(/axobfus-agents|axobfus-shield|BLA|Blind LLM/);

    log.mockClear();
    expect(await runCli(["update", "--json"])).toBe(0);
    const update = JSON.parse(log.mock.calls.map((call) => call.join(" ")).join("\n")) as Record<string, string>;
    expect(update.package).toBe("axobfus");
    expect(update.packageAlias).toBeUndefined();
    expect(update.refreshSetupCommand).toBe("npx axobfus@latest setup");
    expect(update.globalUpdateCommand).toBe("npm install --global axobfus@latest");
  });

  it("writes an audit report and keeps JSON stdout machine-readable", async () => {
    const dir = makeTempDir();
    const input = writeSample(dir);
    const reportPath = join(dir, "nested", "audit.html");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli(["audit", input, "--json", "--report", reportPath]);

    expect(code).toBe(0);
    expect(existsSync(reportPath)).toBe(true);
    expect(readFileSync(reportPath, "utf8")).toMatch(/^<!doctype html>/);
    const stdout = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(stdout).not.toContain("HTML report:");
    expect(error.mock.calls.map((call) => call.join(" ")).join("\n")).toContain(
      `HTML report: ${resolve(reportPath)}`,
    );
  });

  it("writes a defense report and keeps SARIF stdout machine-readable", async () => {
    const dir = makeTempDir();
    const input = writeSample(dir);
    const reportPath = join(dir, "defense.html");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli([
      "defend",
      input,
      "--seed",
      "cli-html-report-test",
      "--sarif",
      "--report",
      reportPath,
    ]);

    expect(code).toBe(0);
    expect(readFileSync(reportPath, "utf8")).toContain("รายงานผลการป้องกัน");
    const stdout = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(() => JSON.parse(stdout)).not.toThrow();
    expect(JSON.parse(stdout).version).toBe("2.1.0");
    expect(stdout).not.toContain("HTML report:");
    expect(error.mock.calls.map((call) => call.join(" ")).join("\n")).toContain(
      `HTML report: ${resolve(reportPath)}`,
    );
  });
});

describe("terminal color safety", () => {
  it("uses plain Thai-first text for captured non-TTY output", () => {
    const dir = makeTempDir();
    const input = writeSample(dir);
    const banner = formatBanner();
    const output = formatAuditReport(auditTarget(input));

    expect(banner).toContain("AxObfus");
    expect(banner).toContain("by AlexDev");
    expect(output).toContain("เป้าหมาย");
    expect(output).not.toContain("耗");
    expect(output).not.toMatch(/[\u001b\u009b]/);
    expect(output).not.toMatch(/BLA|Blind LLM/);
  });

  it("honors NO_COLOR even when stdout is a TTY", () => {
    const descriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true });
    process.env.NO_COLOR = "1";
    try {
      expect(formatBanner()).not.toMatch(/[\u001b\u009b]/);
    } finally {
      if (descriptor) Object.defineProperty(process.stdout, "isTTY", descriptor);
      else delete (process.stdout as { isTTY?: boolean }).isTTY;
    }
  });
});
