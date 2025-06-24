# AI Assistant Setup & Usage Guide

## 🚀 Quick Start

### Option 1: Mock Mode (No Setup Required)
The AI assistant works out of the box in mock mode, providing smart responses without any API keys:

```bash
npm run dev
```

### Option 2: Real AI with OpenAI
For full AI capabilities with GPT-4:

1. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Setup Environment**
   ```bash
   # Run the setup script
   ./setup-env.sh
   
   # Edit .env file
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ENABLE_AI_ASSISTANT=true
   ```

3. **Restart the Application**
   ```bash
   npm run dev
   ```

## 🎭 Mock Mode Features

When AI is disabled or no API key is provided, the system provides intelligent mock responses:

### Smart Response Types
- **Delay Nodes**: "Add a delay" → Creates a 5-second delay node
- **Email Notifications**: "Send email" → Adds email notification node
- **Slack Messages**: "Post to Slack" → Adds Slack message node
- **Conditional Logic**: "Add condition" → Creates conditional routing
- **Code Execution**: "Add custom code" → Inserts code execution node
- **Social Media**: "Post to Instagram" → Adds social media integration
- **Generic Improvements**: Any other request → Adds logging node

### Benefits of Mock Mode
- ✅ No API costs
- ✅ No rate limits
- ✅ Instant responses
- ✅ Perfect for testing
- ✅ Smart node suggestions
- ✅ Realistic workflow modifications

## 🤖 Real AI Features

With OpenAI API enabled, you get:

### Advanced Capabilities
- **Natural Language Understanding**: Complex requests and context
- **Intelligent Workflow Design**: Optimal node placement and connections
- **Error Handling**: Automatic error handling and retry logic
- **Data Transformation**: Smart data mapping and transformation
- **API Integration**: Intelligent API endpoint configuration
- **Business Logic**: Context-aware business rule implementation

### Example Prompts
```
"Create a workflow that monitors our website and sends Slack alerts when it's down"
"Add error handling to retry failed API calls up to 3 times"
"Transform the customer data from our CRM before sending to the marketing platform"
"Create a condition that routes high-value orders to VIP support"
"Add logging to track workflow execution time and performance"
```

## 💰 Cost Control

### Environment Variables
```bash
# Daily limits
MAX_DAILY_REQUESTS=50          # Maximum AI requests per day
DAILY_COST_LIMIT=1.00          # Maximum daily cost in USD

# Monthly limits  
MONTHLY_COST_LIMIT=10.00       # Maximum monthly cost in USD

# Per-request limits
MAX_TOKENS_PER_REQUEST=2000    # Maximum tokens per AI request
```

### Cost Estimates
- **GPT-4**: ~$0.03 per 1K tokens
- **Typical workflow update**: 500-1500 tokens (~$0.015-$0.045)
- **Daily limit of 50 requests**: ~$0.75-$2.25

## 🎯 Natural Language Examples

### Simple Requests
```
"I want to add a notification when the workflow completes"
"Can you add error handling to make this more robust?"
"I need to send the results to our Slack channel"
"Add a delay to avoid rate limiting issues"
```

### Complex Requests
```
"Create a workflow that monitors our e-commerce orders, validates them against our inventory system, sends confirmation emails to customers, and alerts our warehouse team for fulfillment"
"Add comprehensive error handling that logs failures to our monitoring system, retries failed operations with exponential backoff, and sends alerts to our DevOps team for critical failures"
"Transform our customer data pipeline to handle multiple data sources, validate and clean the data, enrich it with external APIs, and load it into our analytics platform"
```

### Business Context
```
"Given that we're a SaaS company with 10,000 users, create a workflow that handles user onboarding, sends personalized welcome emails based on their plan, sets up their workspace, and schedules follow-up check-ins"
"As a logistics company, build a workflow that tracks shipments in real-time, predicts delivery delays using weather data, automatically notifies customers of any issues, and escalates problems to our support team"
```

## 🔧 Advanced Configuration

### Custom Node Types
The AI understands these node types:
- `webhook` - HTTP trigger endpoints
- `httpRequest` - API calls to external services
- `slack` - Slack message notifications
- `email` - Email sending
- `delay` - Time-based delays
- `condition` - Conditional logic and routing
- `code` - Custom JavaScript execution
- `cron` - Scheduled triggers
- `notion` - Notion API integration
- `airtable` - Airtable API integration

### Environment Variables Reference
```bash
# Required for real AI
OPENAI_API_KEY=sk-your-key-here
ENABLE_AI_ASSISTANT=true

# Optional cost controls
MAX_DAILY_REQUESTS=50
MAX_TOKENS_PER_REQUEST=2000
DAILY_COST_LIMIT=1.00
MONTHLY_COST_LIMIT=10.00

# Optional integrations
SLACK_BOT_TOKEN=xoxb-your-slack-token
NOTION_API_KEY=your-notion-key
AIRTABLE_API_KEY=your-airtable-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚨 Troubleshooting

### Common Issues

**"AI Assistant is disabled"**
- Check if `ENABLE_AI_ASSISTANT=true` in `.env`
- Verify `OPENAI_API_KEY` is set correctly
- Restart the server after changing `.env`

**"Invalid API key"**
- Ensure the key starts with `sk-`
- Check if the key is valid at OpenAI platform
- Verify no extra spaces or characters

**"Rate limit exceeded"**
- Reduce `MAX_DAILY_REQUESTS` in `.env`
- Wait for the daily limit to reset
- Consider upgrading OpenAI plan

**"Cost limit reached"**
- Increase `DAILY_COST_LIMIT` or `MONTHLY_COST_LIMIT`
- Reduce `MAX_TOKENS_PER_REQUEST`
- Use mock mode for testing

### Debug Mode
Enable detailed logging:
```bash
DEBUG=openai:* npm run dev
```

## 📊 Usage Monitoring

The system automatically tracks:
- Daily request count
- Token usage
- Cost per request
- Total daily/monthly costs

View usage in the server logs or check the cost monitor:
```bash
node cost-monitor.js
```

## 🎉 Best Practices

### For Mock Mode
- Use specific, clear language
- Mention the type of node you want
- Provide context about your goals
- Test different prompt variations

### For Real AI
- Provide business context
- Explain your goals and constraints
- Use natural, conversational language
- Include specific requirements
- Mention any existing integrations

### General Tips
- Start with simple requests
- Build complexity gradually
- Test workflows after AI modifications
- Keep prompts focused and specific
- Use the context field for additional details

## 🔗 Related Documentation

- [Workflow Runner Documentation](./server/workflowRunner.js)
- [Node Types Reference](./server/nodes/)
- [API Documentation](./server/index.js)
- [Cost Monitoring](./cost-monitor.js)
- [Status Report](./STATUS_REPORT.md) 