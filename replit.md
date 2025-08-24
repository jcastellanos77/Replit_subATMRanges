# ATM Shop Directory

## Overview

This is a React-based web application for the Alianza de Tiradores en México (ATM) that serves as a comprehensive directory for firearms-related shops and services in Mexico. The application provides a searchable and filterable interface for users to find gun shops, training facilities, equipment suppliers, and other firearms-related businesses. Built with modern web technologies, it features a responsive design optimized for both desktop and mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and better development experience
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui for consistent, accessible design system
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints for shop data retrieval with filtering capabilities

### Database Schema
The application uses Drizzle ORM with PostgreSQL schema definitions:
- **Users Table**: Basic user authentication with username/password
- **Shops Table**: Comprehensive shop information including location data, categories, ratings, and verification status
- **Geographic Data**: Latitude/longitude coordinates for mapping integration
- **Categories**: Array-based categorization system for flexible shop classification

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Schema Validation**: Zod schemas for runtime type validation and data integrity
- **Migration Support**: Drizzle Kit for database migrations and schema management

### Component Architecture
- **Design System**: Comprehensive UI component library based on Radix primitives
- **Layout Components**: Header with navigation, Footer with organizational information
- **Business Components**: ShopCard for displaying shop information, ShopFilters for search/filter functionality
- **Utility Components**: Toast notifications, loading skeletons, responsive design helpers

### Development Tooling
- **Type Checking**: Full TypeScript configuration with strict mode enabled
- **Code Quality**: ESLint and Prettier integration for consistent code formatting
- **Development Server**: Hot module replacement for rapid development iteration
- **Build Process**: Optimized production builds with code splitting and asset optimization

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connectivity for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations and migrations
- **@tanstack/react-query**: Server state management and caching solution

### UI and Design
- **@radix-ui/***: Complete set of accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library for consistent iconography

### Development and Build
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced debugging

### Geographic and Mapping
- **Google Maps Integration**: External mapping service for shop location visualization
- **Geolocation Data**: Latitude/longitude storage for precise shop positioning

### Validation and Forms
- **zod**: Runtime type validation for API requests and responses
- **react-hook-form**: Performant form handling with validation integration
- **@hookform/resolvers**: Zod resolver integration for form validation

The application is designed with modularity and scalability in mind, using industry-standard patterns and tools that allow for easy maintenance and feature expansion. The architecture supports both current requirements and future enhancements such as user authentication, advanced search capabilities, and additional business features.