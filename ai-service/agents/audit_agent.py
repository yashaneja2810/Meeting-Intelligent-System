from typing import Dict, Any, Optional


class AuditAgent:
    """
    Agent responsible for creating comprehensive audit logs.
    """
    
    def create_log(
        self,
        agent_name: str,
        action: str,
        reasoning: str,
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        confidence_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Create a structured audit log entry.
        """
        return {
            "agent_name": agent_name,
            "action": action,
            "reasoning": reasoning,
            "input_data": input_data or {},
            "output_data": output_data or {},
            "confidence_score": confidence_score
        }
