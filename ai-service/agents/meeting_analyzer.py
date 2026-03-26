import json
from typing import Dict, Any


class MeetingAnalyzerAgent:
    def __init__(self, model):
        self.model = model
        
    async def analyze(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze meeting transcript to extract structure and context.
        """
        prompt = f"""You are a Meeting Analyzer Agent. Analyze the following meeting transcript and extract key information.

Transcript:
{transcript}

Provide a structured JSON response with:
1. meeting_type: (planning, review, brainstorming, standup, etc.)
2. key_topics: List of main topics discussed
3. participants_mentioned: List of people mentioned by name
4. urgency_level: (low, medium, high, urgent)
5. action_items_count: Estimated number of action items
6. reasoning: Brief explanation of your analysis

Return ONLY valid JSON, no additional text."""

        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result
        except Exception as e:
            print(f"Meeting analysis error: {e}")
            return {
                "meeting_type": "general",
                "key_topics": [],
                "participants_mentioned": [],
                "urgency_level": "medium",
                "action_items_count": 0,
                "reasoning": "Failed to analyze meeting, using defaults"
            }
    
    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Parse JSON from model response, handling markdown code blocks."""
        text = text.strip()
        
        # Remove markdown code blocks if present
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
            # Try to find JSON object in text
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
            raise
