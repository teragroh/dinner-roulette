# ARIA Patterns & Widget Reference

Common ARIA widget patterns with required roles, states, properties, and keyboard interactions. Based on the [WAI-ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (W3C Recommendation, 12 December 2024).

## Table of Contents
- [Landmark Roles](#landmark-roles)
- [Widget Roles Quick Reference](#widget-roles-quick-reference)
- [Tabs](#tabs)
- [Dialog (Modal)](#dialog-modal)
- [Menu / Menu Button](#menu--menu-button)
- [Combobox (Autocomplete)](#combobox-autocomplete)
- [Accordion](#accordion)
- [Switch](#switch)
- [Alert & Status](#alert--status)
- [Tooltip](#tooltip)
- [Listbox](#listbox)
- [Drag-and-Drop Alternatives](#drag-and-drop-alternatives)
- [Common ARIA Attributes](#common-aria-attributes)
- [Focus Management Techniques](#focus-management-techniques)

---

## Landmark Roles

| Role | HTML Equivalent | Purpose |
|------|----------------|---------|
| `banner` | `<header>` (top-level) | Site header with logo, nav |
| `navigation` | `<nav>` | Navigation links |
| `main` | `<main>` | Primary content area |
| `complementary` | `<aside>` | Supporting content |
| `contentinfo` | `<footer>` (top-level) | Footer with copyright, links |
| `search` | `<search>` | Search functionality |
| `region` | `<section>` (with label) | Named section of content |
| `form` | `<form>` (with label) | Form landmark |

**Multiple landmarks of the same type** must be distinguished with `aria-label`:
```html
<nav aria-label="Primary">…</nav>
<nav aria-label="Footer">…</nav>
```

---

## Widget Roles Quick Reference

| Pattern | Key Roles | Key States/Properties |
|---------|-----------|----------------------|
| Tabs | `tablist`, `tab`, `tabpanel` | `aria-selected`, `aria-controls` |
| Dialog | `dialog` or `alertdialog` | `aria-modal`, `aria-labelledby` |
| Menu | `menu`, `menuitem` | `aria-expanded`, `aria-haspopup` |
| Combobox | `combobox`, `listbox`, `option` | `aria-expanded`, `aria-activedescendant` |
| Accordion | `button`, `region` | `aria-expanded`, `aria-controls` |
| Listbox | `listbox`, `option` | `aria-selected`, `aria-multiselectable` |
| Tree | `tree`, `treeitem` | `aria-expanded`, `aria-level` |
| Switch | `switch` | `aria-checked` |

---

## Tabs

### Structure
```tsx
<div role="tablist" aria-label="Recipe details">
  <button role="tab" id="tab-1" aria-selected={active === 0} aria-controls="panel-1" tabIndex={active === 0 ? 0 : -1}>
    Ingredients
  </button>
  <button role="tab" id="tab-2" aria-selected={active === 1} aria-controls="panel-2" tabIndex={active === 1 ? 0 : -1}>
    Instructions
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabIndex={0} hidden={active !== 0}>
  {/* content */}
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabIndex={0} hidden={active !== 1}>
  {/* content */}
</div>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `→` / `←` | Move to next/previous tab (wrap around) |
| `Home` | First tab |
| `End` | Last tab |
| `Space` / `Enter` | Activate tab (if using manual activation) |
| `Tab` | Move focus into the active tab panel |

### Rules
- Only the **active** tab has `tabIndex={0}`, all others have `tabIndex={-1}`.
- Use **roving tabindex**: arrow keys move focus AND update `tabIndex`.
- Each tab must have `aria-controls` pointing to its panel `id`.
- Each panel must have `aria-labelledby` pointing to its tab `id`.

---

## Dialog (Modal)

### Structure
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Delete Recipe</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <Button autoFocus>Confirm</Button>
  <Button>Cancel</Button>
</div>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `Tab` | Cycle focus within the dialog (focus trap) |
| `Shift+Tab` | Reverse cycle focus within the dialog |
| `Escape` | Close the dialog |

### Rules
- **Focus trap**: Tab must cycle within the dialog only.
- **Initial focus**: Move to first focusable element, or a reasonable default (often the primary CTA or the close button — never the destructive action).
- **Restore focus**: On close, return focus to the element that triggered the dialog.
- Use `alertdialog` role for confirmation dialogs that require a decision.
- Radix UI `Dialog` and shadcn/ui `Dialog` handle focus trapping and restoration automatically.

---

## Menu / Menu Button

### Structure
```tsx
<Button
  aria-haspopup="true"
  aria-expanded={isOpen}
  aria-controls="action-menu"
>
  Actions
</Button>
{isOpen && (
  <ul role="menu" id="action-menu" aria-label="Recipe actions">
    <li role="menuitem" tabIndex={-1} onClick={handleEdit}>Edit</li>
    <li role="menuitem" tabIndex={-1} onClick={handleDuplicate}>Duplicate</li>
    <li role="separator" />
    <li role="menuitem" tabIndex={-1} onClick={handleDelete}>Delete</li>
  </ul>
)}
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `Enter` / `Space` / `↓` | Open menu, focus first item |
| `↑` / `↓` | Navigate between items |
| `Home` | First item |
| `End` | Last item |
| `Escape` | Close menu, return focus to trigger |
| Type-ahead | Focus matching item |

### Rules
- Menu button sets `aria-haspopup="true"` and `aria-expanded`.
- Only one item in the menu is in the tab order at a time (roving tabindex).
- `role="separator"` for visual dividers between menu groups.

---

## Combobox (Autocomplete)

### Structure
```tsx
<div>
  <Label htmlFor="ingredient">Ingredient</Label>
  <Input
    id="ingredient"
    role="combobox"
    aria-expanded={isOpen}
    aria-controls="ingredient-listbox"
    aria-activedescendant={activeOptionId}
    aria-autocomplete="list"
  />
  {isOpen && (
    <ul role="listbox" id="ingredient-listbox">
      {options.map((opt) => (
        <li
          key={opt.id}
          id={`option-${opt.id}`}
          role="option"
          aria-selected={opt.id === selectedId}
        >
          {opt.name}
        </li>
      ))}
    </ul>
  )}
</div>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `↓` | Open list (if closed) or move to next option |
| `↑` | Move to previous option |
| `Enter` | Select highlighted option |
| `Escape` | Close list, clear selection |
| Typing | Filter options |

### Rules
- Input has `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- `aria-autocomplete`: `"list"` (suggestions), `"inline"` (auto-complete), or `"both"`.
- Options use `role="option"` with `aria-selected`.
- Visual highlight must match `aria-activedescendant`.

---

## Accordion

### Structure
```tsx
<div>
  <h3>
    <button
      aria-expanded={isOpen}
      aria-controls="section-1-content"
      id="section-1-header"
    >
      Ingredients
    </button>
  </h3>
  <div
    id="section-1-content"
    role="region"
    aria-labelledby="section-1-header"
    hidden={!isOpen}
  >
    {/* content */}
  </div>
</div>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `Enter` / `Space` | Toggle section |
| `↓` | Next accordion header |
| `↑` | Previous accordion header |
| `Home` | First header |
| `End` | Last header |

---

## Switch

A switch is a type of checkbox that represents on/off values, as opposed to checked/unchecked.

### Structure
```tsx
<Label htmlFor="dark-mode">Dark mode</Label>
<button
  id="dark-mode"
  role="switch"
  aria-checked={isDarkMode}
  onClick={() => setIsDarkMode(!isDarkMode)}
>
  {isDarkMode ? "On" : "Off"}
</button>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `Space` | Toggle the switch |
| `Enter` | Toggle the switch (optional but recommended) |

### Rules
- Use `role="switch"` with `aria-checked` (`true`/`false`).
- Do NOT use `aria-checked="mixed"` — switches are binary.
- Label must be associated via `aria-labelledby` or `<label>`.
- shadcn/ui `Switch` component (Radix) handles this automatically.

---

## Alert & Status

### Alert (urgent, interrupting)
```tsx
// Implicitly assertive — announces immediately
<div role="alert">
  <p>Failed to save recipe. Please try again.</p>
</div>
```

### Status (non-urgent, polite)
```tsx
// Implicitly polite — announces when user is idle
<div role="status">
  <p>Recipe saved successfully.</p>
</div>
```

### Rules
- `role="alert"` = implicit `aria-live="assertive"` — use sparingly.
- `role="status"` = implicit `aria-live="polite"` — preferred for most updates.
- Container must exist in DOM before content appears.
- Use `aria-atomic="true"` to re-read entire region on any change.

---

## Tooltip

### Structure
```tsx
<button aria-describedby="tip-1">
  <InfoIcon aria-hidden="true" />
</button>
<div role="tooltip" id="tip-1">
  Cooking time does not include prep time.
</div>
```

### Rules
- Tooltip must be associated via `aria-describedby` (descriptions) or `aria-labelledby` (names).
- Show on focus AND hover.
- Dismiss with `Escape`.
- Don't put interactive content inside tooltips.
- Radix `Tooltip` handles these patterns automatically.

---

## Listbox

### Structure
```tsx
<Label id="category-label">Category</Label>
<ul role="listbox" aria-labelledby="category-label" tabIndex={0}>
  <li role="option" id="opt-1" aria-selected={selected === "appetizer"}>Appetizer</li>
  <li role="option" id="opt-2" aria-selected={selected === "main"}>Main Course</li>
  <li role="option" id="opt-3" aria-selected={selected === "dessert"}>Dessert</li>
</ul>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `↓` / `↑` | Move selection |
| `Home` | First option |
| `End` | Last option |
| Type-ahead | Jump to matching option |
| `Space` | Toggle selection (multi-select) |

For multi-select, add `aria-multiselectable="true"` to the listbox.

---

## Drag-and-Drop Alternatives

WCAG 2.2 criterion **2.5.7 Dragging Movements (AA)** requires that all dragging functionality has a single-pointer alternative.

### Reorderable List Pattern
```tsx
// ✅ Provide move up/down buttons alongside drag handles
<ul role="list" aria-label="Ingredients">
  {ingredients.map((item, index) => (
    <li key={item.id} className="flex items-center gap-2">
      {/* Drag handle (optional enhancement) */}
      <GripVertical aria-hidden="true" className="cursor-grab" />

      <span>{item.name}</span>

      {/* Single-pointer alternatives */}
      <Button
        aria-label={`Move ${item.name} up`}
        size="icon"
        disabled={index === 0}
        onClick={() => moveItem(index, index - 1)}
      >
        <ChevronUp aria-hidden="true" />
      </Button>
      <Button
        aria-label={`Move ${item.name} down`}
        size="icon"
        disabled={index === ingredients.length - 1}
        onClick={() => moveItem(index, index + 1)}
      >
        <ChevronDown aria-hidden="true" />
      </Button>
    </li>
  ))}
</ul>
```

### Keyboard
| Key | Behavior |
|-----|----------|
| `Tab` | Move to next move button |
| `Enter` / `Space` | Activate the move up/down button |

### Rules
- Always provide a non-drag alternative (buttons, select/input, keyboard arrows).
- Drag-only interactions with no alternative **fail WCAG 2.5.7**.
- Consider `aria-live="polite"` announcements when items are reordered.
- For sortable lists, announce the new position: "Flour moved to position 2 of 5."

---

## Common ARIA Attributes

### Labeling

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Provides an accessible name directly | `<button aria-label="Close">` |
| `aria-labelledby` | References another element as the label | `<div aria-labelledby="heading-1">` |
| `aria-describedby` | References supplementary description | `<input aria-describedby="help-text">` |
| `aria-errormessage` | References error message element | `<input aria-errormessage="err-1">` |

**Priority of name computation**: `aria-labelledby` > `aria-label` > `<label>` > `title`.

### State

| Attribute | Values | Used On |
|-----------|--------|---------|
| `aria-expanded` | `true` / `false` | Buttons that control collapsible content |
| `aria-selected` | `true` / `false` | Tabs, options, tree items |
| `aria-checked` | `true` / `false` / `mixed` | Checkboxes, switches, radio buttons |
| `aria-pressed` | `true` / `false` / `mixed` | Toggle buttons |
| `aria-disabled` | `true` / `false` | Any element (prefer `disabled` attr on native) |
| `aria-hidden` | `true` / `false` | Hide from AT but keep visible |
| `aria-invalid` | `true` / `false` | Form controls with validation errors |
| `aria-busy` | `true` / `false` | Loading regions |
| `aria-current` | `page` / `step` / `date` / `true` | Active nav item, wizard step |

### Relationships

| Attribute | Purpose |
|-----------|---------|
| `aria-controls` | Element that this element controls |
| `aria-owns` | Elements that are logically children but not DOM children |
| `aria-flowto` | Overrides reading order for AT |
| `aria-activedescendant` | Virtual focus — ID of the active child in a composite widget |

---

## Focus Management Techniques

### Focus Not Obscured (WCAG 2.4.11 — New in 2.2, AA)

When a component receives keyboard focus, it must not be entirely hidden by author-created content. Common offenders:
- Sticky headers/footers covering focused content below/above
- Cookie consent banners overlaying page content
- Floating action buttons covering form fields

**Fixes:**
```css
/* Ensure focused elements scroll clear of sticky headers */
* {
  scroll-margin-top: 4rem; /* height of sticky header */
  scroll-margin-bottom: 4rem; /* height of sticky footer */
}
```

### Roving tabindex

For composite widgets (tabs, menus, listboxes):
1. Container has `tabIndex={0}`.
2. Active item has `tabIndex={0}`, all others `tabIndex={-1}`.
3. Arrow keys move focus AND update tabIndex values.
4. `Tab` leaves the widget entirely.

```tsx
const [activeIndex, setActiveIndex] = useState(0);

function handleKeyDown(e: KeyboardEvent) {
  let next = activeIndex;
  if (e.key === "ArrowRight") next = (activeIndex + 1) % items.length;
  if (e.key === "ArrowLeft") next = (activeIndex - 1 + items.length) % items.length;
  setActiveIndex(next);
  itemRefs.current[next]?.focus();
}
```

### aria-activedescendant

Alternative to roving tabindex — container keeps focus, "virtual" highlight:
1. Container has `tabIndex={0}` and keeps DOM focus.
2. Set `aria-activedescendant` to the `id` of the visually highlighted item.
3. Arrow keys update `aria-activedescendant`, container never loses focus.

Best for: comboboxes, very large lists, grid cells.

### Focus Restoration

After closing a dialog, popover, or removing a focused element:
```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

function handleClose() {
  setOpen(false);
  // Return focus to the element that opened the dialog
  triggerRef.current?.focus();
}
```
