---
name: frontend-documentation
description: >
  Analyze and document any frontend project's architecture, feature dependencies,
  library usage, and overall health. Use when a user asks to "document the frontend",
  "analyze frontend architecture", "map feature dependencies", "generate architecture
  diagram", "create frontend report", "review frontend tech stack", or any request
  to produce a high-level overview or PDF report of a frontend codebase. Works with
  any frontend framework (React, Vue, Angular, Svelte, vanilla JS/TS, etc.).
compatibility: >
  Designed for Claude (skill format with YAML frontmatter and progressive disclosure).
  For other AI models (ChatGPT, Gemini, etc.), the SKILL.md body and reference files
  can be pasted into a custom system prompt or Custom GPT instruction. Remove the
  YAML frontmatter block and tool-specific directives (grep_search, list_dir, etc.)
  and replace them with equivalent instructions for the target model's tool set.
---

# Frontend Documentation

Generate a comprehensive architecture report for any frontend project. The report
includes feature dependency mapping, architecture layer diagrams, library assessment,
and actionable recommendations — delivered as Mermaid diagrams in chat and a PDF
file written directly to disk via a standalone script.

## Workflow Overview

Documenting a frontend involves these steps:

1. Discover project layout
2. Identify tech stack and libraries
3. Map features and their dependencies
4. Assess architecture layers
5. Evaluate recommendations (performance, security, best practices, tech stack)
6. Generate Mermaid diagrams
7. Generate PDF report
8. Present results to user

## Step 1 — Discover Project Layout

Scan the project root to locate:

- Package manifest (`package.json`, `composer.json`, `pubspec.yaml`, etc.)
- Source directory (`src/`, `app/`, `pages/`, `lib/`)
- Config files (`vite.config.*`, `next.config.*`, `webpack.config.*`, `angular.json`, `tsconfig.json`, `biome.json`, `.eslintrc.*`, etc.)
- Test directories (`__tests__/`, `tests/`, `*.test.*`, `*.spec.*`)
- Build / output directories (`dist/`, `build/`, `.next/`, `out/`)

Use `list_dir` and `file_search` to build a mental map of the project tree. Read
`package.json` (or equivalent) to extract dependency lists.

## Step 2 — Identify Tech Stack and Libraries

From the package manifest and config files, classify every dependency into:

| Category         | Examples                                              |
|------------------|-------------------------------------------------------|
| Framework        | React, Vue, Angular, Svelte, SolidJS                  |
| Bundler          | Vite, Webpack, esbuild, Turbopack, Parcel             |
| Routing          | TanStack Router, React Router, Vue Router, Next.js    |
| State Management | TanStack Query, Redux, Zustand, Pinia, Jotai, MobX   |
| Styling          | Tailwind, CSS Modules, styled-components, Emotion     |
| Forms            | TanStack Form, React Hook Form, Formik, VeeValidate   |
| Validation       | Zod, Yup, Joi, Valibot                                |
| Testing          | Vitest, Jest, Cypress, Playwright, Testing Library     |
| Linting/Format   | Biome, ESLint, Prettier, Stylelint                    |
| UI Library       | shadcn/ui, MUI, Ant Design, Vuetify, Radix            |
| API Client       | Orval, openapi-ts, Axios, ky, ofetch                  |
| Icons            | Lucide, Heroicons, Phosphor, FontAwesome              |
| Deployment       | Cloudflare, Vercel, Netlify, AWS Amplify              |

Record the version of each dependency. Flag any that are outdated by more than one
major version or have known deprecation notices.

## Step 3 — Map Features and Their Dependencies

Identify feature boundaries by scanning the source tree for:

- Feature directories (commonly `features/`, `modules/`, `domains/`, `pages/`)
- Barrel exports (`index.ts`, `index.js`)
- Shared directories (`components/`, `hooks/`, `lib/`, `utils/`, `services/`)

For each feature, determine:

1. **Internal modules** — components, hooks, schemas, services owned by the feature
2. **Outgoing dependencies** — which shared modules or other features it imports
3. **Incoming dependencies** — which other features import from it
4. **External API calls** — endpoints consumed (look for fetch, axios, query hooks)

Use `grep_search` with import patterns:

```
import.*from ['"]@/features/
import.*from ['"]../features/
import.*from ['"]@/components/
import.*from ['"]@/hooks/
import.*from ['"]@/lib/
```

Adjust path aliases based on the project's `tsconfig.json` or bundler alias config.

See [references/analysis-patterns.md](references/analysis-patterns.md) for detailed
heuristics and edge cases.

## Step 4 — Assess Architecture Layers

Classify every directory and module into one of these layers:

