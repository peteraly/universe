import json
from datetime import datetime
from typing import List, Dict, Any

DATA_PATH = 'data/sources.json'


def load_sources() -> List[Dict[str, Any]]:
    with open(DATA_PATH, 'r') as f:
        return json.load(f)

def save_sources(sources: List[Dict[str, Any]]):
    with open(DATA_PATH, 'w') as f:
        json.dump(sources, f, indent=2)

def match_sources_to_task(task: Dict[str, Any], sources: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Match sources to a task using tag overlap, media type, and freshness.
    Returns a ranked list of sources with updated relevance_score.
    """
    task_tags = set(task.get('tags', []) + task.get('title', '').lower().split() + task.get('description', '').lower().split())
    now = datetime.utcnow()
    matches = []
    for source in sources:
        source_tags = set(source.get('tags', []))
        tag_overlap = len(task_tags & source_tags)
        # Freshness: newer is better
        try:
            freshness_days = (now - datetime.fromisoformat(source['freshness'].replace('Z',''))).days
        except Exception:
            freshness_days = 999
        freshness_score = max(0, 1 - freshness_days / 365)
        # Simple relevance: tag overlap + freshness
        relevance = tag_overlap * 0.7 + freshness_score * 0.3
        source['relevance_score'] = round(relevance, 2)
        matches.append((relevance, source))
    matches.sort(reverse=True, key=lambda x: x[0])
    return [m[1] for m in matches[:top_n]]

def assign_sources_to_task(task_id: str, task: Dict[str, Any]):
    """
    Assign top-matched sources to a task and update sources.json.
    """
    sources = load_sources()
    matched = match_sources_to_task(task, sources)
    for source in matched:
        if 'assigned_tasks' not in source:
            source['assigned_tasks'] = []
        if task_id not in source['assigned_tasks']:
            source['assigned_tasks'].append(task_id)
    save_sources(sources)
    return matched

# Example usage:
# task = {"id": "task-021", "title": "New Task Title", "description": "Research ...", "tags": ["payments", "AI"]}
# assign_sources_to_task(task['id'], task) 