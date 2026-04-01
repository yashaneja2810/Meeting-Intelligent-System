from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import logging
import asyncio
import httpx
from dotenv import load_dotenv
from agents.orchestrator import AgentOrchestrator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="AutoExec AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for required environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
BACKEND_API_URL = os.getenv("BACKEND_API_URL")  # For keep-alive pings

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY environment variable is not set!")
else:
    logger.info("GEMINI_API_KEY is configured")

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY environment variable is not set!")
else:
    logger.info("GROQ_API_KEY is configured")

if BACKEND_API_URL:
    logger.info(f"BACKEND_API_URL is configured: {BACKEND_API_URL}")
else:
    logger.warning("BACKEND_API_URL is not set, backend keep-alive disabled")

try:
    orchestrator = AgentOrchestrator(
        gemini_api_key=GEMINI_API_KEY,
        groq_api_key=GROQ_API_KEY
    )
    logger.info("AgentOrchestrator initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize AgentOrchestrator: {e}")
    orchestrator = None


# Keep-alive task
async def keep_backend_alive():
    """Ping backend every 2 minutes to keep it alive"""
    if not BACKEND_API_URL:
        return
    
    while True:
        try:
            await asyncio.sleep(2 * 60)  # Wait 2 minutes
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{BACKEND_API_URL}/health", timeout=5.0)
                logger.info(f"✅ Backend is alive: {response.json()}")
        except Exception as e:
            logger.warning(f"⚠️ Backend ping failed: {e}")


@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    if BACKEND_API_URL:
        logger.info("🔄 Starting backend keep-alive task...")
        asyncio.create_task(keep_backend_alive())
    else:
        logger.info("Backend keep-alive disabled (BACKEND_API_URL not set)")


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
    ai_provider: str = "gemini"  # "gemini" or "groq"


class ProcessMeetingResponse(BaseModel):
    tasks: List[Dict[str, Any]]
    audit_logs: List[Dict[str, Any]]


@app.get("/")
async def root():
    return {
        "service": "AutoExec AI Service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    health_status = {
        "status": "ok",
        "service": "AutoExec AI Service",
        "gemini_api_configured": bool(GEMINI_API_KEY),
        "groq_api_configured": bool(GROQ_API_KEY),
        "orchestrator_initialized": orchestrator is not None,
        "backend_keepalive_enabled": bool(BACKEND_API_URL)
    }
    logger.info(f"Health check: {health_status}")
    return health_status


@app.post("/process-meeting", response_model=ProcessMeetingResponse)
async def process_meeting(request: ProcessMeetingRequest):
    try:
        if not orchestrator:
            logger.error("Orchestrator not initialized")
            raise HTTPException(
                status_code=500,
                detail="AI service not properly initialized. Check API keys."
            )
        
        # Validate AI provider
        if request.ai_provider not in ["gemini", "groq"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid AI provider. Must be 'gemini' or 'groq'."
            )
        
        # Check if selected provider is configured
        if request.ai_provider == "gemini" and not GEMINI_API_KEY:
            raise HTTPException(
                status_code=400,
                detail="Gemini API key not configured."
            )
        if request.ai_provider == "groq" and not GROQ_API_KEY:
            raise HTTPException(
                status_code=400,
                detail="Groq API key not configured."
            )
        
        logger.info(f"Processing meeting {request.meeting_id} for user {request.user_id} using {request.ai_provider}")
        logger.info(f"Team members count: {len(request.team_members)}")
        logger.info(f"Transcript length: {len(request.transcript)} characters")
        
        result = await orchestrator.process_meeting(
            transcript=request.transcript,
            team_members=[member.dict() for member in request.team_members],
            user_id=request.user_id,
            meeting_id=request.meeting_id,
            ai_provider=request.ai_provider
        )
        
        logger.info(f"Meeting processed successfully. Tasks: {len(result.get('tasks', []))}, Logs: {len(result.get('audit_logs', []))}")
        
        return ProcessMeetingResponse(
            tasks=result["tasks"],
            audit_logs=result["audit_logs"]
        )
    except Exception as e:
        logger.error(f"Error processing meeting: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
