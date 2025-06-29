from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime, timedelta
import uuid
import traceback

# Import with error handling for serverless compatibility
try:
    from source_matcher import assign_sources_to_task, match_sources_to_task
except ImportError:
    def assign_sources_to_task(task, sources): return []
    def match_sources_to_task(task, sources, top_n=5): return []

try:
    from task_router import create_task
except ImportError:
    def create_task(data, origin): return data

try:
    from deliverable_generator import DeliverableGenerator
except ImportError:
    class DeliverableGenerator:
        def generate_deliverable(self, task, sources, format_type): return {}
        def render_template(self, deliverable, task, sources): return ""
        def detect_format(self, task): return "executive_brief"
        def export_deliverable(self, deliverable, task, sources, format): return ""

try:
    from api.deliverable_engine import DeliverableEngine
except ImportError:
    class DeliverableEngine:
        def aggregate_sources(self, task, sources): return []
        def generate_deliverable(self, task, sources, format_type): return {}
        def detect_format(self, task, format_type): return {}
        def render_template(self, deliverable, task, sources): return ""

try:
    from task_validator import TaskValidator, validate_and_fix_tasks
except ImportError:
    class TaskValidator:
        def get_task_quality_score(self, task): return 8.0
        def validate_all_tasks(self): return True, [], []
        def get_tasks_quality_report(self): return {}
        def validate_task(self, task): return True, [], []
    def validate_and_fix_tasks(): return True, []

try:
    from api.llm_generate import generate_llm_deliverable
except ImportError:
    def generate_llm_deliverable(task, sources): return "LLM generation not available"

app = Flask(__name__)
app.secret_key = 'research-analyst-secret-key-2025'

# Initialize deliverable generator, engine, and task validator
deliverable_generator = DeliverableGenerator()
deliverable_engine = DeliverableEngine()
task_validator = TaskValidator()

# Load data from JSON files with better error handling
def load_data(filename):
    try:
        with open(f'data/{filename}.json', 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, Exception) as e:
        print(f"Error loading {filename}: {str(e)}")
        return []

