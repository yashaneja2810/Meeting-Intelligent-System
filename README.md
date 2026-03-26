# AutoExec AI

An intelligent SaaS platform that transforms meeting transcripts into actionable tasks with automated assignment, tracking, and escalation powered by multi-agent AI systems.

## Overview

AutoExec AI eliminates the manual overhead of post-meeting task management by automatically analyzing meeting transcripts, extracting actionable items, intelligently assigning them to team members based on skills and workload, and providing comprehensive tracking with smart notifications and escalation mechanisms.

## Key Features

### AI-Powered Intelligence
- Multi-agent system with specialized agents for analysis, extraction, assignment, and tracking
- Context-aware task extraction from natural language transcripts
- Intelligent team member assignment based on roles, skills, and current workload
- Automatic deadline inference and priority classification
- Confidence scoring and reasoning transparency for all AI decisions

### Team Management
- Dual-role system supporting both organization admins and employees
- Team member profiles with skills, roles, and workload tracking
- Invitation system for onboarding new team members
- Real-time collaboration across multiple organizations

### Task Tracking & Monitoring
- Comprehensive task dashboard with advanced filtering
- Status tracking with automatic updates and notifications
- Deadline monitoring with intelligent escalation
- Task reassignment with AI-powered recommendations
- Complete audit trail of all actions and decisions

### Notifications & Integrations
- Multi-channel notifications via email and Slack
- Customizable notification preferences per team member
- Real-time updates on task assignments and status changes
- Webhook support for external integrations

### User Experience
- Modern, minimalist black and white glassmorphism design
- Responsive interface optimized for desktop and mobile
- Smooth animations and transitions for enhanced usability
- Intuitive navigation with role-based access control

## Technology Stack

### Frontend
React with Vite for fast development and optimized builds, styled with Tailwind CSS for utility-first design, enhanced with Framer Motion for smooth animations, and integrated with Supabase for authentication and real-time features.

### Backend
Node.js with Express providing RESTful API endpoints, handling authentication middleware, managing business logic, and coordinating between frontend and AI services.

### AI Service
FastAPI-based Python service orchestrating multiple specialized AI agents, powered by Google Gemini API for natural language processing, with comprehensive audit logging and confidence scoring for transparency.

### Database & Authentication
Supabase providing PostgreSQL database with row-level security, built-in authentication with JWT tokens, real-time subscriptions, and secure data management.

### Notifications
Email delivery via SMTP with Resend integration, Slack webhooks for team notifications, and customizable notification templates.

## Project Structure

The project is organized into four main directories: frontend containing the React application, backend housing the Node.js API server, ai-service with the FastAPI AI orchestration layer, and supabase containing database schemas and migrations. Additional documentation is available in dedicated markdown files.

## Getting Started

### Prerequisites

Ensure you have Node.js version 18 or higher, Python 3.10 or higher, a Supabase account for database and authentication, a Google Gemini API key for AI capabilities, and optionally a Slack workspace for team notifications.

### Installation

Detailed setup instructions are available in SETUP.md, which covers database configuration, backend service setup, AI service initialization, and frontend application configuration. Each service includes example environment files to guide configuration.

### Configuration

Environment variables are required for each service. The backend needs Supabase credentials and notification service keys. The AI service requires the Gemini API key and backend URL. The frontend needs Supabase public credentials. Refer to the .env.example files in each directory for complete configuration details.

## Documentation

- **SETUP.md** - Comprehensive installation and configuration guide
- **ARCHITECTURE.md** - System design and technical architecture
- **API_DOCUMENTATION.md** - Complete API endpoint reference
- **DUAL_ROLE_SYSTEM.md** - User roles and permissions explanation
- **PROJECT_SUMMARY.md** - High-level project overview

## Use Cases

### For Organizations
Streamline post-meeting workflows by automatically capturing action items, ensure accountability with clear task assignments, reduce administrative overhead in task management, maintain transparency with complete audit trails, and scale team coordination as the organization grows.

### For Team Members
Receive clear, actionable tasks immediately after meetings, understand why tasks are assigned with AI reasoning, track progress across multiple organizations, get timely notifications for deadlines and updates, and focus on execution rather than task management.

## Security & Privacy

The system implements row-level security in the database, JWT-based authentication with secure token management, environment-based configuration for sensitive credentials, audit logging for compliance and transparency, and data isolation between organizations.

## Contributing

Contributions are welcome. Please ensure code follows the existing style conventions, includes appropriate tests for new features, updates documentation for API changes, and maintains the security and privacy standards of the platform.

## License

This project is licensed under the MIT License, allowing free use, modification, and distribution with attribution.

## Support

For setup assistance, refer to SETUP.md. For technical details, consult ARCHITECTURE.md. For API integration, see API_DOCUMENTATION.md. For issues and questions, use the project's issue tracker.