| Layer          | Purpose                                      |
|----------------|----------------------------------------------|
| Routes / Pages | Top-level views bound to URL paths           |
| Features       | Self-contained business capabilities         |
| Components     | Reusable presentational UI                   |
| Hooks          | Shared stateful logic                        |
| API / Services | Server communication and data fetching       |
| State          | Client-side state management                 |
| Config         | Environment and build configuration          |
| Utilities      | Pure helper functions                        |
| Assets         | Static files (images, fonts, icons)          |

Note any violations of the expected dependency direction:

- Routes → Features → Components → Hooks → Utils (healthy)
- Components → Features (unhealthy — coupling upward)
- Utils → Components (unhealthy — coupling upward)

## Step 5 — Evaluate Recommendations

Produce recommendations in five categories. See
[references/analysis-patterns.md](references/analysis-patterns.md) for the full
evaluation rubric.

### 5a. Bundle Size

- Large dependencies that could be replaced (e.g., moment.js → date-fns)
- Missing tree-shaking opportunities
- Dynamic import candidates for code-splitting
- Duplicate functionality across libraries

### 5b. Security

- Outdated dependencies with known CVEs
- Client-side secret exposure risks
- Missing CSP / CORS considerations
- Unsafe patterns (innerHTML, eval, dangerouslySetInnerHTML)

### 5c. Best Practices

- Missing or misconfigured linting/formatting
- Inconsistent file/folder conventions
- Missing accessibility patterns
- Missing error boundaries or loading states

### 5d. Performance

- Unnecessary re-renders or missing memoisation
- Missing lazy loading for routes or heavy components
- Image optimisation opportunities
- Missing prefetching or caching strategies

### 5e. Tech Stack Improvements

- Deprecated libraries with modern alternatives
- Missing type safety opportunities
- Testing coverage gaps
- Developer experience improvements (hot reload, dev tools)

## Step 6 — Generate Diagrams

Generate two diagrams. See
[references/diagram-generation.md](references/diagram-generation.md) for Mermaid
syntax (chat presentation) and react-pdf SVG patterns (PDF embedding).

### Diagram 1: Feature Dependency Graph

A directed graph showing how features depend on each other and on shared modules.

```
graph LR
  auth --> api
  recipes --> api
  createRecipe --> recipes
  createRecipe --> auth
```

### Diagram 2: Architecture Layers

A top-down layered diagram showing the project's module hierarchy.

```
graph TD
  subgraph Routes
    ...
  end
  subgraph Features
    ...
  end
  Routes --> Features --> Components --> Hooks --> Utils
```

Present these as Mermaid code blocks in chat for interactive preview. The PDF
report renders them directly using react-pdf SVG primitives (no external tools
or image pre-rendering required).

## Step 7 — Generate PDF Report

Generate a **single standalone script** that writes a PDF file directly to disk.
Do NOT create a component library, types file, data file, download button, or
barrel exports inside the user's application. The goal is one file in, one PDF out.

See [references/react-pdf-patterns.md](references/react-pdf-patterns.md) for the
script template and [references/report-template.md](references/report-template.md)
for the report section order.

### Script location

Create the script at `scripts/generate-report.tsx` inside the frontend project
directory (where `package.json` and `node_modules` live). The script must be able
to resolve `react` and `@react-pdf/renderer` from the local `node_modules`.
Never place report files inside `src/` — they are not part of the application.

**Non-TypeScript projects:** Use `.jsx` instead of `.tsx`. The `tsx` runner
handles both extensions. The analysis steps (1–6) are fully language-agnostic —
they scan directories, `package.json`, and grep for `import`/`require` patterns
regardless of whether the project uses JavaScript or TypeScript.

### What the script does

1. Defines the analysis data inline as a constant (no separate data file).
2. Defines all react-pdf components inline (Title page, TOC, tables, diagrams, etc.).
3. Calls `renderToFile()` to write the PDF directly to `docs/<project>-architecture-report.pdf`.
4. Exits.

### How to run it

From the frontend project directory (where `package.json` lives):

```bash
npx tsx scripts/generate-report.tsx
```

If `tsx` is not available, install it as a dev dependency (`npm i -D tsx`).

### PDF contents

1. Title page with project name and generation date
2. Table of contents
3. Executive summary
4. Tech stack inventory table
5. Feature dependency graph (drawn with react-pdf SVG primitives)
6. Architecture layers diagram (drawn with react-pdf SVG primitives)
7. Recommendations by category with scores
8. Appendix: full dependency list with versions

Diagrams use react-pdf's built-in SVG support (`Svg`, `Rect`, `Line`, `Text`,
`Circle`, `Path`). No Mermaid CLI or pre-rendered images required.

## Step 8 — Present Results

Deliver to the user:

1. The two Mermaid diagrams inline in chat for quick review.
2. Run the generated script to produce the PDF file.
3. A summary of the top 5 most impactful recommendations.

The user should have one new file (`scripts/generate-report.tsx`) and one output
(`docs/<project>-architecture-report.pdf`). Nothing else. No components, no types,
no data files, no download buttons inside their application.
