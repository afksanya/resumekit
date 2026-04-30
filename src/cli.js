import { mkdir, readFile, writeFile, access, mkdtemp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const WORKSPACE_DIR = ".resumekit";
const VERSION_DIR = "versions";
const EXPORT_DIR = "exports";
const DEFAULT_TEMPLATE = "classic";

const TEMPLATES = {
  classic: {
    font: "Arial, sans-serif",
    text: "#172033",
    muted: "#556070",
    accent: "#2f5f9f",
    chip: "#eef2f7",
    maxWidth: "820px"
  },
  ats: {
    font: "Georgia, 'Times New Roman', serif",
    text: "#111111",
    muted: "#333333",
    accent: "#111111",
    chip: "#ffffff",
    maxWidth: "760px"
  },
  modern: {
    font: "Inter, Arial, sans-serif",
    text: "#1d2736",
    muted: "#607086",
    accent: "#0f766e",
    chip: "#e6f3f1",
    maxWidth: "860px"
  }
};

const SAMPLE_RESUME = {
  profile: {
    name: "Your Name",
    email: "you@example.com",
    phone: "",
    location: "",
    links: {
      github: "",
      portfolio: ""
    }
  },
  summary: "A concise professional summary tailored to the role.",
  education: [
    {
      school: "Example University",
      degree: "Bachelor",
      major: "Computer Science",
      start: "2021",
      end: "2025"
    }
  ],
  experience: [],
  projects: [
    {
      name: "Example Project",
      role: "Developer",
      tech: ["JavaScript", "Node.js"],
      highlights: [
        "Built a local-first resume manager MVP.",
        "Designed structured resume data that can be reused across versions."
      ]
    }
  ],
  skills: ["JavaScript", "Node.js", "Git"]
};

const DEMO_RESUME = {
  profile: {
    name: "Alex Chen",
    email: "alex.chen@example.com",
    phone: "+1 415 555 0198",
    location: "San Francisco, CA",
    links: {
      github: "https://github.com/alexchen",
      portfolio: "https://alexchen.dev"
    }
  },
  summary:
    "Frontend engineer focused on local-first productivity tools, polished user workflows, and reliable TypeScript applications.",
  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S.",
      major: "Computer Science",
      start: "2021",
      end: "2025"
    }
  ],
  experience: [
    {
      company: "Northstar Labs",
      role: "Frontend Engineer Intern",
      start: "2025-06",
      end: "2025-09",
      highlights: [
        "Built a React dashboard used by 80+ internal operators to review customer onboarding tasks.",
        "Reduced repeated API requests by 38% by introducing query caching and loading-state consolidation."
      ]
    }
  ],
  projects: [
    {
      name: "ResumeKit",
      role: "Creator",
      tech: ["Node.js", "JavaScript", "HTML", "PDF"],
      highlights: [
        "Designed a local-first CLI for managing resume versions, exports, validation, and job applications.",
        "Implemented HTML and dependency-free PDF export so users can preview a resume without setup friction."
      ]
    },
    {
      name: "Campus Market",
      role: "Full-stack Developer",
      tech: ["React", "TypeScript", "SQLite"],
      highlights: [
        "Built listing, search, and order flows for a student marketplace prototype.",
        "Added image compression before upload, cutting average upload size by 42% in testing."
      ]
    }
  ],
  skills: ["TypeScript", "React", "Node.js", "SQLite", "Git", "Product Thinking"]
};

export async function main(argv) {
  const [command, ...rest] = argv;

  switch (command) {
    case "demo":
      return runDemo();
    case "init":
      return initWorkspace();
    case "new":
      return createVersion(rest[0]);
    case "ls":
    case "versions":
      return listVersions();
    case "version":
      return handleVersion(rest);
    case "html":
      return exportResumeWithFormat(rest, "html");
    case "pdf":
      return exportResumeWithFormat(rest, "pdf");
    case "json":
      return exportResumeWithFormat(rest, "json");
    case "export":
      return exportResume(rest);
    case "add":
      return addApplication(rest);
    case "apply":
      return handleApply(rest);
    case "apps":
      return showStatus();
    case "status":
      return showStatus();
    case "check":
      return validateResume(rest);
    case "validate":
      return validateResume(rest);
    case "diff":
      return diffVersions(rest);
    case "help":
    case undefined:
      return printHelp();
    default:
      throw new Error(`Unknown command: ${command}\nRun "resumekit help" for usage.`);
  }
}

