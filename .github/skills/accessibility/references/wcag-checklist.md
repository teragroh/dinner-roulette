````markdown
# WCAG 2.2 AA Success Criteria Checklist

Quick-reference checklist of all WCAG 2.2 **Level A** and **Level AA** success criteria.

**Source**: [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) — W3C Recommendation, 12 December 2024.

Criteria marked with 🆕 are **new in WCAG 2.2**. Criterion 4.1.1 Parsing has been **obsoleted and removed** in WCAG 2.2.

---

## 1. Perceivable

> Information and user interface components must be presentable to users in ways they can perceive.

### 1.1 Text Alternatives

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 1.1.1 | Non-text Content | A | All non-text content has a text alternative serving the equivalent purpose. Controls/inputs have a descriptive name. Decorative images use `alt=""`. CAPTCHA provides alternatives for different sensory modalities. | [§1.1.1](https://www.w3.org/TR/WCAG22/#non-text-content) |

### 1.2 Time-Based Media

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 1.2.1 | Audio-only / Video-only (Prerecorded) | A | Transcript for prerecorded audio-only; transcript or audio description for prerecorded video-only. | [§1.2.1](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) |
| 1.2.2 | Captions (Prerecorded) | A | Captions for all prerecorded audio content in synchronized media. | [§1.2.2](https://www.w3.org/TR/WCAG22/#captions-prerecorded) |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | Audio description or full text alternative for prerecorded video in synchronized media. | [§1.2.3](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) |
| 1.2.4 | Captions (Live) | AA | Captions for all live audio content in synchronized media. | [§1.2.4](https://www.w3.org/TR/WCAG22/#captions-live) |
| 1.2.5 | Audio Description (Prerecorded) | AA | Audio description for all prerecorded video content in synchronized media. | [§1.2.5](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) |

### 1.3 Adaptable

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 1.3.1 | Info and Relationships | A | Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text (headings, lists, tables, form labels). | [§1.3.1](https://www.w3.org/TR/WCAG22/#info-and-relationships) |
| 1.3.2 | Meaningful Sequence | A | When content sequence affects meaning, a correct reading sequence can be programmatically determined. DOM order matches visual order. | [§1.3.2](https://www.w3.org/TR/WCAG22/#meaningful-sequence) |
| 1.3.3 | Sensory Characteristics | A | Instructions don't rely solely on sensory characteristics (shape, color, size, visual location, orientation, or sound). | [§1.3.3](https://www.w3.org/TR/WCAG22/#sensory-characteristics) |
| 1.3.4 | Orientation | AA | Content does not restrict its view and operation to a single display orientation (portrait/landscape), unless essential. | [§1.3.4](https://www.w3.org/TR/WCAG22/#orientation) |
| 1.3.5 | Identify Input Purpose | AA | The purpose of input fields collecting user information can be programmatically determined (use `autocomplete` attributes). | [§1.3.5](https://www.w3.org/TR/WCAG22/#identify-input-purpose) |

### 1.4 Distinguishable

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 1.4.1 | Use of Color | A | Color is not the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element. | [§1.4.1](https://www.w3.org/TR/WCAG22/#use-of-color) |
| 1.4.2 | Audio Control | A | Auto-playing audio > 3 seconds has a mechanism to pause/stop or control volume independently from system volume. | [§1.4.2](https://www.w3.org/TR/WCAG22/#audio-control) |
| 1.4.3 | Contrast (Minimum) | AA | Text contrast ratio ≥ 4.5:1. Large text (≥ 18px or ≥ 14px bold) contrast ratio ≥ 3:1. Excludes logos and incidental text. | [§1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) |
| 1.4.4 | Resize Text | AA | Text can be resized up to 200% without assistive technology and without loss of content or functionality. | [§1.4.4](https://www.w3.org/TR/WCAG22/#resize-text) |
| 1.4.5 | Images of Text | AA | Text is used to convey information rather than images of text, except when customizable or essential (e.g., logotypes). | [§1.4.5](https://www.w3.org/TR/WCAG22/#images-of-text) |
| 1.4.10 | Reflow | AA | Content reflows at 400% zoom without two-dimensional scrolling: ≤ 320 CSS px width (vertical) or ≤ 256 CSS px height (horizontal). Exceptions for content requiring 2D layout (maps, tables, diagrams). | [§1.4.10](https://www.w3.org/TR/WCAG22/#reflow) |
| 1.4.11 | Non-text Contrast | AA | UI components and graphical objects required to understand content have ≥ 3:1 contrast against adjacent colors. Excludes inactive components. | [§1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast) |
| 1.4.12 | Text Spacing | AA | No loss of content or functionality when user overrides: line-height ≥ 1.5×, paragraph spacing ≥ 2× font size, letter-spacing ≥ 0.12× font size, word-spacing ≥ 0.16× font size. | [§1.4.12](https://www.w3.org/TR/WCAG22/#text-spacing) |
| 1.4.13 | Content on Hover or Focus | AA | Additional content triggered by hover/focus is: **dismissible** (Esc), **hoverable** (pointer can move to it), and **persistent** (stays until trigger removed, user dismisses, or info no longer valid). | [§1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) |

---

## 2. Operable

> User interface components and navigation must be operable.

### 2.1 Keyboard Accessible

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 2.1.1 | Keyboard | A | All functionality is operable through a keyboard interface without requiring specific timings, except where the underlying function requires path-dependent input. | [§2.1.1](https://www.w3.org/TR/WCAG22/#keyboard) |
| 2.1.2 | No Keyboard Trap | A | If keyboard focus can be moved to a component, focus can be moved away using only the keyboard. If non-standard keys are needed, the user is advised. | [§2.1.2](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) |
| 2.1.4 | Character Key Shortcuts | A | If single-character keyboard shortcuts exist, they can be turned off, remapped to include a modifier key, or are only active when the component has focus. | [§2.1.4](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) |

### 2.2 Enough Time

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 2.2.1 | Timing Adjustable | A | Time limits can be turned off, adjusted, or extended (20 sec warning + simple action to extend, at least 10×). Exceptions: real-time, essential, > 20 hours. | [§2.2.1](https://www.w3.org/TR/WCAG22/#timing-adjustable) |
| 2.2.2 | Pause, Stop, Hide | A | Moving/blinking/scrolling content (> 5 sec, auto-started, parallel with other content) can be paused/stopped/hidden. Auto-updating content can be paused/stopped or frequency controlled. | [§2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide) |

### 2.3 Seizures & Physical Reactions

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 2.3.1 | Three Flashes or Below Threshold | A | Nothing flashes more than 3 times per second, or the flash is below general flash and red flash thresholds. | [§2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) |

### 2.4 Navigable

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 2.4.1 | Bypass Blocks | A | A mechanism (skip link, landmarks) is available to bypass blocks of content repeated on multiple pages. | [§2.4.1](https://www.w3.org/TR/WCAG22/#bypass-blocks) |
| 2.4.2 | Page Titled | A | Web pages have titles that describe topic or purpose. | [§2.4.2](https://www.w3.org/TR/WCAG22/#page-titled) |
| 2.4.3 | Focus Order | A | Focusable components receive focus in an order that preserves meaning and operability. | [§2.4.3](https://www.w3.org/TR/WCAG22/#focus-order) |
| 2.4.4 | Link Purpose (In Context) | A | Link purpose can be determined from the link text alone or from the link text together with its programmatically determined context. | [§2.4.4](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) |
| 2.4.5 | Multiple Ways | AA | More than one way to locate a page within a set of pages (navigation, search, sitemap, etc.), except for process steps. | [§2.4.5](https://www.w3.org/TR/WCAG22/#multiple-ways) |
| 2.4.6 | Headings and Labels | AA | Headings and labels describe topic or purpose. | [§2.4.6](https://www.w3.org/TR/WCAG22/#headings-and-labels) |
| 2.4.7 | Focus Visible | AA | Any keyboard operable UI has a mode where the keyboard focus indicator is visible. | [§2.4.7](https://www.w3.org/TR/WCAG22/#focus-visible) |
| 2.4.11 | Focus Not Obscured (Minimum) 🆕 | AA | When a component receives keyboard focus, it is not **entirely** hidden by author-created content (sticky headers, banners, overlays). | [§2.4.11](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) |

### 2.5 Input Modalities

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 2.5.1 | Pointer Gestures | A | Multipoint or path-based gestures have single-pointer alternatives, unless essential. | [§2.5.1](https://www.w3.org/TR/WCAG22/#pointer-gestures) |
| 2.5.2 | Pointer Cancellation | A | For single-pointer actions: down-event doesn't trigger the function, OR action triggers on up-event with ability to abort/undo, OR up-event reverses the down-event. | [§2.5.2](https://www.w3.org/TR/WCAG22/#pointer-cancellation) |
| 2.5.3 | Label in Name | A | For components with visible text labels, the accessible name contains the visible text. | [§2.5.3](https://www.w3.org/TR/WCAG22/#label-in-name) |
| 2.5.4 | Motion Actuation | A | Functionality triggered by device/user motion can also be operated via UI components. Motion response can be disabled. Exceptions: accessibility-supported interface, essential. | [§2.5.4](https://www.w3.org/TR/WCAG22/#motion-actuation) |
| 2.5.7 | Dragging Movements 🆕 | AA | All drag-and-drop functionality can be achieved by a single pointer without dragging, unless dragging is essential or determined by the user agent. | [§2.5.7](https://www.w3.org/TR/WCAG22/#dragging-movements) |
| 2.5.8 | Target Size (Minimum) 🆕 | AA | Pointer targets are ≥ 24×24 CSS pixels, or undersized targets have sufficient spacing (24px circle centered on bounding box doesn't overlap another target). Exceptions: inline, equivalent control, user agent determined, essential. | [§2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) |

---

## 3. Understandable

> Information and the operation of the user interface must be understandable.

### 3.1 Readable

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 3.1.1 | Language of Page | A | Default human language of each page can be programmatically determined (`<html lang="en">`). | [§3.1.1](https://www.w3.org/TR/WCAG22/#language-of-page) |
| 3.1.2 | Language of Parts | AA | Human language of each passage or phrase can be programmatically determined (except proper names, technical terms, vernacular). | [§3.1.2](https://www.w3.org/TR/WCAG22/#language-of-parts) |

### 3.2 Predictable

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 3.2.1 | On Focus | A | Receiving focus does not initiate a change of context. | [§3.2.1](https://www.w3.org/TR/WCAG22/#on-focus) |
| 3.2.2 | On Input | A | Changing the setting of a UI component does not automatically cause a change of context unless the user has been advised beforehand. | [§3.2.2](https://www.w3.org/TR/WCAG22/#on-input) |
| 3.2.3 | Consistent Navigation | AA | Navigation mechanisms repeated on multiple pages occur in the same relative order each time. | [§3.2.3](https://www.w3.org/TR/WCAG22/#consistent-navigation) |
| 3.2.4 | Consistent Identification | AA | Components with the same functionality are identified consistently across a set of pages. | [§3.2.4](https://www.w3.org/TR/WCAG22/#consistent-identification) |
| 3.2.6 | Consistent Help 🆕 | A | Help mechanisms (contact info, chat, self-help, automated contact) repeated across pages appear in the same relative order. | [§3.2.6](https://www.w3.org/TR/WCAG22/#consistent-help) |

### 3.3 Input Assistance

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| 3.3.1 | Error Identification | A | If an input error is automatically detected, the item in error is identified and the error is described to the user in text. | [§3.3.1](https://www.w3.org/TR/WCAG22/#error-identification) |
| 3.3.2 | Labels or Instructions | A | Labels or instructions are provided when content requires user input. | [§3.3.2](https://www.w3.org/TR/WCAG22/#labels-or-instructions) |
| 3.3.3 | Error Suggestion | AA | If an input error is detected and suggestions are known, suggestions are provided (unless it would jeopardize security or purpose). | [§3.3.3](https://www.w3.org/TR/WCAG22/#error-suggestion) |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | For pages causing legal/financial commitments or modifying/deleting user data: submissions are reversible, data is checked with opportunity to correct, or a confirmation mechanism exists. | [§3.3.4](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) |
| 3.3.7 | Redundant Entry 🆕 | A | Information previously entered in the same process is auto-populated or available for selection. Exceptions: re-entry essential for security, information no longer valid. | [§3.3.7](https://www.w3.org/TR/WCAG22/#redundant-entry) |
| 3.3.8 | Accessible Authentication (Minimum) 🆕 | AA | No cognitive function test (memorizing passwords, solving puzzles) required for authentication unless: an alternative method exists, a mechanism assists the user (e.g., paste support, password manager), or the test is object recognition / personal content. | [§3.3.8](https://www.w3.org/TR/WCAG22/#accessible-authentication-minimum) |

---

## 4. Robust

> Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

### 4.1 Compatible

| # | Criterion | Level | Summary | Ref |
|---|-----------|-------|---------|-----|
| ~~4.1.1~~ | ~~Parsing~~ | — | **Obsolete and removed in WCAG 2.2.** Assistive technology no longer directly parses HTML. This criterion no longer has utility. Authors required to conform to WCAG 2.0/2.1 may still need to test this. | [§4.1.1](https://www.w3.org/TR/WCAG22/#parsing) |
| 4.1.2 | Name, Role, Value | A | For all UI components: name and role can be programmatically determined; states, properties, and values that can be set by the user can be programmatically set; notification of changes is available to user agents and AT. | [§4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value) |
| 4.1.3 | Status Messages | AA | Status messages can be programmatically determined through role or properties so AT can present them without receiving focus (use `role="status"`, `role="alert"`, or `aria-live`). | [§4.1.3](https://www.w3.org/TR/WCAG22/#status-messages) |

---

## How to Use This Checklist

1. **Per-component**: Check relevant criteria when building a new component.
2. **Per-page**: Audit each page against the full list before release.
3. **Automated**: Use `axe-core` with `.withTags(["wcag2a", "wcag2aa", "wcag22a", "wcag22aa"])` in Playwright tests to catch ~40% of violations automatically.
4. **Manual**: Supplement with keyboard testing, screen reader testing, and zoom testing for the remaining ~60%.

## Conformance Notes (from [WCAG 2.2 §5](https://www.w3.org/TR/WCAG22/#conformance))

- **Conformance is for full pages** — you cannot claim partial page conformance (§5.2.2).
- **Complete processes** — all pages in a process must conform, e.g., the entire checkout flow (§5.2.3).
- **Non-interference** — even non-conforming technologies on a page must not block: audio control (1.4.2), no keyboard trap (2.1.2), three flashes (2.3.1), and pause/stop/hide (2.2.2) (§5.2.5).
- **Privacy considerations** — 2.2.6 Timeouts and 3.3.7 Redundant Entry may have privacy implications (§5.6).
- **Security considerations** — criteria like 3.3.8 Accessible Authentication and 3.3.7 Redundant Entry have security-related exceptions (§5.7).

## Quick Audit Commands

```bash
# Lighthouse a11y audit (Chrome)
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json

# axe-core CLI
npx @axe-core/cli http://localhost:3000
```
````
