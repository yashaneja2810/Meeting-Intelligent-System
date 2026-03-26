from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from agents.orchestrator import AgentOrchestrator

load_dotenv()

app = FastAPI(title="AutoExec AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AgentOrchestrator(api_key=os.getenv("GEMINI_API_KEY"))


class TeamMember(BaseModel):
    id: str
    name: str
    email: str
    role: str
    skills: List[str] = []
    workload_score: int = 0


class ProcessMeetingRequest(BaseModel):
    meeting_id: str
    user_id: str
    transcript: str
    team_members: List[TeamMember]


class ProcessMeetingResponse(BaseModel):
    tasks: List[Dict[str, Any]]
    audit_logs: List[Dict[str, Any]]


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AutoExec AI Service"}


@app.post("/process-meeting", response_model=ProcessMeetingResponse)
async def process_meeting(request: ProcessMeetingRequest):
    try:
        result = await orchestrator.process_meeting(
            transcript=request.transcript,
            team_members=[member.dict() for member in request.team_members],
            user_id=request.user_id,
            meeting_id=request.meeting_id
        )
        
        return ProcessMeetingResponse(
            tasks=result["tasks"],
            audit_logs=result["audit_logs"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