async function initWorkspace(resume = SAMPLE_RESUME) {
  const root = workspacePath();
  if (existsSync(root)) {
    throw new Error("A ResumeKit workspace already exists here.");
  }

  await mkdir(path.join(root, VERSION_DIR), { recursive: true });
  await mkdir(path.join(root, EXPORT_DIR), { recursive: true });
  await writeJson(path.join(root, "resume.json"), resume);
  await writeJson(path.join(root, VERSION_DIR, "base.json"), resume);
  await writeJson(path.join(root, "applications.json"), []);

  console.log("ResumeKit workspace created.");
  console.log(`Edit ${path.join(WORKSPACE_DIR, "resume.json")} to update your base resume.`);
}

async function runDemo() {
  if (!existsSync(workspacePath())) {
    await initWorkspace(DEMO_RESUME);
  } else {
    console.log("Using existing ResumeKit workspace.");
  }

  await exportResume(["base", "--format", "html", "--template", "modern"]);
  await validateResume(["base"]);
  console.log(`Open ${path.join(WORKSPACE_DIR, EXPORT_DIR, "base.html")} to preview the exported resume.`);
}

async function handleVersion(args) {
  const [subcommand, name] = args;
  if (subcommand === "create") {
    return createVersion(name);
  }
  if (subcommand === "list") {
    return listVersions();
  }
  throw new Error('Usage: resumekit version create <name>\n       resumekit version list');
}

async function createVersion(name) {
  assertName(name, "version name");
  await assertWorkspace();

  const target = versionPath(name);
  if (existsSync(target)) {
    throw new Error(`Version already exists: ${name}`);
  }

  const base = await readJson(path.join(workspacePath(), "resume.json"));
  await writeJson(target, {
    ...base,
    version: {
      name,
      createdAt: new Date().toISOString()
    }
  });

  console.log(`Created resume version: ${name}`);
  console.log(`Edit ${path.join(WORKSPACE_DIR, VERSION_DIR, `${name}.json`)} to tailor it.`);
}

async function listVersions() {
  await assertWorkspace();
  const versions = await import("node:fs/promises").then((fs) =>
    fs.readdir(path.join(workspacePath(), VERSION_DIR))
  );
  versions
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.basename(file, ".json"))
    .forEach((name) => console.log(name));
}

async function exportResume(args) {
  const [name, ...flags] = args;
  assertName(name, "version name");
  await assertWorkspace();

  const format = readFlag(flags, "--format", "-f") ?? "html";
  const templateName = readFlag(flags, "--template", "-t") ?? DEFAULT_TEMPLATE;
  assertTemplate(templateName);
  const resume = await readJson(versionPath(name));

  if (format === "json") {
    const output = path.join(workspacePath(), EXPORT_DIR, `${name}.json`);
    await writeJson(output, resume);
    console.log(`Exported ${output}`);
    return;
  }

  if (format === "pdf") {
    const output = path.join(workspacePath(), EXPORT_DIR, `${name}.pdf`);
    await exportPdf(resume, templateName, output);
    console.log(`Exported ${output}`);
    return;
  }

  if (format !== "html") {
    throw new Error('Unsupported export format. Use "--format html", "--format pdf", or "--format json".');
  }

  const output = path.join(workspacePath(), EXPORT_DIR, `${name}.html`);
  await writeFile(output, renderHtml(resume, templateName), "utf8");
  console.log(`Exported ${output}`);
}

async function exportResumeWithFormat(args, format) {
  const [name, ...flags] = args;
  const normalized = [name, "--format", format, ...flags];
  return exportResume(normalized);
}

async function handleApply(args) {
  const [subcommand, ...flags] = args;
  if (subcommand !== "add") {
    throw new Error(
      'Usage: resumekit add <company> <role> <version> [--status submitted] [--url <url>]\n       resumekit apply add --company <company> --role <role> --version <version> [--status submitted] [--url <url>]'
    );
  }

  return addApplication(flags);
}

async function addApplication(args) {
  await assertWorkspace();
  const positional = readPositionals(args);
  const company = readFlag(args, "--company", "-c") ?? positional[0];
  const role = readFlag(args, "--role", "-r") ?? positional[1];
  const version = readFlag(args, "--version", "-v") ?? positional[2];
  const status = readFlag(args, "--status", "-s") ?? "submitted";
  const url = readFlag(args, "--url", "-u") ?? "";

  assertName(company, "company");
  assertName(role, "role");
  assertName(version, "version");
  await access(versionPath(version));

  const applicationsPath = path.join(workspacePath(), "applications.json");
  const applications = await readJson(applicationsPath);
  applications.push({
    id: cryptoRandomId(),
    company,
    role,
    version,
    status,
    url,
    appliedAt: new Date().toISOString()
  });
  await writeJson(applicationsPath, applications);

  console.log(`Recorded application: ${company} - ${role}`);
}

