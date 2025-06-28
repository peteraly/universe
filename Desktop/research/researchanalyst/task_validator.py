import json
import re
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional

class TaskValidator:
    """Validates task data structure and content for quality assurance."""
    
    REQUIRED_FIELDS = [
        'id', 'title', 'description', 'category', 'stakeholders', 
        'status', 'due_date', 'progress', 'sources', 'deliverable',
        'objectives', 'output_type', 'context'
    ]
    
    VALID_STATUSES = ['New', 'In Progress', 'Completed', 'On Hold', 'Cancelled']
    VALID_CATEGORIES = ['Corporate Strategy', 'Research Support', 'Content Curation', 'Communications']
    VALID_OUTPUT_TYPES = ['market_analysis', 'executive_brief', 'policy_memo', 'regulatory_roadmap']
    VALID_RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical']
    VALID_URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical']
    
    def __init__(self, tasks_file: str = 'data/tasks.json'):
        self.tasks_file = tasks_file
        self.validation_errors = []
        self.validation_warnings = []
    
    def validate_task(self, task: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
        """Validate a single task and return validation results."""
        errors = []
        warnings = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in task:
                errors.append(f"Missing required field: {field}")
            elif task[field] is None or task[field] == "":
                errors.append(f"Empty required field: {field}")
        
        # Validate field types and content
        if 'id' in task:
            if not isinstance(task['id'], str) or not task['id'].startswith('task-'):
                errors.append("Task ID must be a string starting with 'task-'")
        
        if 'title' in task:
            if not isinstance(task['title'], str) or len(task['title']) < 10:
                errors.append("Title must be a string with at least 10 characters")
        
        if 'description' in task:
            if not isinstance(task['description'], str) or len(task['description']) < 50:
                errors.append("Description must be a string with at least 50 characters")
        
        if 'objectives' in task:
            if not isinstance(task['objectives'], list) or len(task['objectives']) == 0:
                errors.append("Objectives must be a non-empty list")
            else:
                for i, objective in enumerate(task['objectives']):
                    if not isinstance(objective, str) or len(objective) < 10:
                        errors.append(f"Objective {i+1} must be a string with at least 10 characters")
        
        if 'stakeholders' in task:
            if not isinstance(task['stakeholders'], list) or len(task['stakeholders']) == 0:
                errors.append("Stakeholders must be a non-empty list")
            else:
                for stakeholder in task['stakeholders']:
                    if not isinstance(stakeholder, str):
                        errors.append("All stakeholders must be strings")
        
        if 'status' in task:
            if task['status'] not in self.VALID_STATUSES:
                errors.append(f"Invalid status: {task['status']}. Must be one of {self.VALID_STATUSES}")
        
        if 'category' in task:
            if task['category'] not in self.VALID_CATEGORIES:
                errors.append(f"Invalid category: {task['category']}. Must be one of {self.VALID_CATEGORIES}")
        
        if 'progress' in task:
            if not isinstance(task['progress'], (int, float)) or task['progress'] < 0 or task['progress'] > 100:
                errors.append("Progress must be a number between 0 and 100")
        
        if 'sources' in task:
            if not isinstance(task['sources'], list):
                errors.append("Sources must be a list")
            elif len(task['sources']) == 0:
                warnings.append("No sources specified")
        
        if 'output_type' in task:
            if task['output_type'] not in self.VALID_OUTPUT_TYPES:
                errors.append(f"Invalid output_type: {task['output_type']}. Must be one of {self.VALID_OUTPUT_TYPES}")
        
        if 'context' in task:
            context = task['context']
            if not isinstance(context, dict):
                errors.append("Context must be a dictionary")
            else:
                if 'risk_level' in context and context['risk_level'] not in self.VALID_RISK_LEVELS:
                    errors.append(f"Invalid risk_level: {context['risk_level']}. Must be one of {self.VALID_RISK_LEVELS}")
                
                if 'urgency' in context and context['urgency'] not in self.VALID_URGENCY_LEVELS:
                    errors.append(f"Invalid urgency: {context['urgency']}. Must be one of {self.VALID_URGENCY_LEVELS}")
                
                if 'dependencies' in context:
                    if not isinstance(context['dependencies'], list):
                        errors.append("Dependencies must be a list")
                    elif len(context['dependencies']) == 0:
                        warnings.append("No dependencies specified")
        
        # Validate date formats
        if 'due_date' in task:
            try:
                datetime.strptime(task['due_date'], '%Y-%m-%d')
            except ValueError:
                errors.append("due_date must be in YYYY-MM-DD format")
        
        if 'created_at' in task:
            try:
                datetime.fromisoformat(task['created_at'].replace('Z', '+00:00'))
            except ValueError:
                errors.append("created_at must be in ISO format")
        
        if 'last_updated' in task:
            try:
                datetime.fromisoformat(task['last_updated'].replace('Z', '+00:00'))
            except ValueError:
                errors.append("last_updated must be in ISO format")
        
        return len(errors) == 0, errors, warnings
    
    def validate_all_tasks(self) -> Tuple[bool, List[str], List[str]]:
        """Validate all tasks in the tasks file."""
        try:
            with open(self.tasks_file, 'r') as f:
                tasks = json.load(f)
        except FileNotFoundError:
            return False, [f"Tasks file not found: {self.tasks_file}"], []
        except json.JSONDecodeError as e:
            return False, [f"Invalid JSON in tasks file: {e}"], []
        
        all_errors = []
        all_warnings = []
        valid_count = 0
        
        for i, task in enumerate(tasks):
            is_valid, errors, warnings = self.validate_task(task)
            
            if errors:
                all_errors.extend([f"Task {i+1} ({task.get('id', 'unknown')}): {error}" for error in errors])
            if warnings:
                all_warnings.extend([f"Task {i+1} ({task.get('id', 'unknown')}): {warning}" for warning in warnings])
            
            if is_valid:
                valid_count += 1
        
        # Check for duplicate IDs
        task_ids = [task.get('id') for task in tasks if task.get('id')]
        duplicate_ids = [task_id for task_id in set(task_ids) if task_ids.count(task_id) > 1]
        if duplicate_ids:
            all_errors.extend([f"Duplicate task ID: {task_id}" for task_id in duplicate_ids])
        
        is_valid = len(all_errors) == 0
        return is_valid, all_errors, all_warnings
    
    def get_task_quality_score(self, task: Dict[str, Any]) -> float:
        """Calculate a quality score for a task based on completeness and content."""
        score = 0.0
        max_score = 100.0
        
        # Basic field presence (40 points)
        required_fields_present = sum(1 for field in self.REQUIRED_FIELDS if field in task and task[field])
        score += (required_fields_present / len(self.REQUIRED_FIELDS)) * 40
        
        # Content quality (30 points)
        if 'description' in task and len(task['description']) >= 100:
            score += 15
        if 'objectives' in task and len(task['objectives']) >= 3:
            score += 15
        
        # Source richness (15 points)
        if 'sources' in task and len(task['sources']) >= 3:
            score += 15
        elif 'sources' in task and len(task['sources']) >= 1:
            score += 10
        
        # Context completeness (15 points)
        if 'context' in task:
            context = task['context']
            context_fields = ['region', 'risk_level', 'urgency', 'dependencies', 'estimated_effort']
            context_completeness = sum(1 for field in context_fields if field in context and context[field])
            score += (context_completeness / len(context_fields)) * 15
        
        return min(score, max_score)
    
    def get_tasks_quality_report(self) -> Dict[str, Any]:
        """Generate a comprehensive quality report for all tasks."""
        try:
            with open(self.tasks_file, 'r') as f:
                tasks = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"error": "Could not load tasks file"}
        
        report = {
            "total_tasks": len(tasks),
            "validation_results": {},
            "quality_scores": [],
            "recommendations": []
        }
        
        is_valid, errors, warnings = self.validate_all_tasks()
        report["validation_results"] = {
            "is_valid": is_valid,
            "error_count": len(errors),
            "warning_count": len(warnings),
            "errors": errors,
            "warnings": warnings
        }
        
        # Calculate quality scores
        total_score = 0
        for task in tasks:
            score = self.get_task_quality_score(task)
            report["quality_scores"].append({
                "task_id": task.get('id'),
                "title": task.get('title'),
                "quality_score": score
            })
            total_score += score
        
        if tasks:
            report["average_quality_score"] = total_score / len(tasks)
        
        # Generate recommendations
        if len(errors) > 0:
            report["recommendations"].append("Fix validation errors before proceeding")
        
        if len(warnings) > 0:
            report["recommendations"].append("Address warnings to improve data quality")
        
        low_quality_tasks = [score for score in report["quality_scores"] if score["quality_score"] < 70]
        if low_quality_tasks:
            report["recommendations"].append(f"Improve {len(low_quality_tasks)} tasks with quality scores below 70")
        
        return report

