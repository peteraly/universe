# Research Analyst Dashboard

A modular AI-powered research analyst dashboard built with Flask, featuring comprehensive task management, source matching, and deliverable generation capabilities.

## 🚀 New Features: Deliverable Generation System

### What's New
The system now includes a complete deliverable generation pipeline that bridges the gap from research to actual output:

#### ✅ **Prompt-to-Deliverable Execution Chain**
- **Format Detection**: Automatically determines the appropriate deliverable format based on task characteristics
- **Prompt Profiles**: Structured prompt chains for different deliverable types (executive brief, market analysis, regulatory roadmap, etc.)
- **Template System**: Jinja2 templates for clean, professional output formats

#### ✅ **Embedded Editor Interface**
- **WYSIWYG Editor**: Full-featured editor with formatting tools and real-time preview
- **Source Integration**: Live source citation panel with one-click insertion
- **AI Assistance**: Inline AI tools for improving writing, summarizing, and expanding content
- **Auto-save**: Automatic draft saving with version control

#### ✅ **Citation & Source Embedding**
- **Auto-citation Generator**: Automatic citation formatting (APA style)
- **Source Snippet Fetcher**: Extract and insert relevant quotes from sources
- **Inline References**: Seamless integration of sources into deliverables
- **Citation Validation**: Ensures all citations reference valid sources

#### ✅ **Output Pipeline**
- **Multi-format Export**: Export to PDF, DOCX, HTML, and PowerPoint
- **Version Control**: Track changes and maintain deliverable history
- **Professional Templates**: Ready-to-use templates for different deliverable types

### Deliverable Types Supported
1. **Executive Brief** - 2-3 page concise analysis for senior leadership
2. **Market Analysis** - Comprehensive market research with data visualization
3. **Regulatory Roadmap** - Compliance timeline and impact analysis
4. **Presentation Deck** - PowerPoint-style presentation for stakeholder meetings
5. **Policy Memo** - Internal policy recommendation document

## 🚀 Features

### Core Dashboard
- **KPI Overview**: Tasks completed, research requests, health status
- **Priority Matrix**: Visual task prioritization grid
- **Recent Activity Feed**: Real-time updates and notifications
- **Deliverables Progress**: Track completion status and deadlines

### AI Copilot Assistant
- **Fixed Bottom-Right Panel**: Always accessible AI assistant
- **Natural Language Input**: Chat with AI for task assistance
- **Task Suggestions**: AI-powered recommendations
- **Brief Generation**: Automated content creation
- **Chat History**: Persistent conversation memory

### Research Management
- **Task Management**: Create, edit, and track research tasks
- **Source Integration**: Browse and tag research sources
- **Workflow Simulation**: Test and optimize research processes
- **Unified Search**: Search across tasks, sources, and deliverables

### Duty-Specific Pages
- **Corporate Strategy**: Strategic research and analysis
- **Research Support**: Technical research assistance
- **Content Curation**: Content management and curation
- **Communications**: Stakeholder communication tools

## 🛠 Tech Stack

- **Backend**: Flask (Python) with modular route handlers
- **Frontend**: Jinja2 templates with Bootstrap 5 (dark theme)
- **Styling**: Visa brand colors (#1a1f71 blue, #f7b600 gold)
- **Data**: JSON-based storage with modular file structure
- **AI Integration**: Prompt-based content generation and source matching
- **Deployment**: Vercel-ready with simple local development

## 🎨 Design

- **Dark Theme**: Professional dark interface
- **Visa Brand Colors**: 
  - Primary Blue: #1a1f71
  - Accent Gold: #f7b600
- **Typography**: Inter font family
- **Responsive**: Mobile-friendly design

## 📁 Project Structure

```
researchanalyst/
├── app.py                          # Main Flask application
├── deliverable_generator.py        # NEW: Deliverable generation engine
├── prompt_profiles.json            # NEW: Format detection and prompt chains
├── task_router.py                  # Task creation and routing
├── source_matcher.py               # Source matching and assignment
├── utils/
│   └── cite.py                     # NEW: Citation and source management
├── deliverable_templates/          # NEW: Jinja2 templates for deliverables
│   ├── executive_brief.md.j2
│   ├── market_analysis.md.j2
│   └── ...
├── templates/
│   ├── base.html
│   ├── dashboard.html
│   ├── simulation.html
│   ├── edit_deliverable.html       # NEW: Deliverable editor interface
│   └── ...
├── static/
│   └── style.css
├── data/
│   ├── tasks.json
│   ├── sources.json
│   ├── deliverables.json
│   └── ...
├── vercel.json
└── requirements.txt
```

## 🚀 Quick Start

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   cd researchanalyst
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Access the dashboard**:
   Open http://localhost:5000 in your browser

### Deployment to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** to complete deployment

## 🎯 Key Features

### Dashboard Overview
- Real-time KPI monitoring
- Priority matrix for task management
- Recent activity tracking
- Deliverable progress visualization

### AI Copilot
- Natural language task assistance
- Automated content generation
- Intelligent task suggestions
- Persistent conversation memory

### Research Tools
- Source tagging and categorization
- Workflow simulation and optimization
- Unified search across all content
- Task-source mapping and analytics

### Duty-Specific Views
- **Corporate Strategy**: Strategic analysis and planning
- **Research Support**: Technical research assistance
- **Content Curation**: Content management tools
- **Communications**: Stakeholder communication

### Deliverable Editor (NEW)
- **Format Detection**: Automatic format recommendation based on task
- **Rich Text Editing**: WYSIWYG editor with formatting tools
- **Source Panel**: Live source browsing and citation insertion
- **AI Assistance**: Writing improvement, summarization, and expansion tools
- **Multi-format Export**: PDF, DOCX, HTML, PowerPoint export
- **Auto-save**: Automatic draft saving with version control

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus search bar
- `Ctrl/Cmd + /`: Focus AI copilot input
- `Enter`: Send copilot message

## 🔧 Configuration

### Customizing Data
Edit the JSON files in the `data/` directory to customize:
- Research tasks and priorities
- Source libraries and access
- Workflow definitions
- AI conversation history

### Styling
Modify `static/style.css` to adjust:
- Color scheme and branding
- Layout and spacing
- Component styling
- Responsive breakpoints

### Prompt Profiles
Edit `prompt_profiles.json` to customize:
- Format detection rules
- Prompt chains for different deliverable types
- Output format options

### Templates
Modify templates in `deliverable_templates/` to customize:
- Document structure and formatting
- Branding and styling
- Section layouts and content flow

### Citation Styles
Update `utils/cite.py` to support:
- Different citation formats (APA, MLA, Chicago)
- Custom citation rules
- Source integration preferences

## 📊 Sample Data

The system includes realistic sample data for:
- 20 detailed research tasks across different categories
- 15+ research sources with relevance scoring
- 10+ deliverables in various formats
- Comprehensive stakeholder profiles
- Realistic chat history and AI interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**Built with ❤️ for research analysts who need to turn insights into actionable deliverables.** 