async function showStatus() {
  await assertWorkspace();
  const applications = await readJson(path.join(workspacePath(), "applications.json"));
  if (applications.length === 0) {
    console.log("No applications recorded yet.");
    return;
  }

  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log("Application summary:");
  for (const [status, count] of Object.entries(counts)) {
    console.log(`- ${status}: ${count}`);
  }

  console.log("\nRecent applications:");
  applications.slice(-5).forEach((app) => {
    console.log(`- ${app.company} / ${app.role} / ${app.status} / ${app.version}`);
  });
}

async function validateResume(args) {
  const [name = "base"] = args;
  assertName(name, "version name");
  await assertWorkspace();

  const resume = await readJson(versionPath(name));
  const findings = collectValidationFindings(resume);

  if (findings.length === 0) {
    console.log(`No validation issues found for ${name}.`);
    return;
  }

  console.log(`Validation report for ${name}:`);
  for (const finding of findings) {
    console.log(`- [${finding.level}] ${finding.message}`);
  }
}

async function diffVersions(args) {
  const [leftName, rightName] = args;
  assertName(leftName, "left version");
  assertName(rightName, "right version");
  await assertWorkspace();

  const left = await readJson(versionPath(leftName));
  const right = await readJson(versionPath(rightName));
  const changes = diffObjects(left, right);

  if (changes.length === 0) {
    console.log("No differences found.");
    return;
  }

  for (const change of changes) {
    console.log(`${change.type} ${change.path}`);
    if (change.type === "changed") {
      console.log(`  - ${JSON.stringify(change.left)}`);
      console.log(`  + ${JSON.stringify(change.right)}`);
    }
  }
}

function printHelp() {
  console.log(`ResumeKit

Usage:
  resumekit demo
  resumekit init
  resumekit new <name>
  resumekit ls
  resumekit html <version> [-t classic|ats|modern]
  resumekit pdf <version> [-t classic|ats|modern]
  resumekit add <company> <role> <version> [-s submitted] [-u <url>]
  resumekit apps
  resumekit check [version]
  resumekit diff <left-version> <right-version>

Long forms:
  resumekit version create <name>
  resumekit version list
  resumekit export <version> [--format html|pdf|json] [--template classic|ats|modern]
  resumekit apply add --company <company> --role <role> --version <version> [--status submitted] [--url <url>]
  resumekit status
  resumekit validate [version]
  resumekit diff <left-version> <right-version>
`);
}

function renderHtml(resume, templateName = DEFAULT_TEMPLATE) {
  const profile = resume.profile ?? {};
  const template = TEMPLATES[templateName];
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(profile.name ?? "Resume")}</title>
  <style>
    body { color: ${template.text}; font-family: ${template.font}; line-height: 1.5; margin: 0; }
    main { margin: 40px auto; max-width: ${template.maxWidth}; padding: 0 24px; }
    h1 { font-size: 34px; margin: 0 0 6px; }
    h2 { border-bottom: 1px solid ${template.accent}; color: ${template.accent}; font-size: 18px; margin-top: 28px; padding-bottom: 6px; }
    h3 { font-size: 16px; margin-bottom: 4px; }
    p, li { font-size: 14px; }
    .meta { color: ${template.muted}; font-size: 14px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; }
    .tags li { background: ${template.chip}; border: 1px solid #d8dee9; border-radius: 4px; display: block; padding: 4px 8px; }
    @media print { body { color: #111; } main { margin: 24px auto; } }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(profile.name ?? "")}</h1>
    <div class="meta">${escapeHtml([profile.email, profile.phone, profile.location].filter(Boolean).join(" · "))}</div>
    ${section("Summary", paragraph(resume.summary))}
    ${section("Education", listItems(resume.education, renderEducation))}
    ${section("Experience", listItems(resume.experience, renderExperience))}
    ${section("Projects", listItems(resume.projects, renderProject))}
    ${section("Skills", tagList(resume.skills))}
  </main>
</body>
</html>`;
}

async function exportPdf(resume, templateName, output) {
  if (process.env.RESUMEKIT_PDF_ENGINE !== "simple") {
    const browser = await findBrowserExecutable();
    if (browser) {
      try {
        await exportPdfFromHtml(browser, renderHtml(resume, templateName), output);
        return;
      } catch (error) {
        console.warn(`HTML-to-PDF export failed, using built-in fallback: ${error.message}`);
      }
    }
  }

  await writeFile(output, renderPdf(resume));
}

async function exportPdfFromHtml(browser, html, output) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "resumekit-print-"));
  const input = path.join(dir, "resume.html");
  await writeFile(input, html, "utf8");

  await execFileAsync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--print-to-pdf=${output}`,
    pathToFileURL(input).href
  ]);
}

