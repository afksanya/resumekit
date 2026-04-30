import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { main } from "../src/cli.js";

test("initializes workspace and creates a version", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["init"]);
    await main(["version", "create", "frontend"]);

    const version = JSON.parse(
      await readFile(path.join(tmp, ".resumekit", "versions", "frontend.json"), "utf8")
    );

    assert.equal(version.version.name, "frontend");
    assert.equal(version.profile.name, "Your Name");
  } finally {
    process.chdir(cwd);
  }
});

test("supports shorter command aliases", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["init"]);
    await main(["new", "frontend"]);
    await main(["html", "frontend", "-t", "modern"]);
    process.env.RESUMEKIT_PDF_ENGINE = "simple";
    await main(["pdf", "frontend"]);
    await main(["add", "Example", "Engineer", "frontend"]);
    await main(["check", "frontend"]);

    const html = await readFile(path.join(tmp, ".resumekit", "exports", "frontend.html"), "utf8");
    const pdf = await stat(path.join(tmp, ".resumekit", "exports", "frontend.pdf"));
    const applications = JSON.parse(
      await readFile(path.join(tmp, ".resumekit", "applications.json"), "utf8")
    );

    assert.match(html, /#0f766e/);
    assert.ok(pdf.size > 100);
    assert.equal(applications[0].company, "Example");
    assert.equal(applications[0].role, "Engineer");
    assert.equal(applications[0].version, "frontend");
  } finally {
    delete process.env.RESUMEKIT_PDF_ENGINE;
    process.chdir(cwd);
  }
});

test("records an application", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["init"]);
    await main(["apply", "add", "--company", "Example", "--role", "Engineer", "--version", "base"]);

    const applications = JSON.parse(
      await readFile(path.join(tmp, ".resumekit", "applications.json"), "utf8")
    );

    assert.equal(applications.length, 1);
    assert.equal(applications[0].company, "Example");
    assert.equal(applications[0].version, "base");
  } finally {
    process.chdir(cwd);
  }
});

test("exports html with a template and exports pdf", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["init"]);
    await main(["export", "base", "--format", "html", "--template", "modern"]);
    process.env.RESUMEKIT_PDF_ENGINE = "simple";
    await main(["export", "base", "--format", "pdf"]);
    delete process.env.RESUMEKIT_PDF_ENGINE;

    const html = await readFile(path.join(tmp, ".resumekit", "exports", "base.html"), "utf8");
    const pdf = await stat(path.join(tmp, ".resumekit", "exports", "base.pdf"));
    const pdfText = await readFile(path.join(tmp, ".resumekit", "exports", "base.pdf"), "latin1");

    assert.match(html, /#0f766e/);
    assert.ok(pdf.size > 100);
    assert.match(pdfText, /Tm \(Example Project/);
  } finally {
    delete process.env.RESUMEKIT_PDF_ENGINE;
    process.chdir(cwd);
  }
});

test("validates a resume version", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["init"]);
    await main(["validate", "base"]);
  } finally {
    process.chdir(cwd);
  }
});

test("runs the demo command", async () => {
  const cwd = process.cwd();
  const tmp = await mkdtemp(path.join(os.tmpdir(), "resumekit-"));
  process.chdir(tmp);

  try {
    await main(["demo"]);

    const html = await readFile(path.join(tmp, ".resumekit", "exports", "base.html"), "utf8");
    assert.match(html, /Alex Chen/);
    assert.match(html, /ResumeKit/);
    assert.match(html, /Northstar Labs/);
  } finally {
    process.chdir(cwd);
  }
});
