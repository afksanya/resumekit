# ResumeKit

English | [中文](#resumekit-中文)

ResumeKit is a local-first resume version manager and job application tracker.

It helps job seekers keep structured resume content, create role-specific resume versions, export readable resumes, compare versions, and remember which resume was sent to which company.

## Why

Many people end up with files like:

- `resume-final.pdf`
- `resume-final-v2.pdf`
- `resume-for-frontend-role.pdf`
- `resume-for-company-x-new.pdf`

ResumeKit treats resumes more like code: structured, versioned, comparable, and easy to reuse.

## Current Features

- Initialize a local resume workspace
- Store resume content as JSON
- Create named resume versions
- Export a version to HTML, PDF, or JSON
- Choose from `classic`, `ats`, and `modern` templates for HTML and PDF
- Record job applications
- Show application status summary
- Validate resume completeness
- Compare two resume versions

## Quick Start

Try the full demo first:

```bash
node ./bin/resumekit.js demo
```

This creates a local `.resumekit` workspace with a realistic demo resume, exports it to HTML, and checks what needs to be filled in.

The walkthrough below uses `node /path/to/resumekit/bin/resumekit.js` because ResumeKit is currently run from a local checkout. Replace `/path/to/resumekit` with the path to this repository. After publishing, the same commands can be shortened to `resumekit ...`.

## Complete Walkthrough

```bash
mkdir my-resume
cd my-resume
node /path/to/resumekit/bin/resumekit.js init
```

This creates a local ResumeKit workspace:

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

Edit your base resume:

```bash
$EDITOR .resumekit/resume.json
```

Replace the sample name, contact information, education, experience, projects, and skills with your own content.

Create a version for one target role:

```bash
node /path/to/resumekit/bin/resumekit.js new frontend-intern
```

This creates:

```text
.resumekit/versions/frontend-intern.json
```

Edit that version for the role:

```bash
$EDITOR .resumekit/versions/frontend-intern.json
```

For example, make the summary, projects, and skills more relevant to a frontend internship.

Export HTML:

```bash
node /path/to/resumekit/bin/resumekit.js html frontend-intern -t modern
```

This writes:

```text
.resumekit/exports/frontend-intern.html
```

Export PDF:

```bash
node /path/to/resumekit/bin/resumekit.js pdf frontend-intern -t modern
```

This writes:

```text
.resumekit/exports/frontend-intern.pdf
```

PDF export uses Chrome, Edge, or Chromium when available, then falls back to the built-in PDF renderer.

Check the resume before sending it:

```bash
node /path/to/resumekit/bin/resumekit.js check frontend-intern
```

This reports missing or weak fields, such as an unchanged sample name, missing contact information, or too few skills.

Record a job application:

```bash
node /path/to/resumekit/bin/resumekit.js add "Example Inc" "Frontend Intern" frontend-intern
```

This writes the company, role, and resume version to:

```text
.resumekit/applications.json
```

Show an application summary:

```bash
node /path/to/resumekit/bin/resumekit.js apps
```

Compare the base resume with the role-specific version:

```bash
node /path/to/resumekit/bin/resumekit.js diff base frontend-intern
```

The usual workflow is: edit `.resumekit/resume.json`, create role versions under `.resumekit/versions/`, export files into `.resumekit/exports/`, and record applications in `.resumekit/applications.json`.

## Common Commands

These examples use the future installed command form. In local development, replace `resumekit` with `node /path/to/resumekit/bin/resumekit.js`.

| Command | Purpose |
| --- | --- |
| `resumekit init` | Create a local ResumeKit workspace. |
| `resumekit new frontend-intern` | Create a role-specific resume version. |
| `resumekit ls` | List resume versions. |
| `resumekit html frontend-intern -t modern` | Export HTML with the `modern` template. |
| `resumekit pdf frontend-intern -t modern` | Export PDF from the selected template. |
| `resumekit add "Example Inc" "Frontend Intern" frontend-intern` | Record a job application. |
| `resumekit apps` | Summarize tracked applications. |
| `resumekit check frontend-intern` | Check for missing or weak resume fields. |
| `resumekit diff base frontend-intern` | Compare two resume versions. |

## Workspace Layout

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

## Roadmap

- Markdown editing mode
- JD keyword matching
- Web UI with resume preview
- Community template system
- Git integration

## Contributing

Contributions are welcome. Good first issues include improving templates, adding validation rules, refining docs, and expanding tests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and contribution guidelines.

## License

MIT

---

# ResumeKit 中文

[English](#resumekit) | 中文

ResumeKit 是一个本地优先的简历版本管理与求职投递记录工具。

它帮助求职者用结构化方式管理简历内容，为不同岗位创建定制版本，导出可读简历，对比版本差异，并记录每次投递使用了哪一版简历。

## 为什么做这个

很多人的简历文件最后都会变成这样：

- `简历最终版.pdf`
- `简历最终版2.pdf`
- `前端岗位简历.pdf`
- `某公司投递版_new.pdf`

时间一长，很难记清楚哪份简历投给了哪家公司，也很难复用之前改好的内容。

ResumeKit 的目标是：让简历像代码一样结构化、可版本化、可对比、可复用。

## 当前功能

- 初始化本地简历工作区
- 使用 JSON 存储简历内容
- 创建命名简历版本
- 导出 HTML、PDF 或 JSON
- 支持 `classic`、`ats`、`modern` 三种 HTML 和 PDF 模板
- 记录求职投递
- 查看投递状态摘要
- 校验简历完整度
- 对比两个简历版本

## 快速开始

先运行完整示例：

```bash
node ./bin/resumekit.js demo
```

这条命令会创建一个带完整示例简历的本地 `.resumekit` 工作区，导出 HTML，并告诉你哪些内容需要补全。

下面的完整流程使用 `node /path/to/resumekit/bin/resumekit.js`，因为 ResumeKit 现在是从本地仓库运行。请把 `/path/to/resumekit` 换成这个项目在你电脑上的真实路径。以后发布后，同样的命令可以简写成 `resumekit ...`。

## 完整流程教程

先创建一个专门放简历的目录：

```bash
mkdir my-resume
cd my-resume
```

初始化 ResumeKit 工作区：

```bash
node /path/to/resumekit/bin/resumekit.js init
```

这一步会生成：

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

编辑你的基础简历：

```bash
$EDITOR .resumekit/resume.json
```

把里面的示例姓名、联系方式、教育经历、工作经历、项目和技能换成你自己的内容。

为某个岗位创建一个定制版本：

```bash
node /path/to/resumekit/bin/resumekit.js new frontend-intern
```

这一步会生成：

```text
.resumekit/versions/frontend-intern.json
```

继续编辑这个岗位版本：

```bash
$EDITOR .resumekit/versions/frontend-intern.json
```

比如把 summary、项目描述、技能顺序改得更适合前端实习岗位。

导出 HTML：

```bash
node /path/to/resumekit/bin/resumekit.js html frontend-intern -t modern
```

生成文件：

```text
.resumekit/exports/frontend-intern.html
```

导出 PDF：

```bash
node /path/to/resumekit/bin/resumekit.js pdf frontend-intern -t modern
```

生成文件：

```text
.resumekit/exports/frontend-intern.pdf
```

模板可以选 `classic`、`ats` 或 `modern`。

PDF 导出会优先使用 Chrome、Edge 或 Chromium，失败时回退到内置 PDF 渲染器。

投递前检查简历：

```bash
node /path/to/resumekit/bin/resumekit.js check frontend-intern
```

它会提示明显问题，比如姓名还是示例值、联系方式缺失、技能太少等。

记录一次投递：

```bash
node /path/to/resumekit/bin/resumekit.js add "Example Inc" "Frontend Intern" frontend-intern
```

这一步会把公司、岗位和使用的简历版本写入：

```text
.resumekit/applications.json
```

查看投递摘要：

```bash
node /path/to/resumekit/bin/resumekit.js apps
```

对比基础简历和岗位版本：

```bash
node /path/to/resumekit/bin/resumekit.js diff base frontend-intern
```

日常使用时，你主要会编辑 `.resumekit/resume.json` 和 `.resumekit/versions/*.json`，导出的 HTML/PDF 会出现在 `.resumekit/exports/`，投递记录会保存在 `.resumekit/applications.json`。

## 常用命令

这里写的是未来安装后的短命令形式。本地开发时，把 `resumekit` 替换成 `node /path/to/resumekit/bin/resumekit.js`。

| 命令 | 用途 |
| --- | --- |
| `resumekit init` | 创建本地工作区。 |
| `resumekit new frontend-intern` | 创建岗位定制版本。 |
| `resumekit ls` | 列出简历版本。 |
| `resumekit html frontend-intern -t modern` | 用 `modern` 模板导出 HTML。 |
| `resumekit pdf frontend-intern -t modern` | 从模板导出 PDF。 |
| `resumekit add "Example Inc" "Frontend Intern" frontend-intern` | 记录一次投递。 |
| `resumekit apps` | 汇总投递状态。 |
| `resumekit check frontend-intern` | 检查缺失或薄弱内容。 |
| `resumekit diff base frontend-intern` | 对比两个简历版本。 |

## 工作区结构

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

## 路线图

- Markdown 编辑模式
- JD 关键词匹配
- 带实时预览的 Web UI
- 社区模板系统
- Git 集成
- 更完善的中文 PDF 导出

## 参与贡献

欢迎贡献。适合第一次参与的方向包括：

- 改进简历模板
- 增加校验规则
- 完善中文和英文文档
- 增加测试
- 改进 PDF 导出

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解本地开发和贡献方式。

## 许可证

MIT
