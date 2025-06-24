#!/bin/bash

echo "🚀 Setting up n9n Automation Platform Environment"
echo "=================================================="

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    echo "Current settings:"
    cat .env | grep -E "(ENABLE_AI_ASSISTANT|OPENAI_API_KEY|MAX_DAILY_REQUESTS)" || echo "No AI settings found"
else
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
ENABLE_AI_ASSISTANT=false
MAX_DAILY_REQUESTS=50
MAX_TOKENS_PER_REQUEST=2000

# Cost Control
DAILY_COST_LIMIT=1.00
MONTHLY_COST_LIMIT=10.00

# Optional: Database Configuration (for future use)
# DATABASE_URL=postgresql://username:password@localhost:5432/n9n

# Optional: Email Configuration (for future use)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password

# Optional: Slack Configuration (for future use)
# SLACK_BOT_TOKEN=xoxb-your-slack-bot-token

# Optional: Notion Configuration (for future use)
# NOTION_API_KEY=your_notion_api_key

# Optional: Airtable Configuration (for future use)
# AIRTABLE_API_KEY=your_airtable_api_key
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🔧 AI Assistant Setup Instructions:"
echo "==================================="
echo "1. To enable AI Assistant with OpenAI:"
echo "   - Get an API key from https://platform.openai.com/api-keys"
echo "   - Edit .env file and set:"
echo "     OPENAI_API_KEY=sk-your-actual-api-key"
echo "     ENABLE_AI_ASSISTANT=true"
echo ""
echo "2. To use mock AI (no API key needed):"
echo "   - Leave ENABLE_AI_ASSISTANT=false"
echo "   - The system will provide smart mock responses"
echo ""
echo "3. Cost Control:"
echo "   - Set MAX_DAILY_REQUESTS to limit daily API calls"
echo "   - Set DAILY_COST_LIMIT and MONTHLY_COST_LIMIT for budget control"
echo ""
echo "🎭 Mock Mode Features:"
echo "====================="
echo "- Smart responses based on your prompts"
echo "- Adds appropriate nodes (delay, email, slack, etc.)"
echo "- No API costs or rate limits"
echo "- Perfect for testing and development"
echo ""
echo "🚀 Ready to start! Run: npm run dev" 