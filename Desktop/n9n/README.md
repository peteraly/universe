# N9N Automation Platform

A self-hosted automation SaaS tool inspired by n8n, built with Node.js, React, and OpenAI integration.

## 🚀 Features

### Core Functionality
- **Visual Workflow Editor**: Drag-and-drop interface using React Flow
- **AI-Powered Editing**: Natural language workflow modifications using OpenAI GPT-4
- **Multiple Node Types**: Webhook, HTTP Request, Slack, Email, Delay, Condition, Code, Cron, Notion, Airtable
- **Real-time Execution**: Run workflows instantly with live results
- **Export Functionality**: Generate JavaScript snippets for website embedding

### Node Types
- **Triggers**: Webhook, Cron
- **Actions**: HTTP Request, Code
- **Integrations**: Slack, Email, Notion, Airtable
- **Logic**: Condition, Delay

### AI Assistant
- Natural language workflow modifications
- Example prompts and suggestions
- Context-aware updates
- Workflow validation and improvement suggestions

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express
- **OpenAI API** for AI-powered features
- **Node-cron** for scheduled workflows
- **Axios** for HTTP requests
- **fs-extra** for file operations

### Frontend
- **React 18** with hooks
- **React Flow** for visual workflow editing
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd n9n
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env with your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the application**
   ```bash
   # Development mode (both server and client)
   npm run dev
   
   # Or start separately
   npm run server  # Backend on port 3001
   npm run client  # Frontend on port 3000
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎯 Usage

### Creating Workflows

1. **Start with a new workflow**
   - Click "New Workflow" on the dashboard
   - Give it a name and description

2. **Add nodes**
   - Drag nodes from the sidebar to the canvas
   - Configure each node by double-clicking
   - Connect nodes by dragging from output to input

3. **Configure nodes**
   - **Webhook**: Set path and HTTP method
   - **HTTP Request**: Configure URL, method, headers, body
   - **Slack**: Add webhook URL, channel, message
   - **Email**: Set recipients, subject, body
   - **Code**: Write custom JavaScript
   - **Condition**: Define conditional logic

### AI-Powered Editing

1. **Open AI Assistant**
   - Click "AI Assistant" button in the editor
   - Describe what you want to change

2. **Example prompts**
   ```
   "Add a Slack message node after the HTTP request that posts the result"
   "Add a 10-second delay before step 1"
   "If the response contains 'error', send an email and stop the workflow"
   "Trigger the workflow with a webhook at /receive-order"
   ```

3. **Review and apply**
   - AI will suggest workflow modifications
   - Review the changes and apply them

### Running Workflows

1. **Manual execution**
   - Click "Run" button in the editor
   - View results in the console

2. **Webhook triggers**
   - Use the webhook URL: `POST /webhook/{workflowId}`
   - Send data to trigger the workflow

3. **Scheduled execution**
   - Configure cron nodes with cron expressions
   - Workflows run automatically based on schedule

### Exporting Workflows

1. **Generate JavaScript snippet**
   - Click "Export" button
   - Choose export type (Snippet, Embed, Usage)

2. **Embed in websites**
   - Copy the generated JavaScript
   - Include in your HTML
   - Call `n9nWorkflow.execute(data)` to run

## 📁 Project Structure

```
n9n/
├── server/                 # Backend Node.js application
│   ├── index.js           # Express server setup
│   ├── workflowRunner.js  # Workflow execution engine
│   └── openaiService.js   # AI integration service
├── client/                # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── stores/        # Zustand state management
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main application
│   └── public/            # Static assets
├── workflows/             # JSON workflow storage
├── package.json           # Server dependencies
└── client/package.json    # Client dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NODE_ENV` | Environment mode | No (default: development) |

### Node Types Configuration

Node types are defined in `client/src/stores/workflowStore.js`. To add new node types:

1. Add to the `nodeTypes` array
2. Implement execution logic in `server/workflowRunner.js`
3. Add configuration UI in `client/src/components/NodeConfigModal.jsx`

## 🚀 Deployment

### Production Build

```bash
# Build the React application
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN cd client && npm install && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure your OpenAI API key
3. Set up reverse proxy (nginx) if needed
4. Configure SSL certificates

## 🔌 API Endpoints

### Workflows
- `GET /api/workflows` - List all workflows
- `GET /api/workflows/:id` - Get specific workflow
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Execution
- `POST /api/run/:workflowId` - Run workflow manually
- `POST /webhook/:workflowId` - Trigger workflow via webhook

### AI Features
- `POST /api/prompt-update/:workflowId` - Update workflow with AI

### Export
- `POST /api/export/:workflowId` - Generate JavaScript snippet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Create an issue for bugs or feature requests
- Check the documentation for common questions
- Review example workflows in the `/workflows` directory

## 🔮 Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and multi-tenancy
- [ ] Workflow templates and sharing
- [ ] Advanced error handling and retry logic
- [ ] Real-time collaboration
- [ ] Workflow versioning and history
- [ ] More integration nodes (Zapier, Integromat, etc.)
- [ ] Mobile-responsive design
- [ ] Workflow analytics and monitoring
- [ ] API rate limiting and security 