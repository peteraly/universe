import openai
import os
import json
from datetime import datetime
import re

USAGE_FILE = "openai_usage.json"
DAILY_LIMIT_USD = 5.0
COST_PER_1K_TOKENS = 0.03  # adjust for your model/plan

def get_today():
    return datetime.now().strftime("%Y-%m-%d")

def load_usage():
    if os.path.exists(USAGE_FILE):
        with open(USAGE_FILE, "r") as f:
            return json.load(f)
    return {}

def save_usage(usage):
    with open(USAGE_FILE, "w") as f:
        json.dump(usage, f)

def check_and_update_usage(tokens_used):
    usage = load_usage()
    today = get_today()
    if today not in usage:
        usage[today] = 0
    usage[today] += tokens_used
    estimated_cost = (usage[today] / 1000) * COST_PER_1K_TOKENS
    
    if estimated_cost > DAILY_LIMIT_USD:
        raise Exception(f"Daily OpenAI cost limit exceeded: ${estimated_cost:.2f}")
    
    save_usage(usage)
    return estimated_cost

def get_deliverable_template(deliverable_type, format_type, sections):
    """Get the appropriate template based on deliverable type and format."""
    
    # Base templates for different deliverable types
    templates = {
        "SWOT Analysis": {
            "structure": [
                "Executive Summary",
                "Strengths",
                "Weaknesses", 
                "Opportunities",
                "Threats",
                "Strategic Recommendations"
            ],
            "format_guide": "Use clear headings with bullet points for each section. Include specific examples and data points."
        },
        "Executive Brief": {
            "structure": [
                "Executive Summary",
                "Key Findings",
                "Market Analysis",
                "Strategic Implications",
                "Recommendations",
                "Next Steps"
            ],
            "format_guide": "Concise, high-level analysis suitable for senior leadership. Use clear, actionable language."
        },
        "Market Map": {
            "structure": [
                "Market Overview",
                "Key Players Analysis",
                "Market Segmentation",
                "Competitive Landscape",
                "Market Trends",
                "Strategic Opportunities"
            ],
            "format_guide": "Include visual descriptions of market positioning. Use tables or structured formats where appropriate."
        },
        "Policy Memo": {
            "structure": [
                "Issue Summary",
                "Background",
                "Policy Options",
                "Analysis",
                "Recommendations",
                "Implementation Plan"
            ],
            "format_guide": "Clear, structured format with numbered sections. Include policy implications and stakeholder considerations."
        },
        "Slide Deck": {
            "structure": [
                "Title Slide",
                "Agenda",
                "Key Insights",
                "Detailed Analysis",
                "Recommendations",
                "Next Steps"
            ],
            "format_guide": "Slide-by-slide format with bullet points and key takeaways. Include speaker notes where appropriate."
        }
    }
    
    # Use custom sections if provided, otherwise use template defaults
    if sections and len(sections) > 0:
        structure = sections
    else:
        structure = templates.get(deliverable_type, templates["Executive Brief"])["structure"]
    
    format_guide = templates.get(deliverable_type, templates["Executive Brief"])["format_guide"]
    
    return {
        "structure": structure,
        "format_guide": format_guide,
        "deliverable_type": deliverable_type,
        "format_type": format_type
    }

def build_context_aware_prompt(task, sources, template):
    """Build a comprehensive, context-aware prompt for the LLM."""
    
    # Extract key task information
    task_title = task.get('title', '')
    task_description = task.get('description', '')
    task_objectives = task.get('objectives', [])
    task_deliverable = task.get('deliverable', '')
    task_instructions = task.get('instructions', '')
    task_stakeholders = task.get('stakeholders', [])
    task_category = task.get('category', '')
    
    # Build source context
    source_context = ""
    if sources:
        source_context = "\n\n**Relevant Sources:**\n"
        for i, source in enumerate(sources[:5], 1):  # Limit to top 5 sources
            source_context += f"{i}. {source.get('title', 'Unknown')} - {source.get('type', 'Unknown type')}\n"
            if source.get('description'):
                source_context += f"   {source.get('description', '')[:200]}...\n"
    
    # Build objectives context
    objectives_context = ""
    if task_objectives:
        objectives_context = "\n\n**Key Objectives:**\n"
        for i, objective in enumerate(task_objectives, 1):
            objectives_context += f"{i}. {objective}\n"
    
    # Build stakeholder context
    stakeholder_context = ""
    if task_stakeholders:
        stakeholder_context = f"\n\n**Target Audience:** {', '.join(task_stakeholders)}"
    
    # Build the comprehensive prompt
    prompt = f"""
You are an expert research analyst creating a {template['deliverable_type']} for a {task_category} task.

**TASK CONTEXT:**
Title: {task_title}
Description: {task_description}
Deliverable Request: {task_deliverable}
Category: {task_category}{stakeholder_context}

{objectives_context}

**SPECIFIC REQUIREMENTS:**
- Deliverable Type: {template['deliverable_type']}
- Format: {template['format_type']}
- Required Sections: {', '.join(template['structure'])}
- Format Guide: {template['format_guide']}

{f"**SPECIAL INSTRUCTIONS:** {task_instructions}" if task_instructions else ""}

{source_context}

**YOUR TASK:**
Create a comprehensive {template['deliverable_type']} that:
1. Directly addresses the deliverable request: "{task_deliverable}"
2. Follows the exact structure: {', '.join(template['structure'])}
3. Incorporates relevant information from the provided sources
4. Meets the format requirements: {template['format_guide']}
5. Addresses all stated objectives
6. Is appropriate for the target audience: {', '.join(task_stakeholders) if task_stakeholders else 'General stakeholders'}

**OUTPUT FORMAT:**
Use the exact section headings provided. Ensure each section directly relates to the task objectives and deliverable request. Include specific insights, data points, and actionable recommendations where appropriate.

Begin with the first section and continue through all required sections.
"""

    return prompt

