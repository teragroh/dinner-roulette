---
name: Accessibility
description: WCAG 2.2 AA standards (W3C Recommendation 12 December 2024), semantic HTML, ARIA patterns, keyboard navigation, color contrast, focus management, live regions, form accessibility, and automated testing. Based on the official W3C WCAG 2.2 specification (https://www.w3.org/TR/WCAG22/).
---

## Overview

Accessibility (a11y) patterns for the Dinner Roulette application targeting **WCAG 2.2 AA** compliance. Follows the four POUR principles: **Perceivable, Operable, Understandable, Robust**.

**Source**: [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) — W3C Recommendation, 12 December 2024.

WCAG 2.2 extends WCAG 2.1 with 9 new success criteria. Content that conforms to WCAG 2.2 also conforms to WCAG 2.1 and WCAG 2.0. Notably, **4.1.1 Parsing has been obsoleted and removed** in WCAG 2.2.

**New success criteria in WCAG 2.2:**
- 2.4.11 Focus Not Obscured (Minimum) — **AA** ← we must comply
- 2.4.12 Focus Not Obscured (Enhanced) — AAA
- 2.4.13 Focus Appearance — AAA
- 2.5.7 Dragging Movements — **AA** ← we must comply
- 2.5.8 Target Size (Minimum) — **AA** ← we must comply
- 3.2.6 Consistent Help — **A** ← we must comply
- 3.3.7 Redundant Entry — **A** ← we must comply
- 3.3.8 Accessible Authentication (Minimum) — **AA** ← we must comply
- 3.3.9 Accessible Authentication (Enhanced) — AAA

For detailed references see:
- [references/wcag-checklist.md](references/wcag-checklist.md) — full WCAG 2.2 AA success criteria checklist
- [references/aria-patterns.md](references/aria-patterns.md) — ARIA widget patterns, roles, states, and keyboard specs

## Instructions

### First Rule of ARIA

> "No ARIA is better than bad ARIA." — W3C

Use semantic HTML first. Only add ARIA when no native HTML element provides the semantics you need. Redundant ARIA on semantic elements is an error.

### Semantic HTML

| Purpose | Use | Never |
|---------|-----|-------|
| Navigation | `<nav>` | `<div className="nav">` |
| Main content | `<main>` | `<div className="main">` |
| Sections | `<section>` with label | `<div>` |
| Headings | `<h1>`–`<h6>` (in order) | `<p className="title">` |
| Lists | `<ul>`, `<ol>`, `<li>` | `<div>` per item |
| Buttons (actions) | `<button>` | `<div onClick>` or `<a onClick>` |
| Links (navigation) | `<a href>` | `<button>` for navigation |
| Search | `<search>` or `<form role="search">` | plain `<div>` |
| Form labels | `<label htmlFor>` | placeholder-only |

#### Implicit ARIA Roles — Never Duplicate

| Element | Implicit Role | ❌ Don't Write |
|---------|---------------|----------------|
| `<nav>` | `navigation` | `<nav role="navigation">` |
| `<main>` | `main` | `<main role="main">` |
| `<button>` | `button` | `<button role="button">` |
| `<header>` (top-level) | `banner` | `<header role="banner">` |
| `<footer>` (top-level) | `contentinfo` | `<footer role="contentinfo">` |
| `<aside>` | `complementary` | `<aside role="complementary">` |
| `<section>` (with label) | `region` | `<section role="region">` |
| `<ul>`, `<ol>` | `list` | `<ul role="list">` |
| `<article>` | `article` | `<article role="article">` |

### Heading Hierarchy

Headings must follow a logical nesting order — never skip levels.

```tsx
// ✅ Correct
<h1>Recipes</h1>
<section>
  <h2>My Recipes</h2>
  <article>
    <h3>Spaghetti Bolognese</h3>
  </article>
</section>

// ❌ Wrong — skipping h2 → h4
<h1>Recipes</h1>
<h4>Spaghetti Bolognese</h4>
```

Every page must have exactly one `<h1>`. Use `<h2>`–`<h6>` for subsections.

### Form Accessibility

```tsx
// ✅ Every input needs a visible, associated label
<Label htmlFor="recipe-name">Recipe Name</Label>
<Input
  id="recipe-name"
  aria-describedby="name-help name-error"
  aria-invalid={!!error}
  aria-required="true"
/>
<p id="name-help" className="text-muted-foreground text-sm">
  A short, descriptive name.
</p>
{error && (
  <p id="name-error" role="alert" className="text-destructive text-sm">
    {error}
  </p>
)}

// ✅ Required fields — visible indicator + aria-required
<Label htmlFor="name">
  Name <span aria-hidden="true">*</span>
</Label>
<Input id="name" required aria-required="true" />

// ✅ Fieldset + Legend for grouped inputs
<fieldset>
  <legend>Cooking Time</legend>
  <Label htmlFor="hours">Hours</Label>
  <Input id="hours" type="number" />
  <Label htmlFor="minutes">Minutes</Label>
  <Input id="minutes" type="number" />
</fieldset>
```

#### Form Error Patterns

1. **Inline errors**: Show next to the field with `role="alert"` or in an `aria-live="assertive"` region.
2. **Error summary**: On submit, show a summary at the top of the form and move focus to it.
3. **`aria-invalid="true"`**: Set on each field that has an error.
4. **`aria-describedby`**: Link the error message `id` to the input.
5. **`aria-errormessage`**: Alternative to `aria-describedby` for error-specific descriptions.

### Interactive Elements

```tsx
// ✅ Icon-only buttons need aria-label
<Button aria-label="Delete recipe">
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Toggle buttons indicate state
<Button
  aria-pressed={isFavorite}
  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
>
  <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
</Button>

// ✅ Loading buttons
<Button disabled aria-busy="true">
  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
  Saving…
</Button>

// ✅ Custom keyboard-accessible element (last resort)
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
  Custom action
</div>
```

### Images & Icons

```tsx
// ✅ Informative images — meaningful alt
<img src={recipe.imageUrl} alt={`Photo of ${recipe.name}`} />

// ✅ Decorative images — hide from AT
<img src="/decoration.svg" alt="" aria-hidden="true" />

// ✅ Inline SVG icons (decorative) inside labeled element
<Button aria-label="Search">
  <SearchIcon aria-hidden="true" />
</Button>

// ❌ Never write alt="image", alt="photo", alt="icon"
```

### Color & Contrast

| Element | Minimum Ratio (WCAG AA) |
|---------|------------------------|
| Normal text (< 18px / < 14px bold) | **4.5:1** |
| Large text (≥ 18px or ≥ 14px bold) | **3:1** |
| UI components & graphical objects | **3:1** |
| Focus indicators | **3:1** against adjacent colors |

**Rules:**
- Never convey information by color alone — always add icons, text, patterns, or underlines.
- Ensure dark mode and light mode both meet contrast ratios.
- Test with browser DevTools color-contrast checker.

### Focus Management

```tsx
// ✅ Visible focus indicators (Tailwind)
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">

// ✅ Never remove focus outlines unconditionally
// ❌ NEVER: *:focus { outline: none; }
// ✅ OK: :focus:not(:focus-visible) { outline: none; }

// ✅ Move focus after route navigation or dynamic content
const headingRef = useRef<HTMLHeadingElement>(null);
useEffect(() => {
  if (isLoaded) headingRef.current?.focus();
}, [isLoaded]);
<h2 ref={headingRef} tabIndex={-1}>Search Results</h2>

// ✅ Trap focus in modals (Radix Dialog does this automatically)
// ✅ Return focus to trigger on dialog close
```

#### Focus Not Obscured (WCAG 2.4.11 — New in 2.2, AA)

When a UI component receives keyboard focus, it must not be entirely hidden by other author-created content (sticky headers, cookie banners, floating toolbars, etc.).

```tsx
// ✅ Ensure sticky headers don't cover focused elements
// Use scroll-margin-top or scroll-padding-top
<main className="scroll-mt-16"> {/* accounts for sticky header height */}

// ✅ Ensure dialogs/overlays don't obscure focused elements behind them
// Use proper focus trapping in modals (Radix Dialog handles this)
```

#### tabIndex Rules

| Value | Behavior |
|-------|----------|
| Not set | Default — interactive elements are tabbable, non-interactive are not |
| `0` | Element becomes tabbable in DOM order |
| `-1` | Focusable programmatically (via `.focus()`), but NOT tabbable |
| Positive (`1`, `2`, …) | **Never use** — breaks natural tab order |

### Keyboard Navigation

All functionality must be operable via keyboard alone (WCAG 2.1.1).

| Key | Expected Behavior |
|-----|-------------------|
| `Tab` | Move focus to next interactive element |
| `Shift+Tab` | Move focus to previous interactive element |
| `Enter` | Activate buttons and links |
| `Space` | Activate buttons, toggle checkboxes |
| `Escape` | Close modals, popovers, dropdowns |
| `Arrow keys` | Navigate within composite widgets (tabs, menus, listboxes) |
| `Home`/`End` | Jump to first/last item in a list widget |

**No keyboard traps**: users must always be able to navigate away from any component using only the keyboard (WCAG 2.1.2).

### ARIA Live Regions

Use to announce dynamic content changes to screen readers:

```tsx
// ✅ Polite — waits for user idle (notifications, status updates)
<div aria-live="polite" aria-atomic="true">
  {successMessage && <p>{successMessage}</p>}
</div>

// ✅ Assertive — interrupts immediately (errors, alerts)
<div role="alert">
  {error && <p className="text-destructive">{error}</p>}
</div>

// ✅ Status messages (WCAG 4.1.3)
<div role="status" aria-live="polite">
  {isLoading ? "Loading recipes…" : `${count} recipes found`}
</div>

// ✅ Log regions (chat, activity feed)
<div role="log" aria-live="polite" aria-relevant="additions">
  {messages.map((m) => <p key={m.id}>{m.text}</p>)}
</div>
```

| `aria-live` | When |
|-------------|------|
| `polite` | Non-urgent updates (toast notifications, search results count) |
| `assertive` | Urgent (form errors, session expiry warnings) |
| `off` | Default — no announcements |

**Important**: The live region container must exist in the DOM **before** content is injected into it. Don't dynamically create the container — only change its contents.

### Skip Links

Provide a skip link as the first focusable element on the page so keyboard users can bypass repeated navigation:

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-background focus:text-foreground">
  Skip to main content
</a>
// ... <nav> ...
<main id="main-content" tabIndex={-1}>
```

### Language

Set `lang` attribute on the `<html>` element (WCAG 3.1.1):

```html
<html lang="en">
```

For passages in a different language, wrap with `lang`:

```html
<p>The French term <span lang="fr">mise en place</span> means "everything in its place."</p>
```

### Motion & Animation

- Respect `prefers-reduced-motion` — disable or reduce animations (WCAG 2.3.3):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- Never flash content more than 3 times per second (WCAG 2.3.1).
- Provide controls to pause/stop any auto-playing content (WCAG 2.2.2).

### Touch Targets (WCAG 2.5.8 — New in 2.2, AA)

Minimum target size for pointer inputs:
- **24×24 CSS pixels** minimum, or adequate spacing so a 24px circle centered on each target does not overlap another target.
- Aim for **44×44 CSS pixels** for comfortable touch (WCAG 2.5.5 AAA).
- **Exceptions**: inline text links, targets whose size is set by the user agent, and legally required presentations.

### Dragging Movements (WCAG 2.5.7 — New in 2.2, AA)

All functionality that uses drag-and-drop must have a single-pointer alternative (click/tap):

```tsx
// ✅ Reorderable list — provide up/down buttons alongside drag handle
<li>
  <GripVertical aria-hidden="true" /> {/* drag handle */}
  <span>Ingredient 1</span>
  <Button aria-label="Move up" size="icon"><ChevronUp /></Button>
  <Button aria-label="Move down" size="icon"><ChevronDown /></Button>
</li>

// ❌ Drag-only reordering with no keyboard/click alternative
```

### Autocomplete & Input Purpose

Use `autocomplete` attributes on identity/financial fields (WCAG 1.3.5):

```tsx
<Input id="email" type="email" autoComplete="email" />
<Input id="name" type="text" autoComplete="name" />
<Input id="password" type="password" autoComplete="current-password" />
```

### Redundant Entry (WCAG 3.3.7 — New in 2.2, Level A)

Information previously entered by the user in the same process must be auto-populated or available to select — don't force re-typing.

```tsx
// ✅ Multi-step form — carry forward data from previous steps
const [step1Data] = useState(savedStep1);
// Pre-fill step 2 fields that overlap with step 1

// ✅ Use browser autocomplete for personal data
<Input autoComplete="email" />

// ❌ Asking for email again on a confirmation page when already entered
```

**Exceptions**: re-entry required for security, the information is no longer valid, or re-entry is essential to the purpose.

### Accessible Authentication (WCAG 3.3.8 — New in 2.2, AA)

Authentication must not rely on cognitive function tests (memorizing passwords, solving puzzles) unless:
- An **alternative** method is available that doesn't require a cognitive test, OR
- A **mechanism** assists the user (e.g., password manager support, copy-paste), OR
- The test is **object recognition** or **personal content**.

```tsx
// ✅ Allow password managers — don't block paste
<Input
  type="password"
  autoComplete="current-password"
  // Never use onPaste={(e) => e.preventDefault()}
/>

// ✅ Support "Sign in with" providers as alternatives
// ✅ Allow copy-paste on verification code inputs
// ❌ CAPTCHA with no accessible alternative
// ❌ Blocking paste on password fields
```

### Consistent Help (WCAG 3.2.6 — New in 2.2, Level A)

If help mechanisms (contact info, chat, self-help, automated contact) are present on multiple pages, they must appear in the same relative order on each page.

```tsx
// ✅ Help link in footer — same position across all pages
<footer>
  <nav aria-label="Footer">
    <a href="/help">Help</a>
    <a href="/contact">Contact</a>
  </nav>
</footer>
```

### Testing Accessibility

#### Automated Testing (axe-core in Playwright)

```typescript
import AxeBuilder from "@axe-core/playwright";

test("recipe page has no a11y violations", async ({ page }) => {
  await page.goto("/recipes");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22a", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

> **Note**: The `wcag22a` and `wcag22aa` tags specifically test the new WCAG 2.2 success criteria, while `wcag2a` and `wcag2aa` cover the baseline from 2.0/2.1.

#### Manual Testing Checklist

1. **Keyboard-only navigation** — Tab through every flow without a mouse.
2. **Screen reader** — Test with NVDA (Windows) or VoiceOver (Mac).
3. **Zoom to 400%** — Ensure no content is lost or overlapping (WCAG 1.4.10).
4. **Color contrast** — Check with browser DevTools or Colour Contrast Analyser.
5. **Forced colors mode** — Test with Windows High Contrast.
6. **`prefers-reduced-motion`** — Verify animations respect the setting.
7. **Focus visibility** — Ensure every focused element has a visible indicator.

#### Component-Level Testing (Vitest + Testing Library)

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("button is keyboard accessible", async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);

  const button = screen.getByRole("button", { name: "Save" });
  button.focus();
  await userEvent.keyboard("{Enter}");
  expect(onClick).toHaveBeenCalled();
});

test("form shows accessible error", async () => {
  render(<RecipeForm />);
  await userEvent.click(screen.getByRole("button", { name: "Submit" }));

  const error = screen.getByRole("alert");
  expect(error).toBeInTheDocument();

  const input = screen.getByRole("textbox", { name: "Recipe Name" });
  expect(input).toHaveAttribute("aria-invalid", "true");
});
```

#### Prefer `*ByRole` Queries

Testing Library queries should prefer accessible role selectors to match how assistive technology sees the page:

| Prefer | Avoid |
|--------|-------|
| `getByRole("button", { name: "Save" })` | `getByTestId("save-btn")` |
| `getByRole("textbox", { name: "Email" })` | `getByPlaceholderText("Email")` |
| `getByRole("heading", { level: 2 })` | `getByText("Title")` |
| `getByRole("alert")` | `getByClassName("error")` |
| `getByLabelText("Password")` | `getById("password-input")` |
