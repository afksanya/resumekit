# Getting Started

ResumeKit stores your resume and job search data in a local `.resumekit` directory.

## Create a Workspace

```bash
resumekit init
```

This creates:

```text
.resumekit/
├─ resume.json
├─ versions/
│  └─ base.json
├─ applications.json
└─ exports/
```

## Edit Your Base Resume

Open `.resumekit/resume.json` and replace the sample content with your real profile, education, projects, experience, and skills.

## Create a Tailored Version

```bash
resumekit version create frontend-intern
```

Then edit `.resumekit/versions/frontend-intern.json` for that role.

## Export

```bash
resumekit export frontend-intern --format html --template modern
resumekit export frontend-intern --format pdf
```

The exported file appears in `.resumekit/exports/`.

HTML templates currently include:

- `classic`
- `ats`
- `modern`

## Track an Application

```bash
resumekit apply add --company "Example Inc" --role "Frontend Intern" --version frontend-intern
```

## Check Status

```bash
resumekit status
```

## Validate a Resume

```bash
resumekit validate frontend-intern
```

Validation currently checks for missing profile details, thin summaries, project highlights, and skills.
