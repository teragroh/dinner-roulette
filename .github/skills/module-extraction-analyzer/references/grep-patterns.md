# Grep Patterns — Dependency Scanning

After discovering feature files (see discovery-strategies.md), use these to scan each file's imports and find what it depends on.

## JS/JSX — Imports and Exports

```bash
# All imports in a specific file
grep -n "from ['\"]" <file>
grep -n "require(" <file>

# All exports
grep -n "^export " <file>
grep -n "module\.exports" <file>

# CSS/SCSS imports
grep -n "@import\|@use\|url(" <file>
```

## Webpack Config

```bash
# Aliases
grep -n "alias" webpack.config.* --include="*.js"

# Loaders referencing feature paths
grep -n "include\|exclude\|test:" webpack.config.* --include="*.js" | grep -i "<feature>"
```

## Jest

```bash
# Mock paths (reveals real dependencies)
grep -n "jest\.mock(" <file>

# Module name mapper (in package.json or jest.config.js)
grep -n "moduleNameMapper" package.json jest.config.*

# Snapshot file references
find . -iname "*.snap" | xargs grep -l "<feature>"
```

## Playwright

```bash
# Base URL / navigation references
grep -n "baseURL\|goto\|navigate" <file>

# Selectors referencing feature-specific elements
grep -n "getByRole\|getByTestId\|getByText\|locator" <file> | grep -i "<feature>"
```

## Env / Config

```bash
# Frontend env vars in a specific file
grep -n "process\.env\." <file>

# Feature flags
grep -n "feature.*flag\|toggle\|enabled\|isEnabled" <file>
```
