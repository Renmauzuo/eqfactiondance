# EQ Faction Dance - Project Conventions

## Overview

This is an EverQuest faction calculator hosted on GitHub Pages. It helps players find the optimal order to raise factions without undoing progress on others.

## Build

- Build tool: Gulp (run `npx gulp build` for a dev build)
- A development build is sufficient for reviewing changes
- Source lives in `src/`, output goes to `docs/` (generated, do not edit directly)
- `docs/` is generated output and can be `.gitignore`d now that GitHub Actions handles deployment

## Data Model

- Factions are stored as an array in `src/scripts/data.js`
- Array index = faction ID. New factions must always be appended to the end to preserve existing references
- Future consideration: refactor to use named constants instead of hard-coded numeric IDs
- Importance levels: Unused (0), Expendable (1), Useless (2), Unimportant (3), Important (4)
- Era numbers map to expansion names defined in `eraStrings` in `global.js`

## Architecture

- Currently uses jQuery with global variables loaded via separate script tags (no module system)
- A migration to TypeScript and ES modules is under consideration
- Pug templates for HTML, SCSS for styles, plain JS for scripts
- Rollup bundles scripts, PostCSS processes styles

## Code Style

- No strong preferences on formatting, semicolons, or quote style
- Match existing patterns when editing files
- jQuery objects are sometimes prefixed with `$`

## Testing

- No test suite currently exists
- Tests are not required unless they provide clear benefit for a specific change

## Browser Support

- No specific browser target. Modern browsers are fine.
