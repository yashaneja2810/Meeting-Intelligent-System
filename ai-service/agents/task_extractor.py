import json
from typing import Dict, Any, List
from datetime import datetime, timedelta


class TaskExtractorAgent:
    def __init__(self, model, ai_provider: str = "gemini"):
        self.model = model
        self.ai_provider = ai_provider
        
    async def extract(self, transcript: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured tasks from meeting transcript with enhanced keyword extraction.
        """
        current_date = datetime.now()
        current_year = current_date.year
        
        prompt = f"""You are an expert Task Extraction Agent. Extract all actionable tasks from the meeting transcript.

CURRENT DATE CONTEXT:
Today's Date: {current_date.strftime('%B %d, %Y')} ({current_date.strftime('%A')})
Current Year: {current_year}

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

DEADLINE INFERENCE (IMPORTANT - USE CURRENT YEAR {current_year}):
- "by Friday", "end of week" → Calculate date in current/next week of {current_year}
- "next week" → 7 days from today ({current_date.strftime('%Y-%m-%d')})
- "by end of month" → Last day of current month in {current_year}
- "tomorrow" → {(current_date + timedelta(days=1)).strftime('%Y-%m-%d')}
- "today" → {current_date.strftime('%Y-%m-%d')}
- "March 29" or similar → Use {current_year} as the year
- No mention → null
- ALWAYS use year {current_year} or later, NEVER use past years

TASK EXTRACTION RULES:
- Only extract clear, actionable tasks
- Ignore general discussion or questions
- Each task should be specific and measurable
- Include context from the meeting in description
- Identify if someone was explicitly assigned

Return ONLY valid JSON."""

        try:
            if self.ai_provider == "groq":
                response = self.model.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=4000
                )
                response_text = response.choices[0].message.content
            else:  # gemini
                response = self.model.generate_content(prompt)
                response_text = response.text
            
            result = self._parse_json_response(response_text)
            
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
        """Process deadline string into ISO format with intelligent year detection."""
        if not deadline_str or deadline_str == "null":
            return None
        
        if isinstance(deadline_str, str):
            # Try to parse common formats
            deadline_lower = deadline_str.lower()
            current_date = datetime.now()
            
            # Handle relative dates
            if "today" in deadline_lower:
                return current_date.isoformat()
            elif "tomorrow" in deadline_lower:
                return (current_date + timedelta(days=1)).isoformat()
            elif "week" in deadline_lower or "7 days" in deadline_lower:
                return (current_date + timedelta(days=7)).isoformat()
            elif "month" in deadline_lower or "30 days" in deadline_lower:
                return (current_date + timedelta(days=30)).isoformat()
            elif "end of week" in deadline_lower or "friday" in deadline_lower:
                # Calculate days until Friday
                days_until_friday = (4 - current_date.weekday()) % 7
                if days_until_friday == 0:
                    days_until_friday = 7
                return (current_date + timedelta(days=days_until_friday)).isoformat()
            
            # Try to parse ISO format or date strings
            try:
                # Handle ISO format
                dt = datetime.fromisoformat(deadline_str.replace('Z', '+00:00'))
                
                # Smart year correction: if parsed date is in the past, assume current/next year
                if dt.year < current_date.year:
                    # Update to current year
                    dt = dt.replace(year=current_date.year)
                    
                    # If still in the past, move to next year
                    if dt < current_date:
                        dt = dt.replace(year=current_date.year + 1)
                
                return dt.isoformat()
            except:
                pass
            
            # Try to parse common date formats (MM/DD, DD-MM, etc.)
            try:
                # Try various date formats
                for fmt in ["%m/%d", "%d/%m", "%m-%d", "%d-%m", "%B %d", "%b %d"]:
                    try:
                        # Parse without year
                        dt = datetime.strptime(deadline_str, fmt)
                        # Add current year
                        dt = dt.replace(year=current_date.year)
                        
                        # If date is in the past, use next year
                        if dt < current_date:
                            dt = dt.replace(year=current_date.year + 1)
                        
                        return dt.isoformat()
                    except:
                        continue
            except:
                pass
        
        return None
