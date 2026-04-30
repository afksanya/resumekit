# Templates

ResumeKit currently includes three HTML templates.

## classic

A clean general-purpose template with neutral spacing and a restrained accent color.

```bash
resumekit export base --format html --template classic
```

## ats

A conservative template designed to stay easy for applicant tracking systems to parse.

```bash
resumekit export base --format html --template ats
```

## modern

A slightly more polished template for portfolio-driven roles.

```bash
resumekit export base --format html --template modern
```

## PDF

PDF export uses the same HTML templates when Chrome, Edge, or Chromium is available:

```bash
resumekit export base --format pdf --template modern
```

If no supported browser is available, ResumeKit falls back to a dependency-free text PDF renderer.