def validate_and_fix_tasks(tasks_file: str = 'data/tasks.json') -> Tuple[bool, List[str]]:
    """Validate tasks and attempt to fix common issues."""
    validator = TaskValidator(tasks_file)
    is_valid, errors, warnings = validator.validate_all_tasks()
    
    if is_valid:
        return True, []
    
    # Try to fix common issues
    try:
        with open(tasks_file, 'r') as f:
            tasks = json.load(f)
    except:
        return False, errors
    
    fixed_errors = []
    
    for task in tasks:
        # Fix missing required fields with defaults
        if 'objectives' not in task or not task['objectives']:
            task['objectives'] = ["Complete research objectives", "Analyze findings", "Prepare deliverable"]
        
        if 'output_type' not in task:
            task['output_type'] = 'market_analysis'
        
        if 'context' not in task:
            task['context'] = {
                "region": "Global",
                "risk_level": "Medium",
                "urgency": "Medium",
                "dependencies": [],
                "estimated_effort": "2-3 weeks"
            }
        
        # Fix invalid status
        if 'status' in task and task['status'] not in validator.VALID_STATUSES:
            task['status'] = 'New'
        
        # Fix invalid category
        if 'category' in task and task['category'] not in validator.VALID_CATEGORIES:
            task['category'] = 'Research Support'
        
        # Fix progress bounds
        if 'progress' in task:
            task['progress'] = max(0, min(100, task['progress']))
    
    # Save fixed tasks
    try:
        with open(tasks_file, 'w') as f:
            json.dump(tasks, f, indent=2)
        fixed_errors.append("Fixed common validation issues and saved updated tasks")
    except Exception as e:
        fixed_errors.append(f"Could not save fixed tasks: {e}")
    
    return len(errors) == 0, fixed_errors

if __name__ == "__main__":
    # Run validation
    validator = TaskValidator()
    is_valid, errors, warnings = validator.validate_all_tasks()
    
    print(f"Validation Results:")
    print(f"Valid: {is_valid}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")
    
    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  - {error}")
    
    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    # Generate quality report
    report = validator.get_tasks_quality_report()
    print(f"\nQuality Report:")
    print(f"Average Quality Score: {report.get('average_quality_score', 0):.1f}/100")
    print(f"Recommendations: {len(report.get('recommendations', []))}") 