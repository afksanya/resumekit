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

PDF export is currently a built-in text renderer:

```bash
resumekit export base --format pdf
```

The current PDF renderer is dependency-free and works well for ASCII resumes. Richer typography and CJK text support are planned for a later browser-rendered PDF exporter.