async function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known browser path.
    }
  }

  return null;
}

function renderPdf(resume) {
  const profile = resume.profile ?? {};
  const blocks = [
    { type: "title", text: profile.name ?? "Resume" },
    { type: "contact", text: [profile.email, profile.phone, profile.location].filter(Boolean).join(" | ") },
    { type: "section", text: "Summary" },
    { type: "body", text: resume.summary },
    { type: "section", text: "Education" },
    ...educationBlocks(resume.education),
    { type: "section", text: "Experience" },
    ...experienceBlocks(resume.experience),
    { type: "section", text: "Projects" },
    ...projectBlocks(resume.projects),
    { type: "section", text: "Skills" },
    { type: "body", text: Array.isArray(resume.skills) ? resume.skills.join(", ") : "" }
  ].filter((block) => block.text || block.left || block.detail);

  return createSimplePdf(blocks);
}

function educationBlocks(items) {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => [
    {
      type: "entry",
      left: item.school,
      right: [item.start, item.end].filter(Boolean).join(" - "),
      detail: [item.degree, item.major].filter(Boolean).join(", ")
    }
  ]);
}

function experienceBlocks(items) {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => [
    {
      type: "entry",
      left: item.company,
      right: [item.start, item.end].filter(Boolean).join(" - "),
      detail: item.role
    },
    ...(item.highlights ?? []).map((highlight) => ({ type: "bullet", text: highlight }))
  ]);
}

function projectBlocks(items) {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => [
    {
      type: "entry",
      left: item.name,
      right: item.role,
      detail: Array.isArray(item.tech) ? item.tech.join(", ") : ""
    },
    ...(item.highlights ?? []).map((highlight) => ({ type: "bullet", text: highlight }))
  ]);
}

function createSimplePdf(blocks) {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;
  const pages = [];
  let y = pageHeight - margin;
  let commands = [];

  const newPage = () => {
    pages.push(commands.join("\n"));
    commands = [];
    y = pageHeight - margin;
  };

  const ensureSpace = (height) => {
    if (y - height < margin) newPage();
  };

  const drawText = (text, x, baseline, size, font = "F1") => {
    commands.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${baseline} Tm (${escapePdfText(text)}) Tj ET`);
  };

  const drawCenteredText = (text, baseline, size, font = "F1") => {
    const x = (pageWidth - estimateTextWidth(text, size)) / 2;
    drawText(text, x, baseline, size, font);
  };

  const drawRightText = (text, baseline, size, font = "F1") => {
    const x = pageWidth - margin - estimateTextWidth(text, size);
    drawText(text, x, baseline, size, font);
  };

  const drawRule = (baseline) => {
    commands.push(`0.68 0.72 0.78 RG 0.7 w ${margin} ${baseline} m ${pageWidth - margin} ${baseline} l S`);
  };

  for (const block of blocks) {
    if (block.type === "title") {
      ensureSpace(48);
      drawCenteredText(block.text, y, 24, "F2");
      y -= 16;
      continue;
    }

    if (block.type === "contact") {
      ensureSpace(24);
      drawCenteredText(block.text, y, 9);
      y -= 17;
      drawRule(y + 4);
      y -= 10;
      continue;
    }

    if (block.type === "section") {
      ensureSpace(34);
      y -= 7;
      drawText(block.text.toUpperCase(), margin, y, 9.6, "F2");
      drawRule(y - 4);
      y -= 15;
      continue;
    }

    if (block.type === "entry") {
      const left = block.left ?? block.text ?? "";
      const right = block.right ?? "";
      const detail = block.detail ?? "";
      ensureSpace(detail ? 28 : 16);
      drawText(left, margin, y, 9.8, "F2");
      if (right) drawRightText(right, y, 9, "F2");
      y -= 11;
      if (detail) {
        drawText(detail, margin, y, 9);
        y -= 9;
      }
      y -= 1;
      continue;
    }

    const size = block.type === "entry" ? 9.8 : 9.2;
    const font = block.type === "entry" ? "F2" : "F1";
    const indent = block.type === "bullet" ? 14 : 0;
    const prefix = block.type === "bullet" ? "- " : "";
    const width = usableWidth - indent;
    const wrapped = wrapText(`${prefix}${block.text}`, size, width);
    ensureSpace(wrapped.length * 11 + 1);

    for (const [index, text] of wrapped.entries()) {
      const x = margin + (index === 0 ? indent : indent + 9);
      drawText(text, x, y, size, font);
      y -= 11;
    }
  }

  pages.push(commands.join("\n"));

  return buildPdfDocument(pages, pageWidth, pageHeight);
}

function wrapText(text, fontSize, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  const maxChars = Math.max(24, Math.floor(maxWidth / (fontSize * 0.53)));

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function estimateTextWidth(text, fontSize) {
  return String(text ?? "").length * fontSize * 0.52;
}

function buildPdfDocument(pageStreams, pageWidth, pageHeight) {
  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageIds = [];

  for (const stream of pageStreams) {
    const streamId = addObject(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${streamId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${
    pageIds.length
  } >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

function section(title, content) {
  if (!content) return "";
  return `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
}

function paragraph(text) {
  return text ? `<p>${escapeHtml(text)}</p>` : "";
}

function listItems(items, renderer) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return items.map(renderer).join("\n");
}

