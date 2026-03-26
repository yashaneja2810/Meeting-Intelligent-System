# Dual-Role System - Admin & Employee Workspaces

## Overview

The application now features a professional dual-role system that separates admin and employee functionalities into distinct workspaces with seamless switching.

## Architecture

### Workspace Switcher
- **Location**: Sidebar (top section)
- **Modes**: 
  - 👔 Admin Mode - Manage organization
  - 👤 Employee Mode - View assigned tasks
- **Switching**: One-click toggle between workspaces

---

## Admin Workspace

**Purpose**: Manage your organization, team, meetings, and tasks

### Pages

#### 1. Organization Dashboard (`/admin/dashboard`)
- **Stats Overview**:
  - Total Tasks
  - Pending Tasks
  - Completed Tasks
  - Team Members (joined)
  - Meetings Processed
  - Pending Invites
- **Quick Actions**:
  - Upload Meeting
  - Manage Team
- **Recent Tasks List**

#### 2. Upload Meeting (`/admin/upload`)
- Upload/paste meeting transcripts
- AI processing with multi-agent system
- Example transcripts
- Real-time processing status

#### 3. All Tasks (`/admin/tasks`)
- View all organization tasks
- Filter by status and assignee
- Task management (update, reassign)
- AI assignment reasoning
- Confidence scores

#### 4. Team Management (`/admin/team`)
- Add/edit/delete team members
- Send invitations
- View invite status:
  - ✅ Joined
  - ⏳ Invite Pending
  - ❌ Not Invited
- Manage roles and skills
- Slack integration

#### 5. Audit Logs (`/admin/audit`)
- Complete AI decision history
- Filter by agent type
- View reasoning and confidence
- Input/output data tracking

#### 6. Sent Invites (`/admin/invites`)
- View all sent invitations
- Track invitation status
- See response dates

---

## Employee Workspace

**Purpose**: View and manage your assigned tasks

### Pages

#### 1. My Workspace (`/employee/dashboard`)
- **Stats Overview**:
  - My Tasks (total)
  - Pending Tasks
  - In Progress Tasks
  - Completed Tasks
  - Organizations (joined)
  - Pending Invites
- **Quick Actions**:
  - View My Tasks
  - Pending Invitations (if any)
- **Recent Tasks List**

#### 2. My Tasks (`/employee/tasks`)
- **Task Stats**: Total, Pending, In Progress, Completed
- **Filters**: All, Pending, In Progress, Completed, Blocked
- **Task Actions**:
  - Start Working (pending → in_progress)
  - Mark Complete (in_progress → completed)
  - Mark Blocked (in_progress → blocked)
  - Resume (blocked → in_progress)
- **Task Details**:
  - Priority with color coding
  - Deadline information
  - Assignment reason (why assigned to you)
  - AI confidence score
  - Meeting context
- **Task Detail Modal**: Full task information

#### 3. Organizations (`/employee/organizations`)
- View all organizations you're part of
- Organization stats:
  - Total tasks
  - Pending tasks
  - Completed tasks
  - Completion percentage
- Last activity tracking
- Progress visualization

#### 4. Invitations (`/employee/invites`)
- View received invitations
- Accept/Reject invitations
- See invitation details:
  - Company name
  - Role
  - Expected skills
  - Invitation date

---

## Key Features

### Workspace Separation
- **Clean UI**: Each workspace has its own navigation
- **Context Awareness**: UI adapts based on active workspace
- **Visual Indicators**: Color-coded workspace badges

### Role-Based Access
- **Admin**: Full organization management
- **Employee**: Task-focused interface
- **Dual Role**: Users can be both admin (of their org) and employee (in other orgs)

### Smart Navigation
- **Persistent State**: Workspace preference remembered
- **Deep Linking**: Direct access to specific pages
- **Breadcrumbs**: Clear navigation hierarchy

### Professional Design
- **Modern UI**: Apple/AWS-inspired design
- **Smooth Animations**: Framer Motion transitions
- **Responsive**: Works on all screen sizes
- **Intuitive**: Clear visual hierarchy

---

## User Flows

### Admin Flow
1. Login → Admin Dashboard
2. Add team members
3. Send invitations
4. Upload meeting transcript
5. AI processes and assigns tasks
6. Monitor task progress
7. View audit logs for transparency

### Employee Flow
1. Receive invitation email
2. Create account / Login
3. Accept invitation
4. View My Tasks
5. Start working on tasks
6. Update task status
7. Mark tasks complete

### Dual-Role Flow
1. User manages their own organization (Admin)
2. User receives invitation from another org
3. Accepts invitation (becomes Employee)
4. Switches between workspaces:
   - Admin: Manage own team
   - Employee: Complete assigned tasks

---

## Technical Implementation

### Frontend Structure
```
src/
├── pages/
│   ├── admin/
│   │   └── AdminDashboard.jsx
│   ├── employee/
│   │   ├── EmployeeDashboard.jsx
│   │   └── Organizations.jsx
│   ├── MyTasks.jsx
│   ├── Tasks.jsx
│   ├── TeamManagement.jsx
│   └── ...
├── components/
│   ├── DashboardLayout.jsx (with workspace switcher)
│   └── InviteNotification.jsx
└── ...
```

### Backend Routes
```
/api/tasks          - Admin: All organization tasks
/api/my-tasks       - Employee: Personal tasks
/api/team           - Admin: Team management
/api/invites/sent   - Admin: Sent invitations
/api/invites/received - Employee: Received invitations
```

### Database Schema
- `users` - User profiles
- `team_members` - Team member records with invite_status
- `team_invites` - Invitation tracking
- `tasks` - Task assignments
- `audit_logs` - AI decision logs

---

## Benefits

### For Admins
- ✅ Complete organization control
- ✅ AI-powered task assignment
- ✅ Team collaboration tools
- ✅ Full transparency via audit logs
- ✅ Invitation management

### For Employees
- ✅ Clear task visibility
- ✅ Simple status updates
- ✅ Multiple organization support
- ✅ Assignment reasoning
- ✅ Focused work interface

### For Both
- ✅ Seamless workspace switching
- ✅ Professional UI/UX
- ✅ Real-time updates
- ✅ Email notifications
- ✅ Slack integration

---

## Future Enhancements

1. **Organization Profiles**: Custom branding per organization
2. **Role Permissions**: Granular access control
3. **Team Analytics**: Performance metrics
4. **Task Comments**: Collaboration on tasks
5. **File Attachments**: Add files to tasks
6. **Calendar Integration**: Sync deadlines
7. **Mobile App**: Native iOS/Android apps
8. **Advanced Reporting**: Custom reports and exports

---

## Summary

The dual-role system provides a professional, scalable solution for both organization management and individual task execution. Users can seamlessly switch between managing their own team and completing work for other organizations, all within a single, intuitive interface.
