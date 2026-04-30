# ResumeKit

[中文说明](./README.zh-CN.md)

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
- Choose from `classic`, `ats`, and `modern` HTML templates
- Record job applications
- Show application status summary
- Validate resume completeness
- Compare two resume versions

## Quick Start

```bash
node ./bin/resumekit.js init
node ./bin/resumekit.js version create frontend-intern
node ./bin/resumekit.js export frontend-intern --format html --template modern
node ./bin/resumekit.js export frontend-intern --format pdf
node ./bin/resumekit.js apply add --company "Example Inc" --role "Frontend Intern" --version frontend-intern
node ./bin/resumekit.js status
node ./bin/resumekit.js validate frontend-intern
node ./bin/resumekit.js diff base frontend-intern
```

After installing globally, the same commands are available as:

```bash
resumekit init
resumekit version create frontend-intern
resumekit export frontend-intern --format html --template modern
resumekit export frontend-intern --format pdf
resumekit apply add --company "Example Inc" --role "Frontend Intern" --version frontend-intern
resumekit status
resumekit validate frontend-intern
resumekit diff base frontend-intern
```

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
