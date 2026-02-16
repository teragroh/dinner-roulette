---
description: 'Scaffold a new backend feature module with controller, service, repository, DTOs, mapper, and tests'
agent: agent
tools: ['editFiles', 'search']
---

# Scaffold Backend Module

Create a new backend feature module for: **${input:moduleName}**

## Structure to Create

Under `src/main/java/com/teragroh/dinner_roulette/${input:moduleName}/`:

```
${input:moduleName}/
├── controller/
│   └── ${input:moduleName}Controller.java
├── dto/
│   ├── ${input:moduleName}RequestDTO.java
│   └── ${input:moduleName}ResponseDTO.java
├── exception/
│   └── ${input:moduleName}NotFoundException.java
├── mapper/
│   └── ${input:moduleName}Mapper.java
├── model/
│   └── ${input:moduleName}.java       (JPA entity)
├── repository/
│   └── ${input:moduleName}Repository.java
└── service/
    └── ${input:moduleName}Service.java
```

## Conventions

- Controller: `@RestController`, `@RequestMapping("/api/${input:moduleName}s")`, returns `ResponseEntity<>`.
- Service: constructor injection, returns DTOs via mapper.
- Repository: extends `JpaRepository<Entity, Long>`.
- DTOs: Jakarta Validation annotations on request DTO.
- Mapper: static methods `toDto()` and `toEntity()`.
- Entity: `@Entity`, `@Table`, `@Id @GeneratedValue`.

## Also Create Test Files

Under `src/test/java/com/teragroh/dinner_roulette/${input:moduleName}/`:

- `service/${input:moduleName}ServiceTest.java` — unit tests with Mockito.
- `controller/${input:moduleName}ControllerTest.java` — MockMvc integration tests.

Follow the same patterns used in the `recipe/` and `user/` modules.
