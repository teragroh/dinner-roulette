---
name: Database Patterns
description: JPA entity design, relationships, migrations, indexing, optimistic locking, and query optimization.
---

## Overview

This skill provides the canonical database and JPA patterns for the project.

## Instructions

### Entity Pattern

```java
@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ingredient> ingredients = new ArrayList<>();

    @Version
    private Integer version;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
```

### Key Conventions

- Use `GenerationType.IDENTITY` for PostgreSQL auto-increment.
- Use `@Version` for optimistic locking on all mutable entities.
- Use `@CreationTimestamp` and `@UpdateTimestamp` for audit columns.
- Use `FetchType.LAZY` for all `@ManyToOne` and `@OneToMany` relationships.
- Use `CascadeType.ALL` + `orphanRemoval = true` for owned collections.
- Set `nullable = false` on required columns.
- Set `length` on VARCHAR columns.

### Relationships

```
User  ──< Recipe     (OneToMany)
Recipe ──< Ingredient (OneToMany, cascade ALL, orphanRemoval)
```

### Repository Pattern

```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    Page<Recipe> findAllByUserId(Long userId, Pageable pageable);
    Optional<Recipe> findByIdAndUserId(Long id, Long userId);
    boolean existsByNameAndUserId(String name, Long userId);
}
```

- Extend `JpaRepository<Entity, Long>`.
- Use Spring Data derived query methods when possible.
- Use `@Query` with JPQL for complex queries.
- NEVER concatenate user input into queries.

### Indexing Strategy

```sql
-- Index foreign keys
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
-- Index commonly searched/sorted columns
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

### Migration Best Practices

- Use Flyway or Liquibase for schema migrations.
- Never use `ddl-auto=create` or `ddl-auto=update` in production.
- Migration files are immutable once applied — create new migrations to change schema.
- Name migrations descriptively: `V2__add_ingredients_table.sql`.
- Always provide rollback scripts for reversible migrations.

### Performance

- Use `Pageable` for all list queries — never return unbounded result sets.
- Set max page size (100) to prevent data dumps.
- Use `@EntityGraph` or `JOIN FETCH` to avoid N+1 queries.
- Profile queries with `spring.jpa.show-sql=true` in development.