def validate_deliverable_content(content, task, template):
    """Validate that the generated content matches task requirements."""
    
    validation_results = {
        "is_valid": True,
        "issues": [],
        "warnings": [],
        "score": 100
    }
    
    # Check if all required sections are present
    required_sections = template['structure']
    content_lower = content.lower()
    
    missing_sections = []
    for section in required_sections:
        if section.lower() not in content_lower:
            missing_sections.append(section)
    
    if missing_sections:
        validation_results["issues"].append(f"Missing required sections: {', '.join(missing_sections)}")
        validation_results["score"] -= len(missing_sections) * 10
    
    # Check if deliverable request is addressed
    deliverable_request = task.get('deliverable', '').lower()
    if deliverable_request and deliverable_request not in content_lower:
        validation_results["warnings"].append("Deliverable request may not be fully addressed")
        validation_results["score"] -= 5
    
    # Check if objectives are addressed
    objectives = task.get('objectives', [])
    addressed_objectives = 0
    for objective in objectives:
        objective_keywords = objective.lower().split()
        if any(keyword in content_lower for keyword in objective_keywords if len(keyword) > 3):
            addressed_objectives += 1
    
    if objectives:
        objective_coverage = addressed_objectives / len(objectives)
        if objective_coverage < 0.7:
            validation_results["warnings"].append(f"Only {addressed_objectives}/{len(objectives)} objectives appear to be addressed")
            validation_results["score"] -= (1 - objective_coverage) * 20
    
    # Check content length and structure
    if len(content) < 500:
        validation_results["warnings"].append("Content may be too brief for the deliverable type")
        validation_results["score"] -= 10
    
    # Update validity based on score
    if validation_results["score"] < 70:
        validation_results["is_valid"] = False
    
    return validation_results

def generate_llm_deliverable(task, sources):
    """Generate a context-aware deliverable using OpenAI."""
    
    try:
        # Get the API key
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise Exception("OpenAI API key not found")
        
        # Get deliverable template
        deliverable_type = task.get('deliverable_type', 'Executive Brief')
        format_type = task.get('format', 'Narrative')
        sections = task.get('sections', [])
        
        template = get_deliverable_template(deliverable_type, format_type, sections)
        
        # Build context-aware prompt
        prompt = build_context_aware_prompt(task, sources, template)
        
        # Estimate tokens (rough approximation)
        estimated_tokens = len(prompt.split()) * 1.3  # Rough estimate
        check_and_update_usage(int(estimated_tokens))
        
        # Generate content with OpenAI
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert research analyst specializing in creating high-quality, contextually accurate deliverables. Always follow the exact structure and requirements provided."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000,
            temperature=0.3  # Lower temperature for more consistent, focused output
        )
        
        content = response.choices[0].message.content
        
        # Validate the generated content
        validation = validate_deliverable_content(content, task, template)
        
        # If validation fails, try to improve the content
        if not validation["is_valid"]:
            improvement_prompt = f"""
The following content was generated but has some issues: {validation['issues']}

Please improve the content to address these issues while maintaining the same structure and format:

{content}

Focus on:
1. Including all required sections: {', '.join(template['structure'])}
2. Better addressing the deliverable request: "{task.get('deliverable', '')}"
3. Ensuring all objectives are covered: {', '.join(task.get('objectives', []))}
"""
            
            improvement_response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert editor who improves research deliverables to meet specific requirements."
                    },
                    {
                        "role": "user",
                        "content": improvement_prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.2
            )
            
            content = improvement_response.choices[0].message.content
        
        # Add metadata to the content
        metadata = f"""
---
Generated: {datetime.now().isoformat()}
Task: {task.get('title', '')}
Deliverable Type: {deliverable_type}
Format: {format_type}
Sections: {', '.join(template['structure'])}
Validation Score: {validation.get('score', 100)}/100
---

"""
        
        return metadata + content
        
    except Exception as e:
        if "Daily OpenAI cost limit exceeded" in str(e):
            raise e
        else:
            # Fallback to template-based generation
            return generate_fallback_deliverable(task, sources, template)

def generate_fallback_deliverable(task, sources, template):
    """Generate a fallback deliverable when LLM is not available."""
    
    content = f"# {task.get('title', 'Task Deliverable')}\n\n"
    
    for section in template['structure']:
        content += f"## {section}\n\n"
        content += f"[Content for {section.lower()} section would be generated here based on task objectives and available sources.]\n\n"
    
    content += f"\n---\n*Generated using fallback template - {datetime.now().isoformat()}*\n"
    
    return content 