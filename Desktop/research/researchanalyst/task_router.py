import json
import uuid
from datetime import datetime
from typing import Dict, Any, List
from source_matcher import assign_sources_to_task

tasks_path = 'data/tasks.json'

def load_tasks() -> List[Dict[str, Any]]:
    try:
        with open(tasks_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_tasks(tasks: List[Dict[str, Any]]):
    with open(tasks_path, 'w') as f:
        json.dump(tasks, f, indent=2)

def create_task(task_data: Dict[str, Any], origin: str = 'analyst') -> Dict[str, Any]:
    """
    Create a new task, assign origin (analyst, manager, external), and trigger source matching.
    Returns the new task with proper ID and metadata.
    """
    try:
        tasks = load_tasks()
        
        # Generate a unique ID if not provided
        if 'id' not in task_data or not task_data['id']:
            task_data['id'] = f"task-{str(uuid.uuid4())[:8]}"
        
        # Set default values for required fields
        new_task = {
            'id': task_data['id'],
            'title': task_data.get('title', 'Untitled Task'),
            'description': task_data.get('description', ''),
            'category': task_data.get('category', 'Research Support'),
            'status': 'Not Started',
            'progress': 0,
            'priority': task_data.get('priority', 'Medium'),
            'due_date': task_data.get('due_date', ''),
            'stakeholders': task_data.get('stakeholders', []),
            'objectives': task_data.get('objectives', []),
            'deliverable': task_data.get('deliverable', ''),
            'deliverable_type': task_data.get('deliverable_type', 'Executive Brief'),
            'format': task_data.get('format', 'Narrative'),
            'sections': task_data.get('sections', []),
            'instructions': task_data.get('instructions', ''),
            'tags': task_data.get('tags', []),
            'sources': [],
            'origin': origin,
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'context': {
                'risk_level': task_data.get('risk_level', 'Medium'),
                'urgency': task_data.get('urgency', 'Medium'),
                'estimated_effort': task_data.get('estimated_effort', '2-3 days')
            }
        }
        
        # Add the new task to the list
        tasks.append(new_task)
        save_tasks(tasks)
        
        # Return the task ID for the frontend
        return {"id": new_task['id'], "success": True, "task": new_task}
        
    except Exception as e:
        return {"error": f"Failed to create task: {str(e)}", "success": False}

# Example usage:
# task_data = {"id": "task-021", "title": "New Task Title", "description": "Research ..."}
# result = create_task(task_data, origin="manager")
# print(result['suggested_sources']) 