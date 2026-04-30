# Contributing

Thanks for helping improve ResumeKit.

## Local Setup

```bash
git clone https://github.com/afksanya/resumekit.git
cd resumekit
npm test
```

No install step is required for the current CLI because it has no runtime dependencies.

## Development

Run the CLI locally:

```bash
node ./bin/resumekit.js help
```

Run tests:

```bash
npm test
```

## Good First Contributions

- Add a new HTML template
- Improve the Chinese README
- Add resume validation rules
- Add examples under `examples/`
- Improve PDF export behavior
- Expand CLI tests

## Pull Request Checklist

- Keep changes focused
- Add or update tests when behavior changes
- Update docs when commands or output change
- Run `npm test` before opening a pull request

## Project Direction

ResumeKit should stay local-first, privacy-friendly, and easy to understand. Prefer simple data formats, clear commands, and features that help real job seekers manage resume versions with less friction.