def save_data(filename, data):
    try:
        os.makedirs('data', exist_ok=True)
        with open(f'data/{filename}.json', 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving {filename}: {str(e)}")

def calculate_task_quality_scores(tasks):
    """Calculate quality scores for all tasks and add them to the task data."""
    try:
        for task in tasks:
            quality_score = task_validator.get_task_quality_score(task)
            task['quality_score'] = round(quality_score, 1)
        return tasks
    except Exception as e:
        print(f"Error calculating quality scores: {str(e)}")
        return tasks

# Health check route for debugging
@app.route('/health')
def health_check():
    try:
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'data_files': {
                'tasks': len(load_data('tasks')),
                'sources': len(load_data('sources')),
                'workflows': len(load_data('workflows')),
                'deliverables': len(load_data('deliverables'))
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Main dashboard route
@app.route('/')
def dashboard():
    try:
        tasks = load_data('tasks')
        sources = load_data('sources')
        workflows = load_data('workflows')
        deliverables = load_data('deliverables')
        
        # Calculate quality scores for tasks
        tasks = calculate_task_quality_scores(tasks)
        
        # Calculate KPIs
        completed_tasks = len([t for t in tasks if t.get('status') == 'Completed'])
        total_tasks = len(tasks) if tasks else 1
        research_requests = len([t for t in tasks if t.get('category') == 'Research Support'])
        
        # Get recent activity
        recent_activity = []
        for task in tasks[-5:]:
            recent_activity.append({
                'type': 'task_update',
                'title': task.get('title'),
                'status': task.get('status'),
                'timestamp': task.get('last_updated', datetime.now().isoformat())
            })
        
        return render_template('dashboard.html',
                             tasks=tasks,
                             sources=sources,
                             workflows=workflows,
                             deliverables=deliverables,
                             kpis={
                                 'completed_tasks': completed_tasks,
                                 'total_tasks': total_tasks,
                                 'research_requests': research_requests,
                                 'health_status': 'Excellent' if completed_tasks/total_tasks > 0.8 else 'Good'
                             },
                             recent_activity=recent_activity)
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        print(traceback.format_exc())
        return render_template('dashboard.html',
                             tasks=[],
                             sources=[],
                             workflows=[],
                             deliverables=[],
                             kpis={
                                 'completed_tasks': 0,
                                 'total_tasks': 0,
                                 'research_requests': 0,
                                 'health_status': 'Good'
                             },
                             recent_activity=[])

# Assistant panel route
@app.route('/assistant')
def assistant():
    chat_history = load_data('chat_history')
    return render_template('assistant.html', chat_history=chat_history)

# Simulation panel route
@app.route('/simulation')
def simulation():
    tasks = load_data('tasks')
    workflows = load_data('workflows')
    
    # Calculate quality scores for visual confidence indicators
    tasks = calculate_task_quality_scores(tasks)
    
    return render_template('simulation.html', tasks=tasks, workflows=workflows)

# Research sources route
@app.route('/research_sources')
def research_sources():
    sources = load_data('sources')
    tasks = load_data('tasks')
    
    # Calculate quality scores for tasks
    tasks = calculate_task_quality_scores(tasks)
    
    return render_template('research_sources.html', sources=sources, tasks=tasks)

# Search route
@app.route('/search')
def search():
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    status = request.args.get('status', '')
    
    tasks = load_data('tasks')
    sources = load_data('sources')
    deliverables = load_data('deliverables')
    
    # Calculate quality scores for tasks
    tasks = calculate_task_quality_scores(tasks)
    
    # Filter results
    results = []
    if query:
        for task in tasks:
            if query.lower() in task.get('title', '').lower() or query.lower() in task.get('description', '').lower():
                results.append({'type': 'task', 'data': task})
        
        for source in sources:
            if query.lower() in source.get('title', '').lower() or query.lower() in source.get('description', '').lower():
                results.append({'type': 'source', 'data': source})
        
        for deliverable in deliverables:
            if query.lower() in deliverable.get('title', '').lower() or query.lower() in deliverable.get('description', '').lower():
                results.append({'type': 'deliverable', 'data': deliverable})
    
    return render_template('search.html', results=results, query=query, category=category, status=status)

# Duty pages routes
@app.route('/corporate_strategy')
def corporate_strategy():
    tasks = [t for t in load_data('tasks') if t.get('category') == 'Corporate Strategy']
    tasks = calculate_task_quality_scores(tasks)
    return render_template('corporate_strategy.html', tasks=tasks)

@app.route('/research_support')
def research_support():
    tasks = [t for t in load_data('tasks') if t.get('category') == 'Research Support']
    tasks = calculate_task_quality_scores(tasks)
    return render_template('research_support.html', tasks=tasks)

@app.route('/content_curation')
def content_curation():
    tasks = [t for t in load_data('tasks') if t.get('category') == 'Content Curation']
    tasks = calculate_task_quality_scores(tasks)
    return render_template('content_curation.html', tasks=tasks)

@app.route('/communications')
def communications():
    tasks = [t for t in load_data('tasks') if t.get('category') == 'Communications']
    tasks = calculate_task_quality_scores(tasks)
    return render_template('communications.html', tasks=tasks)

# NEW: Deliverable editor route
@app.route('/edit/<task_id>')
def edit_deliverable(task_id):
    tasks = load_data('tasks')
    sources = load_data('sources')
    deliverables = load_data('deliverables')
    
    # Find the task
    task = None
    for t in tasks:
        if t.get('id') == task_id:
            task = t
            break
    
    if not task:
        return "Task not found", 404
    
    # Calculate quality score for the task
    task['quality_score'] = round(task_validator.get_task_quality_score(task), 1)
    
    # Find existing deliverable for this task
    deliverable = None
    for d in deliverables:
        if d.get('task_id') == task_id:
            deliverable = d
            break
    
    # Get sources for this task
    task_sources = []
    for source in sources:
        if source.get('id') in task.get('sources', []):
            task_sources.append(source)
    
    # Detect format
    detected_format = deliverable_generator.detect_format(task)
    
    return render_template('edit_deliverable.html',
                         task=task,
                         deliverable=deliverable,
                         sources=task_sources,
                         detected_format=detected_format,
                         deliverable_content=deliverable.get('content', '') if deliverable else '',
                         deliverable_description=task.get('deliverable', ''))

# API routes
@app.route('/api/generate', methods=['POST'])
def generate_content():
    data = request.json
    content_type = data.get('type')
    task_id = data.get('task_id')
    
    # Mock AI generation
    if content_type == 'brief':
        generated_content = f"Executive Brief for Task {task_id}: Comprehensive analysis of market trends and strategic recommendations..."
    elif content_type == 'deliverable':
        generated_content = f"Deliverable for Task {task_id}: Detailed report with findings, methodology, and actionable insights..."
    else:
        generated_content = "AI-generated content based on task requirements and available sources."
    
    return jsonify({'content': generated_content, 'timestamp': datetime.now().isoformat()})

@app.route('/api/tasks', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_tasks():
    if request.method == 'GET':
        tasks = load_data('tasks')
        # Calculate quality scores for API responses
        tasks = calculate_task_quality_scores(tasks)
        return jsonify(tasks)
    
    elif request.method == 'POST':
        data = request.json
        origin = data.get('origin', 'analyst')
        
        # Use the new task router for creating tasks
        result = create_task(data, origin)
        return jsonify(result)
    
    elif request.method == 'PUT':
        data = request.json
        tasks = load_data('tasks')
        task_id = data.get('id')
        
        for task in tasks:
            if task.get('id') == task_id:
                task.update(data)
                task['last_updated'] = datetime.now().isoformat()
                save_data('tasks', tasks)
                return jsonify(task)
        
        return jsonify({'error': 'Task not found'}), 404

@app.route('/api/sources', methods=['GET', 'POST'])
def api_sources():
    if request.method == 'GET':
        sources = load_data('sources')
        return jsonify(sources)
    
    elif request.method == 'POST':
        data = request.json
        sources = load_data('sources')
        new_source = {
            'id': f"source-{str(uuid.uuid4())[:8]}",
            'title': data.get('title'),
            'url': data.get('url'),
            'type': data.get('type'),
            'media_type': data.get('media_type', 'article'),
            'access_status': data.get('access_status', 'Available'),
            'tags': data.get('tags', []),
            'freshness': data.get('freshness', datetime.now().isoformat()),
            'relevance_score': data.get('relevance_score', 0.0),
            'assigned_tasks': data.get('assigned_tasks', [])
        }
        sources.append(new_source)
        save_data('sources', sources)
        return jsonify(new_source)

@app.route('/api/deliverables', methods=['GET', 'POST'])
def api_deliverables():
    if request.method == 'GET':
        deliverables = load_data('deliverables')
        return jsonify(deliverables)
    
    elif request.method == 'POST':
        data = request.json
        deliverables = load_data('deliverables')
        new_deliverable = {
            'id': f"deliverable-{str(uuid.uuid4())[:8]}",
            'title': data.get('title'),
            'task_id': data.get('task_id'),
            'type': data.get('type'),
            'status': 'Draft',
            'content': data.get('content', ''),
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }
        deliverables.append(new_deliverable)
        save_data('deliverables', deliverables)
        return jsonify(new_deliverable)

# NEW: Deliverable generation API
@app.route('/api/deliverables/generate', methods=['POST'])
def generate_deliverable():
    data = request.json
    task_id = data.get('task_id')
    format_type = data.get('format_type')
    use_enhanced_engine = data.get('use_enhanced_engine', True)
    use_llm = data.get('use_llm', True)  # Default to LLM
    
    tasks = load_data('tasks')
    sources = load_data('sources')
    
    # Find the task
    task = None
    for t in tasks:
        if t.get('id') == task_id:
            task = t
            break
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    try:
        if use_llm:
            # Find sources assigned to this task
            task_sources = [s for s in sources if task_id in s.get('assigned_tasks', [])]
            # Generate deliverable using LLM
            content = generate_llm_deliverable(task, task_sources)
            deliverable = {
                'id': f"deliverable-{task.get('id', 'unknown')}",
                'task_id': task.get('id'),
                'title': f"{task.get('title')}",
                'format_type': format_type or task.get('output_type', 'executive_brief'),
                'status': 'Draft',
                'content': content,
                'created_at': datetime.now().isoformat(),
                'last_updated': datetime.now().isoformat(),
                'sources_used': [s.get('id') for s in task_sources],
                'output_formats': ['pdf', 'docx', 'html']
            }
            deliverables = load_data('deliverables')
            deliverables.append(deliverable)
            save_data('deliverables', deliverables)
            return jsonify({
                'deliverable': deliverable,
                'content': content,
                'format_type': format_type,
                'generation_method': 'llm'
            })
        elif use_enhanced_engine:
            # Use the enhanced deliverable engine with external source aggregation
            aggregated_sources = deliverable_engine.aggregate_sources(task, sources)
            deliverable = deliverable_engine.generate_deliverable(task, aggregated_sources, format_type)
            format_detection = deliverable_engine.detect_format(task, format_type)
            content = deliverable_engine.render_template(deliverable, task, aggregated_sources)
            task['sources'] = [s.get('id') for s in aggregated_sources[:10]]
            save_data('tasks', tasks)
        else:
            # Fallback to original deliverable generator
            task_sources = []
            for source in sources:
                if source.get('id') in task.get('sources', []):
                    task_sources.append(source)
            deliverable = deliverable_generator.generate_deliverable(task, task_sources, format_type)
            content = deliverable_generator.render_template(deliverable, task, task_sources)
            format_detection = {'format': format_type or 'executive_brief', 'confidence': 0.8}
        deliverables = load_data('deliverables')
        deliverables.append(deliverable)
        save_data('deliverables', deliverables)
        return jsonify({
            'deliverable': deliverable,
            'content': content,
            'format_type': format_type,
            'generation_method': 'enhanced_engine' if use_enhanced_engine else 'basic_generator'
        })
    except Exception as e:
        return jsonify({'error': f'Error generating deliverable: {str(e)}'}), 500

# NEW: Deliverable export API
@app.route('/api/deliverables/export', methods=['POST'])
def export_deliverable():
    data = request.json
    task_id = data.get('task_id')
    content = data.get('content')
    format = data.get('format', 'markdown')
    
    tasks = load_data('tasks')
    sources = load_data('sources')
    
    # Find the task
    task = None
    for t in tasks:
        if t.get('id') == task_id:
            task = t
            break
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Get sources for this task
    task_sources = []
    for source in sources:
        if source.get('id') in task.get('sources', []):
            task_sources.append(source)
    
    # Create a temporary deliverable for export
    temp_deliverable = {
        'id': f"temp-{task_id}",
        'task_id': task_id,
        'title': f"Deliverable: {task.get('title')}",
        'content': content,
        'format_type': 'executive_brief'
    }
    
    # Export in the requested format
    exported_content = deliverable_generator.export_deliverable(temp_deliverable, task, task_sources, format)
    
    # In a real implementation, you would convert this to the actual file format
    # For now, we'll return the content as text
    return jsonify({
        'content': exported_content,
        'format': format,
        'filename': f"deliverable-{task_id}.{format}"
    })

# NEW: Update deliverable API
@app.route('/api/deliverables/<task_id>', methods=['PUT'])
def update_deliverable(task_id):
    data = request.json
    deliverables = load_data('deliverables')
    
    # Find existing deliverable
    deliverable = None
    for d in deliverables:
        if d.get('task_id') == task_id:
            deliverable = d
            break
    
    if deliverable:
        # Update existing deliverable
        deliverable.update(data)
        deliverable['last_updated'] = datetime.now().isoformat()
    else:
        # Create new deliverable
        deliverable = {
            'id': f"deliverable-{str(uuid.uuid4())[:8]}",
            'task_id': task_id,
            'title': f"Deliverable for Task {task_id}",
            'content': data.get('content', ''),
            'status': data.get('status', 'Draft'),
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }
        deliverables.append(deliverable)
    
    save_data('deliverables', deliverables)
    return jsonify(deliverable)

@app.route('/api/tag', methods=['POST'])
def api_tag():
    data = request.json
    tag_type = data.get('type')
    item_id = data.get('item_id')
    tags = data.get('tags', [])
    
    if tag_type == 'source':
        sources = load_data('sources')
        for source in sources:
            if source.get('id') == item_id:
                source['tags'] = tags
                save_data('sources', sources)
                return jsonify({'success': True})
    
    elif tag_type == 'task':
        tasks = load_data('tasks')
        for task in tasks:
            if task.get('id') == item_id:
                task['tags'] = tags
                save_data('tasks', tasks)
                return jsonify({'success': True})
    
    return jsonify({'error': 'Item not found'}), 404

# New API route for suggested sources
@app.route('/api/suggested_sources/<task_id>', methods=['GET'])
def get_suggested_sources(task_id):
    tasks = load_data('tasks')
    sources = load_data('sources')
    
    # Find the task
    task = None
    for t in tasks:
        if t.get('id') == task_id:
            task = t
            break
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Get suggested sources using the source matcher
    suggested_sources = match_sources_to_task(task, sources, top_n=5)
    
    return jsonify({
        'task_id': task_id,
        'suggested_sources': suggested_sources
    })

# NEW: Task validation API
@app.route('/api/tasks/validate', methods=['GET'])
def validate_tasks():
    """Validate all tasks and return validation results."""
    is_valid, errors, warnings = task_validator.validate_all_tasks()
    
    return jsonify({
        'is_valid': is_valid,
        'error_count': len(errors),
        'warning_count': len(warnings),
        'errors': errors,
        'warnings': warnings
    })

# NEW: Task quality report API
@app.route('/api/tasks/quality-report', methods=['GET'])
def get_quality_report():
    """Get comprehensive quality report for all tasks."""
    report = task_validator.get_tasks_quality_report()
    return jsonify(report)

# NEW: Validate and fix tasks API
@app.route('/api/tasks/fix', methods=['POST'])
def fix_tasks():
    """Validate tasks and attempt to fix common issues."""
    is_valid, fixed_errors = validate_and_fix_tasks()
    
    return jsonify({
        'is_valid': is_valid,
        'fixed_errors': fixed_errors,
        'message': 'Tasks validated and fixed successfully' if is_valid else 'Some issues could not be automatically fixed'
    })

# NEW: Individual task validation API
@app.route('/api/tasks/<task_id>/validate', methods=['GET'])
def validate_single_task(task_id):
    """Validate a single task and return quality score."""
    tasks = load_data('tasks')
    
    # Find the task
    task = None
    for t in tasks:
        if t.get('id') == task_id:
            task = t
            break
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Validate the task
    is_valid, errors, warnings = task_validator.validate_task(task)
    quality_score = task_validator.get_task_quality_score(task)
    
    return jsonify({
        'task_id': task_id,
        'is_valid': is_valid,
        'quality_score': round(quality_score, 1),
        'error_count': len(errors),
        'warning_count': len(warnings),
        'errors': errors,
        'warnings': warnings
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 