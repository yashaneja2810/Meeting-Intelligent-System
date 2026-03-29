import json
from typing import Dict, Any, List


class AssignmentAgent:
    def __init__(self, model):
        self.model = model
        
    async def assign(
        self,
        task: Dict[str, Any],
        team_members: List[Dict[str, Any]],
        transcript: str
    ) -> Dict[str, Any]:
        """
        Intelligently assign task to the most suitable team member based on skills, role, and workload.
        """
        if not team_members:
            return {
                "assigned_to": None,
                "reason": "No team members available",
                "confidence": 0.0
            }
        
        # Check for explicit mentions first
        mentioned_person = task.get("mentioned_person")
        if mentioned_person:
            for member in team_members:
                if mentioned_person.lower() in member["name"].lower():
                    return {
                        "assigned_to": member["id"],
                        "reason": f"Explicitly mentioned in meeting: '{mentioned_person}'",
                        "confidence": 0.95
                    }
        
        # Use AI for intelligent assignment with enhanced context
        team_context = "\n".join([
            f"""Team Member {i+1}:
ID: {m['id']}
Name: {m['name']}
Role: {m['role']}
Skills: {', '.join(m.get('skills', [])) if m.get('skills') else 'None specified'}
Current Workload: {m.get('workload_score', 0)} tasks
"""
            for i, m in enumerate(team_members)
        ])
        
        task_keywords = ', '.join(task.get('keywords', []))
        
        prompt = f"""You are an expert Assignment Agent with deep understanding of software development roles and skills.

TASK TO ASSIGN:
Title: {task.get('title')}
Description: {task.get('description', 'No description')}
Priority: {task.get('priority', 'medium')}
Keywords/Technologies: {task_keywords if task_keywords else 'None extracted'}

AVAILABLE TEAM MEMBERS:
{team_context}

ASSIGNMENT CRITERIA (in order of importance):
1. SKILL MATCH: Match task keywords/technologies with team member skills
   - Backend tasks (API, database, server, authentication, etc.) → Backend developers
   - Frontend tasks (UI, design, React, Vue, etc.) → Frontend developers
   - Full-stack tasks → Developers with both skills
   - DevOps tasks (deployment, CI/CD, Docker) → DevOps engineers
   - Design tasks (mockups, UI/UX, wireframes) → Designers
   - Testing tasks (QA, testing, bugs) → QA engineers or developers with testing skills

2. ROLE ALIGNMENT: Match task type with team member role
   - Consider role titles carefully (Senior, Lead, Junior, etc.)
   - Senior/Lead members for complex or high-priority tasks
   - Junior members for simpler tasks

3. WORKLOAD BALANCE: Prefer members with lower workload scores
   - Distribute work evenly across the team
   - Avoid overloading any single person

4. TASK PRIORITY: High/urgent priority tasks → More experienced team members

ANALYSIS APPROACH:
- Extract technical requirements from task title and description
- Identify required skills (programming languages, frameworks, tools)
- Match these with team member skills and roles
- Consider workload to balance assignments
- Provide clear reasoning for your choice

CRITICAL REQUIREMENTS:
- You MUST return the exact ID from the team members list above
- Do NOT make up IDs or return names/roles instead of IDs
- If no perfect match exists, choose the best available option
- Keep reasoning BRIEF (maximum 3 short lines, around 100 characters total)

Return ONLY valid JSON in this exact format:
{{
  "assigned_to": "exact_id_from_team_members_list",
  "reason": "Brief 1-2 sentence explanation focusing on key match",
  "confidence": 0.0-1.0
}}"""

        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            # Truncate reason if too long (max 150 characters)
            if result.get("reason") and len(result["reason"]) > 150:
                result["reason"] = result["reason"][:147] + "..."
            
            # Validate assigned_to is a valid UUID
            assigned_id = result.get("assigned_to")
            
            # Check if it's a valid team member ID
            valid_member = None
            if assigned_id:
                for member in team_members:
                    if member["id"] == assigned_id:
                        valid_member = member
                        break
            
            # If not valid, try to match by name or role
            if not valid_member and assigned_id:
                assigned_lower = str(assigned_id).lower()
                for member in team_members:
                    if (member["name"].lower() in assigned_lower or 
                        assigned_lower in member["name"].lower() or
                        member["role"].lower() in assigned_lower or
                        assigned_lower in member["role"].lower()):
                        valid_member = member
                        break
            
            # If still not found, use first team member
            if not valid_member and team_members:
                valid_member = team_members[0]
                result["reason"] = f"AI returned invalid ID, assigned to {valid_member['name']} based on availability"
                result["confidence"] = 0.5
            
            if valid_member:
                result["assigned_to"] = valid_member["id"]
                return result
            
            return {
                "assigned_to": None,
                "reason": "No team members available",
                "confidence": 0.0
            }
            
        except Exception as e:
            print(f"Assignment error: {e}")
            # Fallback: assign to least loaded team member
            if team_members:
                sorted_members = sorted(team_members, key=lambda m: m.get("workload_score", 0))
                return {
                    "assigned_to": sorted_members[0]["id"],
                    "reason": "Assigned to team member with lowest workload (fallback)",
                    "confidence": 0.6
                }
            
            return {
                "assigned_to": None,
                "reason": "No team members available",
                "confidence": 0.0
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

    def _fallback_skill_match(self, task: Dict[str, Any], team_members: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Fallback method: Score team members based on skill and role matching.
        """
        task_keywords = [kw.lower() for kw in task.get('keywords', [])]
        task_title = task.get('title', '').lower()
        task_desc = task.get('description', '').lower()
        
        # Combine all task text for matching
        task_text = f"{task_title} {task_desc} {' '.join(task_keywords)}"
        
        # Define role keywords
        role_keywords = {
            'backend': ['backend', 'api', 'server', 'database', 'authentication', 'auth', 'sql', 'node', 'python', 'java', 'go', 'rest', 'graphql'],
            'frontend': ['frontend', 'ui', 'react', 'vue', 'angular', 'css', 'html', 'design', 'component', 'interface'],
            'fullstack': ['fullstack', 'full-stack', 'full stack'],
            'devops': ['devops', 'deployment', 'docker', 'kubernetes', 'ci/cd', 'pipeline', 'infrastructure', 'aws', 'cloud'],
            'design': ['design', 'ui/ux', 'mockup', 'wireframe', 'figma', 'sketch', 'prototype'],
            'qa': ['test', 'testing', 'qa', 'quality', 'bug', 'automation']
        }
        
        best_member = None
        best_score = -1
        
        for member in team_members:
            score = 0
            member_role = member.get('role', '').lower()
            member_skills = [s.lower() for s in member.get('skills', [])]
            
            # Score based on role match
            for role_type, keywords in role_keywords.items():
                if any(kw in member_role for kw in keywords):
                    if any(kw in task_text for kw in keywords):
                        score += 30  # Strong role match
            
            # Score based on skill match
            for skill in member_skills:
                if skill in task_text:
                    score += 20  # Direct skill match
                # Partial matches
                for keyword in task_keywords:
                    if skill in keyword or keyword in skill:
                        score += 10
            
            # Penalize high workload
            workload = member.get('workload_score', 0)
            score -= workload * 2
            
            # Bonus for senior/lead on high priority tasks
            if task.get('priority') in ['high', 'urgent']:
                if 'senior' in member_role or 'lead' in member_role:
                    score += 15
            
            if score > best_score:
                best_score = score
                best_member = member
        
        return best_member if best_score > 0 else team_members[0]
