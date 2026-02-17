# Grep Patterns by Language

Use these to scan imports/exports in the target folder and find reverse dependencies across the repo.

## JS/TS

```bash
# Imports in target
grep -rn "from ['\"]" <target> --include="*.ts" --include="*.tsx"
grep -rn "require(" <target> --include="*.js"

# Exports in target
grep -rn "^export " <target> --include="*.ts" --include="*.tsx"

# Reverse deps (consumers outside target)
grep -rn "from ['\"].*<target-path>" --include="*.ts" --include="*.tsx" | grep -v "<target>/"
```

## Java

```bash
# Imports in target
grep -rn "^import " <target> --include="*.java"

# Public API surface
grep -rn "^public class\|^public interface\|^public enum" <target> --include="*.java"

# Reverse deps
grep -rn "import <target.package>" --include="*.java" | grep -v "<target>/"
```

## Python

```bash
# Imports in target
grep -rn "^from \|^import " <target> --include="*.py"

# Reverse deps
grep -rn "from <target_package>\|import <target_package>" --include="*.py" | grep -v "<target>/"
```