function renderEducation(item) {
  return `<article><h3>${escapeHtml(item.school ?? "")}</h3><p>${escapeHtml(
    [item.degree, item.major, [item.start, item.end].filter(Boolean).join(" - ")].filter(Boolean).join(" · ")
  )}</p></article>`;
}

function renderExperience(item) {
  return `<article><h3>${escapeHtml([item.company, item.role].filter(Boolean).join(" - "))}</h3>${bulletList(
    item.highlights
  )}</article>`;
}

function renderProject(item) {
  return `<article><h3>${escapeHtml(item.name ?? "")}</h3><p>${escapeHtml(
    [item.role, Array.isArray(item.tech) ? item.tech.join(", ") : ""].filter(Boolean).join(" · ")
  )}</p>${bulletList(item.highlights)}</article>`;
}

function bulletList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function tagList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul class="tags">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function collectValidationFindings(resume) {
  const findings = [];
  const profile = resume.profile ?? {};

  if (!profile.name || profile.name === SAMPLE_RESUME.profile.name) {
    findings.push({ level: "error", message: "Profile name is missing or still uses the sample value." });
  }
  if (!profile.email || !profile.email.includes("@")) {
    findings.push({ level: "error", message: "Profile email is missing or invalid." });
  }
  if (!resume.summary || resume.summary.length < 40) {
    findings.push({ level: "warning", message: "Summary should be at least 40 characters." });
  }
  if (!Array.isArray(resume.projects) || resume.projects.length === 0) {
    findings.push({ level: "warning", message: "Add at least one project." });
  }
  for (const [index, project] of (resume.projects ?? []).entries()) {
    if (!Array.isArray(project.highlights) || project.highlights.length < 2) {
      findings.push({
        level: "warning",
        message: `Project ${index + 1} should include at least two impact-focused highlights.`
      });
    }
  }
  if (!Array.isArray(resume.skills) || resume.skills.length < 3) {
    findings.push({ level: "warning", message: "Add at least three skills." });
  }

  return findings;
}

function diffObjects(left, right, prefix = "") {
  if (JSON.stringify(left) === JSON.stringify(right)) return [];
  if (!isObject(left) || !isObject(right)) {
    return [{ type: "changed", path: prefix || "root", left, right }];
  }

  const changes = [];
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (!(key in left)) {
      changes.push({ type: "added", path: nextPath, right: right[key] });
    } else if (!(key in right)) {
      changes.push({ type: "removed", path: nextPath, left: left[key] });
    } else {
      changes.push(...diffObjects(left[key], right[key], nextPath));
    }
  }
  return changes;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readFlag(args, ...flags) {
  const index = args.findIndex((arg) => flags.includes(arg));
  return index >= 0 ? args[index + 1] : undefined;
}

function readPositionals(args) {
  const positionals = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index].startsWith("-")) {
      index += 1;
      continue;
    }
    positionals.push(args[index]);
  }
  return positionals;
}

function assertName(value, label) {
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing ${label}.`);
  }
}

function assertTemplate(templateName) {
  if (!TEMPLATES[templateName]) {
    throw new Error(
      `Unknown template: ${templateName}. Available templates: ${Object.keys(TEMPLATES).join(", ")}.`
    );
  }
}

async function assertWorkspace() {
  if (!existsSync(workspacePath())) {
    throw new Error('No ResumeKit workspace found. Run "resumekit init" first.');
  }
}

function workspacePath() {
  return path.join(process.cwd(), WORKSPACE_DIR);
}

function versionPath(name) {
  return path.join(workspacePath(), VERSION_DIR, `${name}.json`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapePdfText(value) {
  return String(value ?? "")
    .replace(/[^\x00-\x7F]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function cryptoRandomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const directRunPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = fileURLToPath(import.meta.url);
if (directRunPath === modulePath) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
