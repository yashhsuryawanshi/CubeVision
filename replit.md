# Overview

CubeVision is an interactive Rubik's Cube solver application designed for beginners and learners. The app provides AI-powered color detection through image upload, 3D visualization, and educational features to help users understand and solve Rubik's cubes step by step. The application follows a modern full-stack architecture with a React frontend, Express backend, and PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based architecture using functional components and hooks
- **3D Rendering**: Three.js integration via @react-three/fiber and @react-three/drei for interactive 3D cube visualization
- **UI Framework**: Radix UI components with Tailwind CSS for consistent, accessible design system
- **State Management**: Zustand stores for client-side state management (cube data, game state, audio controls)
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design tokens and dark mode support

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Development Setup**: Hot reload with Vite middleware integration for seamless development experience
- **Storage Interface**: Abstracted storage layer with in-memory implementation (easily extensible to database)
- **Modular Routing**: Centralized route registration system for scalable API development

## Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Migration System**: Drizzle Kit for database schema migrations and management
- **Connection**: Neon Database serverless PostgreSQL integration
- **Schema**: User management system with extensible table structure

## Authentication and Authorization
- **User System**: Basic user schema with username/password authentication
- **Validation**: Zod schema validation for type-safe data handling
- **Session Management**: Express session configuration ready for implementation

## External Dependencies

### Third-party Services
- **Roboflow API**: AI-powered color detection service for analyzing uploaded cube face images
- **Neon Database**: Serverless PostgreSQL database hosting

### Key Libraries and Frameworks
- **3D Graphics**: Three.js ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **State Management**: Zustand with persistence middleware
- **UI Components**: Comprehensive Radix UI component library
- **Styling**: Tailwind CSS with PostCSS processing
- **Database**: Drizzle ORM with Neon Database connector
- **Validation**: Zod for runtime type validation
- **Queries**: TanStack Query for server state management
- **Development**: TypeScript, Vite, ESBuild for build pipeline

### Audio and Media Assets
- **Font Loading**: Inter font via Fontsource
- **Asset Support**: GLTF/GLB 3D models, audio files (MP3, OGG, WAV) for enhanced user experience
- **GLSL Shaders**: Custom shader support via vite-plugin-glsl for advanced 3D effects