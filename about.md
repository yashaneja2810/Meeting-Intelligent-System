# AutoExec AI

AutoExec AI is a production-oriented SaaS platform that turns meeting conversations into executable work. It combines a React frontend, Node.js backend, FastAPI AI service, and Supabase database/auth layer to capture transcripts, extract action items, assign work intelligently, track progress, and keep teams aligned with reminders, notifications, and audit logs.

## What the project does

The application helps organizations move from meetings to execution without manual follow-up work. Users can upload a transcript or run a live meeting, let the system analyze the discussion, extract tasks, assign them to the right team members, and keep the whole workflow visible through dashboards, results pages, and audit trails.

The platform supports both:
- Uploaded meeting transcripts
- Live video meetings with real-time captions, chat, polls, screen sharing, participant tracking, and transcript capture

## Core product goals

- Convert unstructured meeting discussion into structured tasks
- Reduce manual effort after meetings
- Assign tasks using role, skill, and workload context
- Track deadlines and completion status
- Send reminders and notifications automatically
- Keep an auditable record of AI decisions
- Support multiple organizations and dual user roles
- Provide a modern real-time meeting experience

## High-level architecture

The system is split into four main parts:

1. Frontend
   - React application built with Vite
   - Handles all user interfaces, routing, meeting room UX, dashboards, forms, and live collaboration views

2. Backend
   - Node.js and Express API server
   - Authenticates users, manages meetings and tasks, coordinates notifications, handles live meeting sockets, and forwards transcript data to the AI service

3. AI Service
   - Python FastAPI service
   - Orchestrates multiple AI agents to analyze meetings, extract tasks, assign work, and create meeting summaries

4. Supabase
   - PostgreSQL database
   - Authentication, row-level security, and realtime-capable persistent storage

## Technology stack

### Frontend
- React 18
- Vite
- React Router v6
- Zustand for state management
- Framer Motion for animations
- Tailwind CSS for styling
- Supabase JS for auth and data access
- Socket.IO client for live meeting messaging and signaling
- simple-peer for WebRTC video/audio connections
- Browser Speech Recognition for live captions and transcript capture

### Backend
- Node.js 18+
- Express.js
- Socket.IO server for live meetings
- Supabase JS service client
- Axios for HTTP calls to the AI service
- Nodemailer for email delivery
- node-cron for scheduled monitoring jobs
- CORS and JSON middleware for API handling

### AI service
- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic
- google-generativeai for Gemini integration
- groq for alternate model support
- httpx for keep-alive and service calls
- python-dotenv for environment configuration

### Database and auth
- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- UUID-based records
- Realtime-friendly meeting and transcript tables

### Integrations
- Email notifications via SMTP/Nodemailer
- Slack webhook support
- Gemini API for meeting intelligence
- Groq API as an alternate AI provider

## Major features

### 1. Transcript to task automation
- Upload a transcript and process it automatically
- Analyze meeting structure and context
- Detect action items, deadlines, and priorities
- Generate task records in the database
- Link tasks to the original meeting
- Trigger notifications for assigned users

### 2. Intelligent task assignment
- Assign tasks based on team member role and skills
- Consider current workload
- Produce assignment reasoning and confidence values
- Support manual reassignment
- Preserve transparency through audit logs

### 3. Multi-agent AI system
The AI layer is organized as multiple specialist agents:
- Meeting Analyzer Agent: understands the meeting context
- Task Extractor Agent: identifies actionable items
- Assignment Agent: decides who should receive each task
- Audit Agent: stores reasoning and decision details

### 4. Live meetings
The live meeting experience includes:
- Real-time audio/video via WebRTC
- Participant join and leave tracking
- Host and participant roles
- Real-time captions
- Transcript capture
- Public and private chat
- Poll creation and voting
- Hand raise interactions
- Screen sharing
- Meeting end and results pages

### 5. Meeting results and summaries
- Meeting summary page after ending a live meeting
- Minutes of Meeting generation
- Transcript export
- Final task extraction from live meeting transcript
- Participant and duration statistics

### 6. Team management
- Create and manage team members
- Store roles and skills
- Invite and onboard members
- Track workload score and activity
- Support dual-role workflow for admins and employees

### 7. Notifications and reminders
- Email notifications for assignments and invites
- Deadline monitoring with cron jobs
- Escalation support for overdue work
- Notification preferences stored per user

### 8. Auditability and transparency
- AI reasoning stored with decisions
- Task and meeting action history
- Confidence scoring for AI outputs
- Reviewable logs for compliance and debugging

### 9. User experience and UI
- Modern dark meeting room interface
- Dashboard-based workflow for admins and employees
- Responsive layout for desktop and mobile
- Animated transitions and polished cards
- Dedicated live meeting room with sidebar panels

## Main application areas

### Public and auth pages
- Landing page
- Login
- Signup
- Onboarding

### Admin pages
- Admin dashboard
- Upload meeting
- Tasks
- Audit logs
- Team management
- Invites
- Completion requests
- Live meetings
- Create live meeting
- Meeting results

### Employee pages
- Employee dashboard
- My tasks
- Organizations
- Invites

### Live meeting components
- Video grid
- Control bar
- Chat panel
- Participants panel
- Transcript panel
- Poll panel
- Live caption overlay

