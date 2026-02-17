# Grep Patterns by Layer

Use these to scan imports and find dependencies in a Spring Boot + React (JS) + Webpack microservice.

## Frontend — React (JS/JSX)

```bash
# Imports in target feature
grep -rn "from ['\"]" <target> --include="*.js" --include="*.jsx"
grep -rn "require(" <target> --include="*.js" --include="*.jsx"

# Exports in target
grep -rn "^export " <target> --include="*.js" --include="*.jsx"
grep -rn "module\.exports" <target> --include="*.js"

# Webpack aliases — check resolve.alias
grep -rn "resolve" webpack.config.* --include="*.js"
grep -rn "alias" webpack.config.* --include="*.js"

# CSS/SCSS imports
grep -rn "@import\|@use\|url(" <target> --include="*.css" --include="*.scss"
```

## Backend — Spring Boot (Java)

```bash
# Imports in target package
grep -rn "^import " <target> --include="*.java"

# Public API surface
grep -rn "^public class\|^public interface\|^public enum" <target> --include="*.java"

# Spring annotations (controller, service, repository, config)
grep -rn "@RestController\|@Service\|@Repository\|@Configuration\|@Component" <target> --include="*.java"

# JPA entities and table names
grep -rn "@Entity\|@Table" <target> --include="*.java"

# Property references
grep -rn "@Value\|@ConfigurationProperties\|environment\.getProperty" <target> --include="*.java"

# Shared across packages (reverse deps)
grep -rn "import <target.package>" --include="*.java" | grep -v "<target>/"
```

## Tests

```bash
# Jest test imports
grep -rn "from ['\"]" <target> --include="*.test.js" --include="*.spec.js"
grep -rn "jest\.mock(" <target> --include="*.test.js" --include="*.spec.js"

# Playwright test references
grep -rn "from ['\"]" <target> --include="*.spec.js" --include="*.test.js" | grep -i "playwright\|page\|test"

# Test fixtures and data
grep -rn "require(\|from ['\"].*fixture\|from ['\"].*mock\|from ['\"].*stub" <target>
```

## Environment / Config

```bash
# Env vars in frontend
grep -rn "process\.env\." <target> --include="*.js" --include="*.jsx"

# Spring properties
grep -rn "^\w" src/main/resources/application*.properties | grep -i "<feature-keyword>"
grep -rn "^\w" src/main/resources/application*.yml | grep -i "<feature-keyword>"
```
