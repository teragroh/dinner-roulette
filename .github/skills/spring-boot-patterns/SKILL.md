---
name: Spring Boot Layered Architecture
description: Standard patterns for Spring Boot controllers, services, repositories, mappers, and DTOs used in the Dinner Roulette backend.
---

## Overview

This skill provides the canonical patterns for building Spring Boot features in the Dinner Roulette project. Every backend feature follows the same layered structure.

## Instructions

When generating Spring Boot code for this project:

### Controller Pattern

```java
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponseDTO> create(@Valid @RequestBody ResourceRequestDTO request) {
        ResourceResponseDTO created = resourceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Service Pattern

```java
@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public ResourceResponseDTO getById(Long id) {
        Resource resource = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        return ResourceMapper.toDto(resource);
    }

    public ResourceResponseDTO create(ResourceRequestDTO request) {
        Resource entity = ResourceMapper.toEntity(request);
        Resource saved = resourceRepository.save(entity);
        return ResourceMapper.toDto(saved);
    }

    public void delete(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
```

### Mapper Pattern

```java
public class ResourceMapper {

    private ResourceMapper() {}

    public static ResourceResponseDTO toDto(Resource entity) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }

    public static Resource toEntity(ResourceRequestDTO dto) {
        Resource entity = new Resource();
        entity.setName(dto.getName());
        return entity;
    }
}
```

### Repository Pattern

```java
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    // Custom query methods
    Optional<Resource> findByName(String name);
    List<Resource> findAllByUserId(Long userId);
}
```

### Request DTO Pattern

```java
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must be less than 255 characters")
    private String name;

    // getters and setters
}
```

### Exception + Global Handler Pattern

```java
// Custom exception
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// Global handler (in config/)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        // Extract field errors and return 400
    }
}
```

### Unit Test Pattern

```java
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    @Test
    void shouldReturnResource_whenFoundById() {
        // Arrange
        Resource entity = new Resource();
        entity.setId(1L);
        entity.setName("Test");
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(entity));

        // Act
        ResourceResponseDTO result = resourceService.getById(1L);

        // Assert
        assertEquals("Test", result.getName());
    }

    @Test
    void shouldThrow_whenResourceNotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> resourceService.getById(1L));
    }
}
```
