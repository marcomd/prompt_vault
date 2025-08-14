# Overview

Iubrompt is a prompt logging application built with a full-stack TypeScript architecture. The application allows users to create, view, search, and manage prompt logs with associated metadata like PR URLs, branches, author information, orchestrator details, LLM models, and tags. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Single-page application using React 18+ with TypeScript for type safety
- **UI Framework**: shadcn/ui component library built on Radix UI primitives for consistent, accessible components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture  
- **Node.js with Express**: RESTful API server using Express.js framework
- **TypeScript**: Full TypeScript implementation for type safety across the stack
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Structure**: RESTful endpoints for CRUD operations on prompt logs with search functionality
- **Middleware**: Request logging, JSON parsing, and error handling middleware
- **Development**: Hot reloading with tsx for development workflow

## Data Layer
- **Database**: PostgreSQL as the primary database using Neon Database serverless platform
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development
- **Data Validation**: Zod schemas for runtime type validation and API contract enforcement

## Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: End-to-end TypeScript with shared schemas between frontend and backend
- **Component Architecture**: Reusable UI components with consistent styling and behavior
- **API-First Design**: RESTful API design with proper HTTP status codes and error handling
- **Responsive Design**: Mobile-first approach with responsive layouts and components

## Development Workflow
- **Monorepo Structure**: Organized codebase with client, server, and shared directories
- **Path Aliases**: TypeScript path mapping for clean imports and better developer experience
- **Development Scripts**: Dedicated scripts for development, building, and database operations
- **Code Quality**: TypeScript strict mode for enhanced type checking and error prevention

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database platform for production data storage
- **Drizzle ORM**: Modern TypeScript ORM for database operations and schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI and Styling
- **shadcn/ui**: Component library providing pre-built accessible components
- **Radix UI**: Headless component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library for consistent iconography

## Frontend Libraries
- **TanStack React Query**: Data fetching and caching library for server state management
- **React Hook Form**: Form library with validation and error handling
- **Zod**: Schema validation library for runtime type checking
- **Wouter**: Lightweight routing library for client-side navigation
- **date-fns**: Date utility library for date formatting and manipulation

## Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing tool with Tailwind CSS integration

## Deployment and Infrastructure
- **Replit**: Development and deployment platform with integrated tooling
- **Node.js Runtime**: Server-side JavaScript runtime environment