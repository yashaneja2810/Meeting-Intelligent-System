import google.generativeai as genai
from groq import Groq
from typing import List, Dict, Any
from .meeting_analyzer import MeetingAnalyzerAgent
from .task_extractor import TaskExtractorAgent
from .assignment_agent import AssignmentAgent
from .audit_agent import AuditAgent


class AgentOrchestrator:
    def __init__(self, gemini_api_key: str = None, groq_api_key: str = None):
        # Initialize Gemini
        self.gemini_model = None
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Initialize Groq
        self.groq_client = None
        if groq_api_key:
            self.groq_client = Groq(api_key=groq_api_key)
        
        self.audit_agent = AuditAgent()
        
    async def process_meeting(
        self,
        transcript: str,
        team_members: List[Dict[str, Any]],
        user_id: str,
        meeting_id: str,
        ai_provider: str = "gemini"
    ) -> Dict[str, Any]:
        """
        Orchestrate the multi-agent workflow to process a meeting transcript.
        """
        # Select the appropriate model
        if ai_provider == "groq":
            if not self.groq_client:
                raise ValueError("Groq API key not configured")
            model = self.groq_client
        else:  # gemini
            if not self.gemini_model:
                raise ValueError("Gemini API key not configured")
            model = self.gemini_model
        
        # Initialize agents with selected model
        meeting_analyzer = MeetingAnalyzerAgent(model, ai_provider)
        task_extractor = TaskExtractorAgent(model, ai_provider)
        assignment_agent = AssignmentAgent(model, ai_provider)
        
        audit_logs = []
        
        # Step 1: Analyze meeting structure
        analysis = await meeting_analyzer.analyze(transcript)
        audit_logs.append(self.audit_agent.create_log(
            agent_name="Meeting Analyzer Agent",
            action="Meeting Analysis",
            reasoning=analysis.get("reasoning", "Analyzed meeting structure and context"),
            input_data={"transcript_length": len(transcript)},
            output_data=analysis
        ))
        
        # Step 2: Extract tasks
        tasks_data = await task_extractor.extract(transcript, analysis)
        audit_logs.append(self.audit_agent.create_log(
            agent_name="Task Extraction Agent",
            action="Task Extraction",
            reasoning=tasks_data.get("reasoning", "Extracted structured tasks from meeting"),
            input_data={"analysis": analysis},
            output_data={"task_count": len(tasks_data.get("tasks", []))}
        ))
        
        # Step 3: Assign tasks to team members
        tasks = []
        for task_data in tasks_data.get("tasks", []):
            assignment = await assignment_agent.assign(
                task=task_data,
                team_members=team_members,
                transcript=transcript
            )
            
            # Build task object
            task = {
                "title": task_data.get("title"),
                "description": task_data.get("description"),
                "priority": task_data.get("priority", "medium"),
                "deadline": task_data.get("deadline"),
                "assigned_to": assignment.get("assigned_to"),
                "assignment_reason": assignment.get("reason"),
                "assignment_confidence": assignment.get("confidence"),
                "status": "pending",
                "metadata": {
                    "extracted_from": "ai_agent",
                    "keywords": task_data.get("keywords", []),
                    "ai_provider": ai_provider
                }
            }
            
            tasks.append(task)
            
            # Log assignment
            audit_logs.append(self.audit_agent.create_log(
                agent_name="Assignment Agent",
                action="Task Assignment",
                reasoning=assignment.get("reason", "Assigned based on role and skills"),
                input_data={"task": task_data.get("title")},
                output_data=assignment,
                confidence_score=assignment.get("confidence")
            ))
        
        return {
            "tasks": tasks,
            "audit_logs": audit_logs
        }