## Backend responsibilities

The backend is the orchestration layer for all non-UI business logic. It:
- Verifies Supabase auth tokens
- Creates missing user profiles when needed
- Serves REST endpoints for meetings, tasks, users, team management, audit logs, invites, and completion requests
- Manages live meeting state through Socket.IO
- Stores chat messages, polls, transcript segments, and participant status
- Schedules deadline monitoring jobs
- Coordinates transcript processing with the AI service
- Sends notification emails

## AI service responsibilities

The FastAPI service is responsible for the intelligence layer. It:
- Receives meeting transcripts and metadata
- Uses the selected AI provider
- Runs the meeting analyzer, task extractor, assignment agent, and audit agent
- Generates structured task and audit outputs
- Produces meeting summaries and minutes
- Reports health status and supports keep-alive pinging

## Database model

### Core tables
- users
- team_members
- meetings
- tasks
- audit_logs
- notifications
- escalations
- team_invites
- completion_requests

### Live meeting tables
- live_meetings
- meeting_participants
- chat_messages
- polls
- poll_options
- poll_votes
- transcript_segments
- minutes_of_meeting

### Data characteristics
- UUID primary keys
- Foreign key relationships
- JSONB metadata fields where flexibility is needed
- Timestamp tracking for created, updated, joined, left, and processing states
- Row-level security policies for data isolation

## Live meeting signaling model

The live meeting system uses a deterministic WebRTC signaling model:
- Socket.IO authenticates each participant
- The backend assigns meeting room membership and participant identity
- The frontend opens media devices and initializes peer connections
- The backend broadcasts participant events with initiator role hints
- The WebRTC manager uses those hints to avoid double-offer collisions
- Captions and transcripts are synchronized through the socket layer

## Security model

- Supabase Auth JWT-based login
- Protected API routes
- Row Level Security at the database level
- Environment variables for secrets and service keys
- Service-role Supabase access only on backend code
- User isolation by organization and meeting membership

## Reliability and monitoring

- AI service keep-alive pings from backend
- Backend keep-alive pings from AI service
- Deadline monitoring using cron
- Error handling on auth, meeting processing, and live signaling
- Graceful handling for live meeting disconnects and refreshes

## Environment variables

### Frontend
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_API_URL
- VITE_BACKEND_URL

### Backend
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- AI_SERVICE_URL
- FRONTEND_URL
- PORT
- SMTP credentials for notifications

### AI service
- GEMINI_API_KEY
- GROQ_API_KEY
- BACKEND_API_URL
- PORT

## Key workflows

### Transcript upload workflow
1. User submits a transcript
2. Backend stores the meeting
3. Backend calls the AI service
4. AI service extracts tasks and reasoning
5. Backend saves tasks and audit logs
6. Notifications are sent
7. Meeting is marked processed

### Live meeting workflow
1. Host creates or starts a meeting
2. Participants join through the meeting room
3. Socket.IO authenticates each client
4. WebRTC establishes media streams
5. Speech recognition captures captions
6. Transcripts are stored and broadcast
7. Chat, polls, and hand raises update in real time
8. Host ends meeting and results are generated

### Meeting results workflow
1. Meeting ends
2. Backend compiles final transcript
3. AI service generates minutes of meeting
4. Backend stores summary and transcript
5. Results page displays summary, stats, and exports
6. Task extraction can run from the final transcript

## User roles

### Admin
- Creates meetings
- Manages team members
- Views and reassigns tasks
- Reviews audit logs
- Ends live meetings
- Sees meeting summaries and results

### Employee
- Joins meetings
- Receives assigned work
- Views personal tasks
- Responds to invites
- Participates in live meetings and polls

## Design approach

The current UI emphasizes:
- Dark, focused meeting-room visuals
- Fast navigation between workflows
- Clear role-based actions
- Minimal clutter during live meetings
- Strong information hierarchy in dashboards and results pages

## Project structure

- frontend: React application and live meeting UI
- backend: Express API, socket server, notifications, scheduling
- ai-service: FastAPI AI orchestration layer
- supabase: SQL schema and migrations
- documentation files: setup, architecture, fixes, status, and API docs

## Current status

The project includes working code for:
- Authentication
- Team management
- Task extraction and assignment
- Live meetings
- Captions and transcript capture
- Chat and polls
- Meeting results and MOM generation
- Notifications and reminders
- Audit logs

Some areas depend on correct environment setup and the appropriate Supabase migrations being applied.

## Setup summary

1. Install dependencies for frontend, backend, and AI service
2. Configure environment variables
3. Run Supabase schema and migrations
4. Start backend on port 3000
5. Start AI service on port 8000
6. Start frontend on port 5173

## Why this project matters

AutoExec AI removes the manual overhead that usually follows meetings. Instead of losing time rewriting notes, copying action items, and chasing owners, teams get an automated workflow that turns discussion into accountability.

## Documentation references

- README.md
- SETUP.md
- ARCHITECTURE.md
- API_DOCUMENTATION.md
- PROJECT_SUMMARY.md
- DUAL_ROLE_SYSTEM.md
- TESTING_CHECKLIST.md

## Closing note

This repository is not just a meeting app. It is a workflow automation system for post-meeting execution, with live collaboration, AI-backed understanding, and persistent task tracking built in.
