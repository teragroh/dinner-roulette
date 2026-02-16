---
name: API Design
description: RESTful conventions, request/response DTOs, pagination, error formats, versioning, and OpenAPI spec standards.
---

## Overview

This skill provides the canonical API design patterns for the project. All REST endpoints follow these conventions.

## Instructions

### URL Structure

```
GET    /api/{resources}          — List (paginated)
GET    /api/{resources}/{id}     — Get by ID
POST   /api/{resources}          — Create
PUT    /api/{resources}/{id}     — Full update
PATCH  /api/{resources}/{id}     — Partial update
DELETE /api/{resources}/{id}     — Delete
```

- Use plural nouns for resource names: `/api/recipes`, `/api/users`.
- Use kebab-case for multi-word resources: `/api/meal-plans`.
- Nest sub-resources: `/api/recipes/{id}/ingredients`.

### Request DTO Pattern

```java
public class RecipeRequestDTO {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    @Min(value = 0, message = "Cook time must be non-negative")
    private Integer cookTimeMinutes;
}
```

### Response DTO Pattern

```java
public class RecipeResponseDTO {
    private Long id;          // Always include
    private String name;
    private String description;
    private String username;  // Owner info
    private Instant createdAt;
    private Instant updatedAt;
    private Integer version;  // Optimistic locking
}
```

### Pagination

```json
{
  "content": [...],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 42,
    "totalPages": 3
  }
}
```

Use Spring Data `Pageable` with defaults:
- Default page size: 20
- Max page size: 100
- Default sort: `createdAt,desc`

### Error Response Format

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-02-13T10:30:00Z",
  "errors": [
    { "field": "name", "message": "Name is required" },
    { "field": "cookTimeMinutes", "message": "Must be non-negative" }
  ]
}
```

### HTTP Status Codes

| Code | When |
|------|------|
| 200  | Successful GET, PUT, PATCH |
| 201  | Successful POST (resource created) |
| 204  | Successful DELETE (no content) |
| 400  | Validation error |
| 401  | Missing or invalid authentication |
| 403  | Authenticated but not authorized |
| 404  | Resource not found |
| 409  | Conflict (duplicate, optimistic lock failure) |
| 500  | Unexpected server error |

### OpenAPI / Orval Integration

- Backend exposes OpenAPI spec via SpringDoc at `/v3/api-docs`.
- Frontend generates TypeScript API client with Orval: `npm run generate-api`.
- Never manually write types that Orval generates.
- After any API change: update OpenAPI → regenerate client.
