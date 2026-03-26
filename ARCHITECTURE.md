# AutoExec AI - System Architecture

## Overview

AutoExec AI is a production-ready SaaS application that uses a multi-agent AI system to convert meeting transcripts into actionable tasks with intelligent assignment and tracking.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React + Vite)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │   Auth   │  │Dashboard │  │  Tasks   │   │
│  │   Page   │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                   (Node.js + Express)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Users   │  │  Tasks   │  │  Team    │   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                           │  │
│  │  • AI Service Client                                  │  │
│  │  • Notification Service (Email + Slack)               │  │
│  │  • Monitoring Service (Cron Jobs)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      AI Service          │  │      Supabase            │
│   (FastAPI + Python)     │  │   (PostgreSQL + Auth)    │
│                          │  │                          │
│  ┌────────────────────┐ │  │  ┌────────────────────┐ │
│  │  Agent Orchestrator│ │  │  │  Users Table       │ │
│  └────────────────────┘ │  │  │  Team Members      │ │
│           │              │  │  │  Meetings          │ │
│           ▼              │  │  │  Tasks             │ │
│  ┌────────────────────┐ │  │  │  Audit Logs        │ │
│  │  Meeting Analyzer  │ │  │  │  Notifications     │ │
│  │  Agent             │ │  │  │  Escalations       │ │
│  └────────────────────┘ │  │  └────────────────────┘ │
│           │              │  │                          │
│           ▼              │  │  ┌────────────────────┐ │
│  ┌────────────────────┐ │  │  │  Row Level         │ │
│  │  Task Extractor    │ │  │  │  Security (RLS)    │ │
│  │  Agent             │ │  │  └────────────────────┘ │
│  └────────────────────┘ │  └──────────────────────────┘
│           │              │
│           ▼              │
│  ┌────────────────────┐ │
│  │  Assignment Agent  │ │
│  └────────────────────┘ │
│           │              │
│           ▼              │
│  ┌────────────────────┐ │
│  │  Audit Agent       │ │
│  └────────────────────┘ │
│                          │
│  ┌────────────────────┐ │
│  │  Gemini API        │ │
│  │  (google.ai)       │ │
│  └────────────────────┘ │
└──────────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│     External Integrations            │
│  • Slack Webhooks                    │
│  • Email (SMTP)                      │
└──────────────────────────────────────┘
```

## Component Details

### Frontend (React + Vite)

**Technology Stack:**
- React 18 for UI components
- Vite for fast development and building
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Zustand for state management

**Key Features:**
- Modern, Apple-inspired UI design
- Smooth animations and transitions
- Responsive layout
- Real-time updates
- Protected routes with authentication

**Pages:**
1. Landing Page - Marketing and product showcase
2. Auth Pages - Login/Signup with Supabase Auth
3. Onboarding - 3-step setup wizard
4. Dashboard - Overview with stats and quick actions
5. Upload Meeting - Transcript input and processing
6. Tasks - Task management with filters
7. Audit Logs - AI decision transparency
8. Team Management - Team member CRUD

### Backend API (Node.js + Express)

**Technology Stack:**
- Express.js for REST API
- Supabase JS client for database
- Axios for HTTP requests
- Nodemailer for email
- Node-cron for scheduled jobs

**Architecture Patterns:**
- RESTful API design
- Middleware-based authentication
- Service layer separation
- Error handling middleware
- Environment-based configuration

**API Routes:**
- `/api/auth` - Authentication (signup, login, logout)
- `/api/users` - User profile management
- `/api/team` - Team member CRUD
- `/api/meetings` - Meeting upload and processing
- `/api/tasks` - Task management
- `/api/audit` - Audit log retrieval

**Services:**
1. AI Service Client - Communicates with FastAPI
2. Notification Service - Email and Slack delivery
3. Monitoring Service - Deadline checking and escalation

### AI Service (FastAPI + Python)

**Technology Stack:**
- FastAPI for high-performance API
- Google Generative AI (Gemini)
- Pydantic for data validation
- Async/await for concurrency

**Multi-Agent System:**

1. **Meeting Analyzer Agent**
   - Analyzes meeting structure
   - Identifies meeting type
   - Extracts key topics
   - Determines urgency level
   - Identifies participants

2. **Task Extractor Agent**
   - Extracts actionable tasks
   - Infers priority from context
   - Estimates deadlines
   - Identifies keywords for matching
   - Handles explicit mentions

3. **Assignment Agent**
   - Matches tasks to team members
   - Considers role alignment
   - Evaluates skill match
   - Balances workload
   - Provides reasoning and confidence

4. **Audit Agent**
   - Logs all agent actions
   - Records reasoning
   - Tracks confidence scores
   - Stores input/output data

**Agent Orchestration:**
```
Transcript Input
      ↓
Meeting Analyzer (structure analysis)
      ↓
Task Extractor (task identification)
      ↓
For each task:
  Assignment Agent (team member matching)
      ↓
Audit Agent (logging)
      ↓
