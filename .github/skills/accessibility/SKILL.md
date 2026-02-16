---
name: Accessibility
description: WCAG AA standards, semantic HTML, ARIA patterns, keyboard navigation, color contrast, and focus management.
---

## Overview

This skill provides accessibility (a11y) standards and patterns to ensure the application meets WCAG 2.1 AA compliance.

## Instructions

### Semantic HTML

Always use the correct HTML element for its purpose:

| Purpose | Element | NOT |
|---------|---------|-----|
| Navigation | `<nav>` | `<div className="nav">` |
| Main content | `<main>` | `<div className="main">` |
| Sections | `<section>` | `<div>` |
| Headings | `<h1>`-`<h6>` (in order) | `<p className="title">` |
| Lists | `<ul>`, `<ol>`, `<li>` | `<div>` per item |
| Buttons | `<button>` | `<div onClick>` or `<a onClick>` |
| Links (navigation) | `<a href>` | `<button>` |
| Form labels | `<label htmlFor>` | placeholder-only |

#### Implicit ARIA Roles

**Never add redundant ARIA roles to semantic HTML elements.** These elements already have implicit roles:

| Element | Implicit Role | ❌ Don't Write |
|---------|---------------|----------------|
| `<nav>` | `navigation` | `<nav role="navigation">` |
| `<main>` | `main` | `<main role="main">` |
| `<button>` | `button` | `<button role="button">` |
| `<ul>`, `<ol>` | `list` | `<ul role="list">` |
| `<li>` | `listitem` | `<li role="listitem">` |
| `<article>` | `article` | `<article role="article">` |
| `<aside>` | `complementary` | `<aside role="complementary">` |
| `<section>` | `region` (with label) | `<section role="region">` |

Only add explicit `role` attributes when:
- Using non-semantic elements (e.g., `<div role="button">` for custom components)
- Overriding the default role for a specific purpose (e.g., `<ul role="presentation">` to remove list semantics)

### Heading Hierarchy

```tsx
// ✅ Correct — headings in logical order
<h1>Recipes</h1>
<section>
  <h2>My Recipes</h2>
  <article>
    <h3>Spaghetti Bolognese</h3>
  </article>
</section>

// ❌ Wrong — skipping heading levels
<h1>Recipes</h1>
<h4>Spaghetti Bolognese</h4>
```

### Form Accessibility

```tsx
// ✅ Every input needs a visible label
<Label htmlFor="recipe-name">Recipe Name</Label>
<Input id="recipe-name" aria-describedby="name-error" />
{error && <p id="name-error" role="alert" className="text-destructive text-sm">{error}</p>}

// ✅ Required fields
<Label htmlFor="name">
  Name <span aria-hidden="true">*</span>
</Label>
<Input id="name" required aria-required="true" />
```

### Interactive Elements

```tsx
// ✅ Buttons have accessible names
<Button aria-label="Delete recipe">
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Toggle buttons indicate state
<Button
  aria-pressed={isActive}
  aria-label={isActive ? "Remove from favorites" : "Add to favorites"}
>
  <Heart className={cn("h-4 w-4", isActive && "fill-current")} />
</Button>

// ✅ Keyboard accessible custom components
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
```

### Images

```tsx
// ✅ Informative images need meaningful alt text
<img src={recipe.imageUrl} alt={`Photo of ${recipe.name}`} />

// ✅ Decorative images use empty alt
<img src="/decoration.svg" alt="" aria-hidden="true" />

// ❌ Never use alt text like "image", "photo", "icon"
```

### Color Contrast

- **Normal text (< 18px):** minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or 14px bold):** minimum 3:1 contrast ratio
- **UI components and graphical objects:** minimum 3:1 contrast ratio
- Never convey information through color alone — add icons, text, or patterns.

### Focus Management

```tsx
// ✅ Visible focus indicators (Tailwind)
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">

// ✅ Move focus after dynamic content changes
const headingRef = useRef<HTMLHeadingElement>(null);
useEffect(() => {
  if (isLoaded) headingRef.current?.focus();
}, [isLoaded]);

<h2 ref={headingRef} tabIndex={-1}>Results</h2>
```

### ARIA Live Regions

```tsx
// ✅ Announce dynamic content to screen readers
<div aria-live="polite" aria-atomic="true">
  {successMessage && <p>{successMessage}</p>}
</div>

// ✅ Announce errors
<div role="alert">
  {error && <p className="text-destructive">{error}</p>}
</div>
```

### Testing Accessibility

- Run `axe-core` in Playwright tests:
  ```typescript
  import AxeBuilder from "@axe-core/playwright";

  test("recipe page has no accessibility violations", async ({ page }) => {
    await page.goto("/recipes");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
  ```
- Use keyboard-only navigation to test all flows.
- Test with a screen reader (NVDA on Windows, VoiceOver on Mac).
