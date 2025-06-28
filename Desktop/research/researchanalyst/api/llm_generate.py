import openai
import os
import json
from datetime import datetime

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
    save_usage(usage)
    if estimated_cost > DAILY_LIMIT_USD:
        raise Exception(f"Daily OpenAI API limit of ${DAILY_LIMIT_USD} reached.")
    return estimated_cost

def build_llm_prompt(task, sources):
    objectives = task.get('objectives', [])
    deliverable_desc = task.get('deliverable', '')
    prompt = f"""
You are an expert research analyst.
Write a {task.get('output_type', 'executive brief')} for: {', '.join(task.get('stakeholders', []))}
Title: {task.get('title')}
Description: {task.get('description')}
Objectives:
- {'; '.join(objectives)}
Deliverable requested: {deliverable_desc}
Use these source snippets and cite them inline:
"""
    # Add source snippets
    for s in sources:
        snippet = s.get('snippet', s.get('title', ''))
        citation = s.get('title', '')
        prompt += f"- {snippet} [{citation}]\n"
    prompt += """
Structure: Executive Summary, Key Trends, SWOT Analysis, Strategic Recommendations, Sources Cited.
Be concise, actionable, and professional.
"""
    return prompt

def generate_llm_deliverable(task, sources):
    prompt = build_llm_prompt(task, sources)
    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful research analyst assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1500
    )
    tokens_used = response['usage']['total_tokens'] if 'usage' in response else 1500
    check_and_update_usage(tokens_used)
    return response['choices'][0]['message']['content'] 