import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, Lightbulb, Info, CheckCircle, AlertCircle } from 'lucide-react';

const AIPromptModal = ({ isOpen, onClose, onSubmit, workflow }) => {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');

  const examplePrompts = [
    "Add a delay node that waits 5 seconds before the next step",
    "Create a condition that checks if the response status is 200, if not send an error email",
    "Add a Slack notification that posts the result to #general channel",
    "Insert a code node that transforms the data from snake_case to camelCase",
    "Add error handling to catch any failures and log them to a file",
    "Create a webhook trigger that accepts POST requests at /api/orders",
    "Add an email node that sends a welcome message to new users",
    "Schedule this workflow to run every Monday at 9 AM",
    "Add a Notion integration that creates a new page with the workflow results",
    "Create a condition that routes to different actions based on the user type"
  ];

  const naturalLanguageExamples = [
    "I want to add a notification when the workflow completes successfully",
    "Can you add error handling to make this more robust?",
    "I need to send the results to our Slack channel",
    "Add a delay to avoid rate limiting issues",
    "Transform the data before sending it to the next step",
    "Create a backup of the results to our database",
    "Add logging so I can track what's happening",
    "Make this workflow run automatically every hour",
    "I want to filter out invalid data before processing",
    "Add a condition to handle different types of responses"
  ];

  useEffect(() => {
    // Check AI status when modal opens
    if (isOpen) {
      checkAIStatus();
    }
  }, [isOpen]);

  const checkAIStatus = async () => {
    try {
      // Make a simple API call to check if AI is enabled
      const response = await fetch('/api/ai-status');
      if (response.ok) {
        const data = await response.json();
        setAiStatus(data.enabled ? 'enabled' : 'mock');
      } else {
        setAiStatus('mock');
      }
    } catch (error) {
      setAiStatus('mock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit(prompt, context);
      setPrompt('');
      setContext('');
      onClose();
    } catch (error) {
      console.error('AI update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  const getStatusInfo = () => {
    switch (aiStatus) {
      case 'enabled':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'AI Assistant enabled with OpenAI',
          description: 'Your requests will be processed by GPT-4 for intelligent workflow updates.',
          color: 'green'
        };
      case 'mock':
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
          text: 'AI Assistant in mock mode',
          description: 'Smart mock responses will be generated. Set up OpenAI API key for real AI.',
          color: 'yellow'
        };
      default:
        return {
          icon: <Info className="h-4 w-4 text-blue-500" />,
          text: 'Checking AI status...',
          description: 'Verifying AI assistant configuration.',
          color: 'blue'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Workflow Assistant</h2>
              <p className="text-sm text-gray-500">Describe what you want to change in natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Status */}
            <div className={`bg-${statusInfo.color}-50 border border-${statusInfo.color}-200 rounded-lg p-4`}>
              <div className="flex items-center space-x-2 mb-2">
                {statusInfo.icon}
                <h3 className={`text-sm font-medium text-${statusInfo.color}-900`}>
                  {statusInfo.text}
                </h3>
              </div>
              <p className={`text-sm text-${statusInfo.color}-700`}>
                {statusInfo.description}
              </p>
              {aiStatus === 'mock' && (
                <div className="mt-2">
                  <a 
                    href="/setup-env.sh" 
                    className={`text-sm text-${statusInfo.color}-600 hover:text-${statusInfo.color}-800 underline`}
                  >
                    Learn how to enable real AI →
                  </a>
                </div>
              )}
            </div>

            {/* Current Workflow Info */}
            {workflow && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Current Workflow: {workflow.name}
                </h3>
                <div className="text-sm text-blue-700">
                  <p>Nodes: {workflow.nodes?.length || 0}</p>
                  <p>Edges: {workflow.edges?.length || 0}</p>
                </div>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to change?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the changes you want to make to your workflow in natural language..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 resize-none"
                required
              />
            </div>

            {/* Context Input */}
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any additional context, goals, or requirements..."
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            {/* Natural Language Examples */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                Natural Language Examples
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {naturalLanguageExamples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Examples */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Technical Examples
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Tips for Better Results
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Be specific about what you want to add, modify, or remove</li>
                <li>• Mention the order or position of new nodes</li>
                <li>• Include any conditions or logic requirements</li>
                <li>• Specify API endpoints, channels, or data transformations</li>
                <li>• Use natural language - the AI understands conversational requests</li>
                <li>• Provide context about your business goals or requirements</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Update Workflow
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal; 