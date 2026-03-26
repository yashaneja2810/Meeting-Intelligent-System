import json
from typing import Dict, Any, List
from datetime import datetime, timedelta


class TaskExtractorAgent:
    def __init__(self, model):
        self.model = model
        
    async def extract(self, transcript: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured tasks from meeting transcript with enhanced keyword extraction.
        """
        prompt = f"""You are an expert Task Extraction Agent. Extract all actionable tasks from the meeting transcript.

Meeting Analysis Context:
{json.dumps(analysis, indent=2)}

Meeting Transcript:
{transcript}

Extract tasks and provide a JSON response with:
{{
  "tasks": [
    {{
      "title": "Brief, clear task title",
      "description": "Detailed description of what needs to be done",
      "priority": "low|medium|high|urgent",
      "deadline": "ISO date string or null",
      "keywords": ["relevant", "technical", "keywords"],
      "mentioned_person": "name if explicitly mentioned, else null"
    }}
  ],
  "reasoning": "Explanation of extraction logic"
}}

KEYWORD EXTRACTION RULES:
Extract technical keywords that help identify required skills:
- Programming languages: Python, JavaScript, Java, C++, Go, Rust, etc.
- Frameworks: React, Vue, Angular, Django, Flask, Express, Spring, etc.
- Technologies: API, REST, GraphQL, WebSocket, Docker, Kubernetes, etc.
- Databases: PostgreSQL, MongoDB, MySQL, Redis, etc.
- Areas: Backend, Frontend, Full-stack, DevOps, UI/UX, Design, Testing, QA
- Specific tasks: Authentication, Authorization, Database, Deployment, Bug fix, Feature, etc.

PRIORITY INFERENCE:
- "urgent", "ASAP", "immediately", "critical" → urgent
- "important", "high priority", "soon" → high
- "when possible", "eventually", "nice to have" → low
- Default → medium

DEADLINE INFERENCE:
- "by Friday", "end of week" → Calculate date
- "next week" → 7 days from now
- "by end of month" → Last day of current month
- "tomorrow" → Next day
- "today" → Current day
- No mention → null

TASK EXTRACTION RULES:
- Only extract clear, actionable tasks
- Ignore general discussion or questions
- Each task should be specific and measurable
- Include context from the meeting in description
- Identify if someone was explicitly assigned

Return ONLY valid JSON."""

        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            # Process deadlines
            for task in result.get("tasks", []):
                task["deadline"] = self._process_deadline(task.get("deadline"))
            
            return result
        except Exception as e:
            print(f"Task extraction error: {e}")
            return {
                "tasks": [],
                "reasoning": f"Failed to extract tasks: {str(e)}"
            }
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from model response."""
        text = text.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        
        if text.endswith("```"):
            text = text[:-3]
        
        text = text.strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
            raise
    
    def _process_deadline(self, deadline_str: Any) -> str:
        """Process deadline string into ISO format."""
        if not deadline_str or deadline_str == "null":
            return None
        
        if isinstance(deadline_str, str):
            # Try to parse common formats
            deadline_lower = deadline_str.lower()
            
            if "today" in deadline_lower:
                return datetime.now().isoformat()
            elif "tomorrow" in deadline_lower:
                return (datetime.now() + timedelta(days=1)).isoformat()
            elif "week" in deadline_lower:
                return (datetime.now() + timedelta(days=7)).isoformat()
            elif "month" in deadline_lower:
                return (datetime.now() + timedelta(days=30)).isoformat()
            
            # Try to parse ISO format
            try:
                dt = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
                return dt.isoformat()
            except:
                pass
        
        return None
