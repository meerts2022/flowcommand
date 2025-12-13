# 🤖 AI Error Analysis Setup

FlowCommand now includes AI-powered error analysis to help you debug failed n8n workflows faster!

## Features

-   ✅ **Automatic Error Detection**: Failed executions are highlighted with a red ❌ badge
-   🔍 **Detailed Error View**: Click the error badge to see comprehensive error information
-   🤖 **AI Analysis**: Get intelligent insights from Google Gemini AI
    -   Root cause identification
    -   Step-by-step fix instructions
    -   Prevention strategies
    -   Best practices

## Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 2. Configure FlowCommand

Add your API key to `.env.local`:

```bash
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Restart the Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## How to Use

### Viewing Error Details

1. Open your FlowCommand dashboard (`http://localhost:3001`)
2. Look for instance cards with a red ❌ badge next to "Last Execution"
3. Click the ❌ badge to view detailed error information

### AI Analysis

1. On the error details page, click **"Analyze Error with AI"**
2. Click **"Start Analysis"**
3. Wait a few seconds while AI examines the error
4. Review the analysis with:
    - Root cause explanation
    - How to fix the issue
    - Prevention tips
    - Additional insights

## Example Analysis

The AI can help with common n8n errors like:

-   **JSON Parsing Errors**: Invalid JSON format in Set nodes or HTTP responses
-   **API Authentication Failures**: Missing or expired API keys
-   **Rate Limiting**: Too many requests to external APIs
-   **Expression Errors**: Incorrect JavaScript expressions in nodes
-   **Missing Data**: Nodes expecting data that wasn't provided

## Cost & Limits

-   **Free Tier**: Google Gemini offers 60 requests per minute for free
-   **Cost**: If you exceed free limits, check [Google AI pricing](https://ai.google.dev/pricing)
-   Each analysis uses approximately 1 API call

## Troubleshooting

### "AI service not configured"

-   Make sure `GEMINI_API_KEY` is set in `.env.local`
-   Restart the dev server after adding the key

### "Analysis failed"

-   Check your API key is valid
-   Verify you haven't exceeded rate limits
-   Check the terminal for detailed error messages

## Privacy & Security

-   Error data is sent to Google's Gemini API for analysis
-   No sensitive data (like API keys) is included in the analysis
-   All communication uses HTTPS
-   Consider using a separate Gemini API key for production environments

## Need Help?

If you encounter issues:

1. Check the terminal/console for error messages
2. Verify your Gemini API key is correct
3. Ensure the n8n instance is accessible and the API key is valid

---

Happy debugging! 🚀
