# Dinner Roulette

A full-stack application to help you decide what to eat using a roulette-style selection system.

## Project Structure

This is a monorepo containing both the backend and frontend applications:

```
dinner-roulette/
├── src/                    # Java/Spring Boot backend
│   ├── main/
│   │   ├── java/
│   │   │   └── com/teragroh/dinner_roulette/
│   │   │       ├── config/          # Configuration (Security, Audit, File Storage)
│   │   │       ├── common/          # Shared utilities and exceptions
│   │   │       ├── user/            # User feature module
│   │   │       └── recipe/          # Recipe feature module
│   │   └── resources/
│   └── test/
├── ui/                     # React/TypeScript frontend
│   ├── src/
│   │   ├── routes/              # TanStack Router routes
│   │   ├── features/            # Feature-based modules
│   │   ├── components/          # Reusable UI components
│   │   └── config/              # Frontend configuration
│   └── public/
├── pom.xml                 # Maven configuration
└── mvnw                    # Maven wrapper
```

## Backend (Spring Boot)

### Prerequisites
- Java 17+
- Maven 3.8+

### Running the Backend
```bash
# Using Maven wrapper (Windows)
.\mvnw spring-boot:run

# Using Maven wrapper (Unix/Mac)
./mvnw spring-boot:run
```

### Building the Backend
```bash
.\mvnw clean package
```

## Frontend (React + TypeScript)

### Prerequisites
- Node.js 18+
- npm or yarn

### Running the Frontend
```bash
cd ui
npm install
npm run dev
```

### Building the Frontend
```bash
cd ui
npm run build
```

## Features

- 🔐 User Authentication & Authorization (JWT)
- 🍝 Recipe Management
- 📸 Image Upload & Storage
- 🎲 Roulette Selection System
- 🎨 Modern UI with TanStack Router & shadcn/ui

## Tech Stack

### Backend
- Spring Boot 3.x
- Spring Security with JWT
- JPA/Hibernate
- Maven

### Frontend
- React 18
- TypeScript
- TanStack Router
- Vite
- shadcn/ui components
- Tailwind CSS

## License

[Your License Here]

