# Kairos v2 - Business Event Discovery Platform

## Overview

Kairos v2 is a web platform designed to help digital transformation companies in the Philippines discover business events where their target clients attend. The application enables strategic networking by allowing users to search and filter events based on industry and company stage, replacing cold calling with targeted event attendance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with Express routes
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Connection**: Neon serverless with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Core Features
1. **Event Search & Filtering**: Search events by query, industry, and company stage
2. **Featured Events**: Curated list of recommended events
3. **Event Management**: CRUD operations for event data
4. **Responsive Design**: Mobile-first approach with Tailwind CSS

### Database Schema
- **Events Table**: Stores event information including name, location, attendee types, industry, and company stages
- **Users Table**: Basic user authentication structure (username/password)

### API Endpoints
- `GET /api/events` - Search and filter events
- `GET /api/events/featured` - Get featured events
- `POST /api/events` - Create new events
- `GET /api/events/:id` - Get specific event by ID

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and validate data using Zod schemas
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: Data is returned as JSON and cached by React Query
5. **UI Updates**: Components reactively update based on query results

## External Dependencies

### Development Tools
- **Replit Integration**: Configured with Replit-specific plugins for development environment
- **TypeScript**: Strict type checking across the entire stack
- **ESLint/Prettier**: Code formatting and linting (implied by structure)

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for UI elements
- **Class Variance Authority**: Type-safe CSS class variants
- **Date-fns**: Date manipulation utilities

### Database & Backend
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: For real-time database connections
- **Session Management**: connect-pg-simple for PostgreSQL session storage

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with HMR
- **Database**: Drizzle push for schema synchronization
- **Environment**: NODE_ENV=development with tsx execution

### Production
- **Build Process**: 
  1. Vite builds client-side React application
  2. esbuild bundles server code for Node.js
- **Server**: Express server serves both API and static files
- **Database**: Production PostgreSQL with connection pooling
- **Environment**: NODE_ENV=production with optimized builds

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Output**: 
  - Client: `dist/public` directory
  - Server: `dist/index.js` bundle
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

The application follows a monorepo structure with shared TypeScript schemas and utilities, enabling type safety across the full stack while maintaining clear separation between client and server concerns.