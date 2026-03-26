# AutoExec AI - API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

Get the token from Supabase Auth after login/signup.

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### POST /auth/login

Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "session": { ... }
}
```

### POST /auth/logout

Logout current user.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### GET /users/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "company_name": "Acme Inc",
  "onboarding_completed": true,
  "preferences": {
    "reminder_intervals": [24, 48, 72],
    "escalation_rules": {
      "first_reminder": 24,
      "second_reminder": 48,
      "escalate_after": 72
    }
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### PUT /users/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "display_name": "John Doe",
  "company_name": "Acme Inc",
  "preferences": {
    "reminder_intervals": [24, 48, 72],
    "escalation_rules": {
      "first_reminder": 24,
      "second_reminder": 48,
      "escalate_after": 72
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  ...
}
```

### POST /users/complete-onboarding

Mark onboarding as completed.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "onboarding_completed": true,
  ...
}
```

---

## Team Endpoints

### GET /team

Get all team members for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "role": "Backend Developer",
    "skills": ["Node.js", "Python", "PostgreSQL"],
    "slack_webhook": "https://hooks.slack.com/...",
    "slack_id": "@sarah",
    "workload_score": 5,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /team

Create a new team member.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "role": "Backend Developer",
  "skills": ["Node.js", "Python", "PostgreSQL"],
  "slack_webhook": "https://hooks.slack.com/...",
  "slack_id": "@sarah"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Sarah Johnson",
  ...
}
```

### PUT /team/:id

Update a team member.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Team member UUID

**Request Body:**
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "role": "Senior Backend Developer",
  "skills": ["Node.js", "Python", "PostgreSQL", "Redis"],
  "is_active": true
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Sarah Johnson",
  ...
}
```

### DELETE /team/:id

Delete a team member.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Team member UUID

**Response:** `200 OK`
```json
{
  "message": "Team member deleted successfully"
}
```

---

## Meeting Endpoints

### GET /meetings

Get all meetings for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Sprint Planning - Jan 2024",
    "transcript": "John: We need to...",
    "processed": true,
    "processing_status": "completed",
    "metadata": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /meetings

Upload and process a new meeting transcript.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Sprint Planning - Jan 2024",
  "transcript": "John: We need to fix the login bug by Friday. Sarah, can you handle that?\nSarah: Sure, I'll work on it.\nMike: I'll update the API documentation this week."
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Sprint Planning - Jan 2024",
  "transcript": "...",
  "processed": false,
  "processing_status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Note:** Processing happens asynchronously. Tasks will appear in the tasks endpoint once processing is complete.

### GET /meetings/:id

Get a specific meeting.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Meeting UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Sprint Planning - Jan 2024",
  ...
}
```

---

## Task Endpoints

### GET /tasks

Get all tasks for current user with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `in_progress`, `completed`, `blocked`, `cancelled`
- `assigned_to` (optional) - Filter by team member UUID

**Examples:**
```
GET /tasks
GET /tasks?status=pending
GET /tasks?assigned_to=uuid
GET /tasks?status=in_progress&assigned_to=uuid
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "meeting_id": "uuid",
    "user_id": "uuid",
    "assigned_to": "uuid",
    "title": "Fix login bug",
    "description": "Fix the authentication flow issue",
    "priority": "high",
    "status": "pending",
    "deadline": "2024-01-05T00:00:00Z",
    "assignment_reason": "Assigned to Sarah based on backend role match",
    "assignment_confidence": 0.87,
    "metadata": {
      "extracted_from": "ai_agent",
      "keywords": ["login", "bug", "authentication"]
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "completed_at": null,
    "assigned_member": {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "role": "Backend Developer"
    }
  }
]
```

### GET /tasks/:id

Get a specific task.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Task UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Fix login bug",
  ...
}
```

### PUT /tasks/:id

Update a task.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Task UUID

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "deadline": "2024-01-05T00:00:00Z",
  "assigned_to": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "in_progress",
  ...
}
```

### POST /tasks/:id/reassign

Reassign a task to a different team member.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` - Task UUID

**Request Body:**
```json
{
  "assigned_to": "uuid",
  "reason": "Sarah is overloaded, reassigning to Mike"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "assigned_to": "uuid",
  "assignment_reason": "Sarah is overloaded, reassigning to Mike",
  ...
}
```

---

## Audit Log Endpoints

### GET /audit

Get audit logs for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `task_id` (optional) - Filter by task UUID
- `agent_name` (optional) - Filter by agent name
- `limit` (optional) - Limit results (default: 100)

**Examples:**
```
GET /audit
GET /audit?task_id=uuid
GET /audit?agent_name=Assignment%20Agent
GET /audit?limit=50
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "task_id": "uuid",
    "meeting_id": "uuid",
    "agent_name": "Assignment Agent",
    "action": "Task Assignment",
    "reasoning": "Assigned to Sarah based on backend role match and Python skill",
    "input_data": {
      "task": "Fix login bug"
    },
    "output_data": {
      "assigned_to": "uuid",
      "reason": "Backend role match",
      "confidence": 0.87
    },
    "confidence_score": 0.87,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authorization header"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "stack": "..." // Only in development
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- 100 requests per minute per user
- 1000 requests per hour per user
- Exponential backoff for retries

---

## Webhooks (Future)

Planned webhook support for:
- Task created
- Task updated
- Task completed
- Deadline approaching
- Escalation triggered

---

## AI Service API (Internal)

### POST /process-meeting

Process a meeting transcript with multi-agent AI system.

**Request Body:**
```json
{
  "meeting_id": "uuid",
  "user_id": "uuid",
  "transcript": "Meeting transcript text...",
  "team_members": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@example.com",
      "role": "Backend Developer",
      "skills": ["Node.js", "Python"],
      "workload_score": 5
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "title": "Fix login bug",
      "description": "Fix authentication flow issue",
      "priority": "high",
      "deadline": "2024-01-05T00:00:00Z",
      "assigned_to": "uuid",
      "assignment_reason": "Backend role match",
      "assignment_confidence": 0.87,
      "status": "pending",
      "metadata": {
        "extracted_from": "ai_agent",
        "keywords": ["login", "bug"]
      }
    }
  ],
  "audit_logs": [
    {
      "agent_name": "Meeting Analyzer Agent",
      "action": "Meeting Analysis",
      "reasoning": "Analyzed meeting structure and context",
      "input_data": { "transcript_length": 250 },
      "output_data": {
        "meeting_type": "planning",
        "urgency_level": "high"
      }
    }
  ]
}
```

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Handle errors gracefully** - check response status codes
3. **Use query parameters** for filtering and pagination
4. **Validate input** before sending requests
5. **Store tokens securely** - never expose in client-side code
6. **Implement retry logic** for failed requests
7. **Use HTTPS** in production
8. **Monitor rate limits** (when implemented)

---

## SDK Examples

### JavaScript/TypeScript

```javascript
const API_URL = 'http://localhost:3000/api';

async function getTasks(token, filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/tasks?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}

// Usage
const tasks = await getTasks(token, { status: 'pending' });
```

### Python

```python
import requests

API_URL = 'http://localhost:3000/api'

def get_tasks(token, filters=None):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(
        f'{API_URL}/tasks',
        headers=headers,
        params=filters
    )
    response.raise_for_status()
    return response.json()

# Usage
tasks = get_tasks(token, {'status': 'pending'})
```

---

## Support

For API issues or questions:
- Check error messages in responses
- Review request/response in browser DevTools
- Check backend logs for detailed errors
- Verify authentication token is valid
