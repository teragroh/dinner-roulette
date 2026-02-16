---
name: Design System
description: Tailwind token mapping, shadcn/ui component usage, CVA variants, responsive design, and Figma-to-Tailwind translation.
---

## Overview

This skill provides the canonical design system patterns for the project's React frontend using Tailwind CSS 4 and shadcn/ui.

## Instructions

### shadcn/ui Component Usage

Always import UI primitives from `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```

Never rebuild components that shadcn/ui already provides.

### Component Variants with CVA

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

### Conditional Class Names

Always use `cn()` from `@/lib/utils`:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/5",
  isDisabled && "opacity-50 cursor-not-allowed",
  className,
)} />
```

### Figma-to-Tailwind Token Mapping

| Figma Value | Tailwind |
|-------------|----------|
| 4px spacing | `1` |
| 8px spacing | `2` |
| 12px spacing | `3` |
| 16px spacing | `4` |
| 20px spacing | `5` |
| 24px spacing | `6` |
| 32px spacing | `8` |
| 48px spacing | `12` |
| 64px spacing | `16` |
| 12px font | `text-xs` |
| 14px font | `text-sm` |
| 16px font | `text-base` |
| 18px font | `text-lg` |
| 20px font | `text-xl` |
| 24px font | `text-2xl` |
| 30px font | `text-3xl` |
| 400 weight | `font-normal` |
| 500 weight | `font-medium` |
| 600 weight | `font-semibold` |
| 700 weight | `font-bold` |
| 4px radius | `rounded-sm` |
| 6px radius | `rounded-md` |
| 8px radius | `rounded-lg` |
| 12px radius | `rounded-xl` |
| 16px radius | `rounded-2xl` |

### Responsive Breakpoints

Mobile-first approach:

```tsx
// Default: mobile (< 640px)
// sm: ≥ 640px
// md: ≥ 768px
// lg: ≥ 1024px
// xl: ≥ 1280px

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Dark Mode

The project uses CSS variables for theming. shadcn/ui handles dark mode via the `dark` class on `<html>`:

```tsx
// Colors automatically switch — use semantic names:
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<div className="bg-background">Main background</div>
<div className="bg-card">Card background</div>
<div className="border-border">Borders</div>
```

Never hardcode light/dark colors — always use the semantic CSS variables.
