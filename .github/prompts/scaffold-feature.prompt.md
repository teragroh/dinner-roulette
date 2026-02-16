---
description: 'Scaffold a new frontend feature module with components, hooks, schema, and barrel export'
agent: agent
tools: ['editFiles', 'search']
---

# Scaffold Frontend Feature

Create a new frontend feature module for: **${input:featureName}**

## Structure to Create

Under `ui/src/features/${input:featureName}/`:

```
${input:featureName}/
├── index.ts                    (barrel export)
├── components/
│   └── ${input:featureName}.tsx
├── hooks/
│   └── use-${input:featureName}.ts
└── schema/
    └── ${input:featureName}-schema.ts
```

## Conventions

- **Component:** Functional component, uses TanStack Query hook for data, Tailwind CSS + shadcn/ui for styling.
- **Hook:** Custom hook wrapping TanStack Query (`useQuery` / `useMutation`) using Orval-generated API client.
- **Schema:** Zod 4 schema for form validation (if the feature has forms).
- **Barrel export:** Re-export component and hook from `index.ts`.
- Use `@/` path alias for all imports.
- Use Biome formatting (tabs, double quotes).

Follow patterns from existing features: `auth/`, `createRecipe/`, `recipes/`.
