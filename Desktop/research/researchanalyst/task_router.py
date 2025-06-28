import json
from typing import Dict, Any, List
from source_matcher import assign_sources_to_task

tasks_path = 'data/tasks.json'

def load_tasks() -> List[Dict[str, Any]]:
    with open(tasks_path, 'r') as f:
        return json.load(f)

def save_tasks(tasks: List[Dict[str, Any]]):
    with open(tasks_path, 'w') as f:
        json.dump(tasks, f, indent=2)

def create_task(task_data: Dict[str, Any], origin: str = 'analyst') -> Dict[str, Any]:
    """
    Create a new task, assign origin (analyst, manager, external), and trigger source matching.
    Returns the new task and suggested sources.
    """
    tasks = load_tasks()
    new_task = task_data.copy()
    new_task['origin'] = origin
    if 'tags' not in new_task:
        # Optionally extract tags from title/description
        new_task['tags'] = list(set(new_task.get('title', '').lower().split() + new_task.get('description', '').lower().split()))
    tasks.append(new_task)
    save_tasks(tasks)
    # Trigger source matching
    suggested_sources = assign_sources_to_task(new_task['id'], new_task)
    return {"task": new_task, "suggested_sources": suggested_sources}

# Example usage:
# task_data = {"id": "task-021", "title": "New Task Title", "description": "Research ..."}
# result = create_task(task_data, origin="manager")
# print(result['suggested_sources']) 