Return: Tasks + Audit Logs
```

### Database (Supabase PostgreSQL)

**Schema Design:**

**Core Tables:**
- `users` - User profiles and preferences
- `team_members` - Team member information
- `meetings` - Meeting transcripts and metadata
- `tasks` - Extracted and assigned tasks
- `audit_logs` - AI decision logs
- `notifications` - Notification tracking
- `escalations` - Escalation records

**Key Features:**
- Row Level Security (RLS) for data isolation
- Automatic timestamps with triggers
- Foreign key relationships
- Indexes for performance
- JSONB for flexible metadata

**Security:**
- RLS policies per table
- User-scoped data access
- Service role for admin operations
- Secure authentication with JWT

### Notification System

**Email Notifications:**
- HTML templates with branding
- Task assignment notifications
- Deadline reminders
- Escalation alerts
- SMTP delivery via Nodemailer

**Slack Notifications:**
- Webhook-based delivery
- Rich message formatting
- Task details and links
- Priority indicators

**Notification Types:**
1. Assignment - New task assigned
2. Reminder - Deadline approaching
3. Escalation - Deadline missed
4. Completion - Task completed

### Monitoring & Automation

**Cron Jobs:**
- Runs every hour
- Checks all pending tasks
- Compares deadlines to current time
- Sends reminders based on preferences
- Creates escalations for missed deadlines
- Logs all actions to audit trail

**Escalation Logic:**
```
If deadline passed:
  Calculate hours past deadline
  If > escalation_threshold:
    Create escalation record
    Send escalation notification
    Log to audit trail
```

**Reminder Logic:**
```
For each reminder interval (24h, 48h, 72h):
  If hours_until_deadline ≈ interval:
    If no recent reminder sent:
      Send reminder notification
      Log to audit trail
```

## Data Flow

### Meeting Processing Flow

```
1. User uploads transcript
   ↓
2. Backend creates meeting record (status: pending)
   ↓
3. Backend calls AI Service with:
   - Transcript
   - Team members
   - User context
   ↓
4. AI Service orchestrates agents:
   a. Analyze meeting
   b. Extract tasks
   c. Assign each task
   d. Generate audit logs
   ↓
5. AI Service returns:
   - Structured tasks
   - Audit logs
   ↓
6. Backend saves to database:
   - Insert tasks
   - Insert audit logs
   - Update meeting status
   ↓
7. Backend sends notifications:
   - Email to assignees
   - Slack messages
   ↓
8. User sees tasks in dashboard
```

### Task Update Flow

```
1. User updates task status
   ↓
2. Backend validates request
   ↓
3. Backend updates database
   ↓
4. If status = completed:
   - Set completed_at timestamp
   - Send completion notification
   ↓
5. Frontend refreshes task list
```

## Security Considerations

**Authentication:**
- Supabase Auth with JWT tokens
- Secure password hashing
- Token-based API authentication
- Protected routes in frontend

**Authorization:**
- Row Level Security in database
- User-scoped data access
- Service role for admin operations
- Middleware authentication checks

**Data Protection:**
- Environment variables for secrets
- HTTPS in production
- Input validation
- SQL injection prevention (Supabase)
- XSS prevention (React)

**API Security:**
- CORS configuration
- Rate limiting (recommended)
- Request validation
- Error message sanitization

## Scalability

**Horizontal Scaling:**
- Stateless backend API
- Multiple backend instances
- Load balancer distribution
- Shared database connection

**Database Scaling:**
- Supabase auto-scaling
- Connection pooling
- Indexed queries
- Efficient RLS policies

**AI Service Scaling:**
- Async processing
- Queue-based architecture (future)
- Multiple AI service instances
- Gemini API rate limits

**Caching Strategy:**
- Frontend state management
- API response caching (future)
- Database query optimization

## Monitoring & Observability

**Logging:**
- Console logs in development
- Structured logging in production
- Error tracking
- Audit trail in database

**Metrics:**
- API response times
- Task processing duration
- Notification delivery status
- AI confidence scores

**Health Checks:**
- `/health` endpoint on backend
- `/health` endpoint on AI service
- Database connectivity
- External service status

## Future Enhancements

**Planned Features:**
1. Real-time updates with WebSockets
2. Advanced analytics dashboard
3. Custom AI agent training
4. Integration with calendar apps
5. Mobile application
6. Advanced reporting
7. Team collaboration features
8. API rate limiting
9. Redis caching layer
10. Message queue (RabbitMQ/Redis)

**Technical Improvements:**
1. Comprehensive test coverage
2. CI/CD pipeline
3. Docker containerization
4. Kubernetes deployment
5. Advanced monitoring (Datadog/New Relic)
6. Performance optimization
7. Database migrations system
8. API versioning
9. GraphQL API option
10. Microservices architecture

## Technology Choices Rationale

**React + Vite:**
- Fast development experience
- Modern build tooling
- Excellent developer experience
- Large ecosystem

**Node.js + Express:**
- JavaScript full-stack
- Large ecosystem
- Easy integration
- Fast development

**FastAPI:**
- High performance
- Async support
- Automatic API docs
- Python AI libraries

**Supabase:**
- PostgreSQL reliability
- Built-in authentication
- Real-time capabilities
- Generous free tier

**Gemini API:**
- Free tier available
- Good performance
- JSON output support
- Easy integration

This architecture provides a solid foundation for a production-ready SaaS application with room for growth and enhancement.
