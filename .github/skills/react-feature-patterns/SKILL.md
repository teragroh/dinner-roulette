---
name: React Feature Patterns
description: Standard patterns for React features in the Dinner Roulette frontend — components, hooks, schemas, and TanStack Query integration.
---

## Overview

This skill provides the canonical patterns for building React features in the Dinner Roulette UI. Every frontend feature follows feature-based organization with TanStack Query, TanStack Form, Zod validation, and shadcn/ui components.

## Instructions

When generating React/TypeScript code for this project:

### Feature Hook Pattern (TanStack Query)

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResources, createResource } from "@/api/resources/resources";

export function useResources() {
	return useQuery({
		queryKey: ["resources"],
		queryFn: () => getResources(),
	});
}

export function useCreateResource() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
		},
	});
}
```

### Component Pattern

```tsx
import { useResources } from "../hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResourceList() {
	const { data, isLoading, error } = useResources();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;
	if (!data?.length) return <div>No resources found.</div>;

	return (
		<div className="grid gap-4">
			{data.map((resource) => (
				<Card key={resource.id}>
					<CardHeader>
						<CardTitle>{resource.name}</CardTitle>
					</CardHeader>
					<CardContent>{resource.description}</CardContent>
				</Card>
			))}
		</div>
	);
}
```

### Form Pattern (TanStack Form + Zod)

```tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const resourceSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	description: z.string().min(1, "Description is required"),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export function ResourceForm({ onSubmit }: { onSubmit: (values: ResourceFormValues) => void }) {
	const form = useForm({
		defaultValues: { name: "", description: "" },
		onSubmit: async ({ value }) => {
			onSubmit(value);
		},
		validators: {
			onChange: resourceSchema,
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field name="name">
				{(field) => (
					<div>
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors?.length > 0 && (
							<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
						)}
					</div>
				)}
			</form.Field>
			<Button type="submit">Create</Button>
		</form>
	);
}
```

### Barrel Export Pattern

```tsx
// features/resourceName/index.ts
export { ResourceList } from "./components/ResourceList";
export { useResources, useCreateResource } from "./hooks/use-resources";
```

### Route Pattern (TanStack Router)

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { ResourceList } from "@/features/resources";

export const Route = createFileRoute("/resources/")({
	component: ResourcesPage,
});

function ResourcesPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Resources</h1>
			<ResourceList />
		</div>
	);
}
```

### Key Conventions

- Always handle loading, error, and empty states in components.
- Use `@/` path alias for imports.
- Use Biome formatting: tabs for indentation, double quotes for strings.
- Import UI components from `@/components/ui/`.
- API types come from Orval (`@/api/`) — never write them manually.
- Use `cn()` from `@/lib/utils` for conditional class names.
