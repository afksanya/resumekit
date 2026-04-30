# Resume Schema

ResumeKit currently uses JSON. The schema is intentionally simple so users can edit it with any text editor.

```json
{
  "profile": {
    "name": "Your Name",
    "email": "you@example.com",
    "phone": "",
    "location": "",
    "links": {
      "github": "",
      "portfolio": ""
    }
  },
  "summary": "A concise professional summary tailored to the role.",
  "education": [],
  "experience": [],
  "projects": [],
  "skills": []
}
```

## Project Item

```json
{
  "name": "Project Name",
  "role": "Developer",
  "tech": ["React", "TypeScript"],
  "highlights": [
    "Built the core user flow.",
    "Improved page load time by 35%."
  ]
}
```

## Experience Item

```json
{
  "company": "Company",
  "role": "Software Engineer Intern",
  "start": "2025-06",
  "end": "2025-09",
  "highlights": [
    "Implemented a reusable component library."
  ]
}
```
