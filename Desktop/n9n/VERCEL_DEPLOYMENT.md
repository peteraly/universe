# Vercel Deployment Guide

## 🚀 Deploy to Vercel

This guide will help you deploy the n9n Automation Platform to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Node.js**: Ensure you have Node.js 18+ installed locally

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push
   ```

2. **Verify your repository structure**:
   ```
   n9n/
   ├── client/           # React frontend
   ├── server/           # Node.js backend
   ├── workflows/        # Workflow storage
   ├── vercel.json       # Vercel configuration
   ├── .vercelignore     # Files to exclude
   └── package.json      # Root package.json
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure the project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: Leave empty (handled by vercel.json)
   - **Output Directory**: Leave empty (handled by vercel.json)

5. **Add Environment Variables** (optional):
   ```
   ENABLE_AI_ASSISTANT=false
   MAX_DAILY_REQUESTS=50
   MAX_TOKENS_PER_REQUEST=2000
   ```

6. **Click "Deploy"**

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

### Step 3: Configure Environment Variables

After deployment, configure environment variables in the Vercel dashboard:

1. **Go to your project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables**:

   ```
   ENABLE_AI_ASSISTANT=false
   MAX_DAILY_REQUESTS=50
   MAX_TOKENS_PER_REQUEST=2000
   ```

   **Optional (for real AI functionality)**:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ENABLE_AI_ASSISTANT=true
   ```

### Step 4: Test Your Deployment

1. **Visit your Vercel URL** (e.g., `https://your-project.vercel.app`)
2. **Test the following features**:
   - ✅ Create a new workflow
   - ✅ Add nodes to the workflow
   - ✅ Run the workflow
   - ✅ Use AI assistant (mock mode)
   - ✅ Export workflow

### Step 5: Custom Domain (Optional)

1. **Go to your project dashboard**
2. **Navigate to Settings → Domains**
3. **Add your custom domain**
4. **Configure DNS records as instructed**

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)

The deployment uses the following configuration:

- **Backend**: Node.js serverless functions
- **Frontend**: Static React build
- **Routing**: API routes to backend, static files to frontend
- **Build**: Automatic build process for both client and server

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `ENABLE_AI_ASSISTANT` | `false` | Enable real AI (requires API key) |
| `MAX_DAILY_REQUESTS` | `50` | Daily AI request limit |
| `MAX_TOKENS_PER_REQUEST` | `2000` | Token limit per AI request |
| `OPENAI_API_KEY` | - | OpenAI API key for real AI |

### Build Process

1. **Client Build**: React app builds to `client/build/`
2. **Server Build**: Node.js serverless function
3. **Static Assets**: Served from client build directory
4. **API Routes**: Handled by serverless functions

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies are in package.json
   - Check for syntax errors in code

2. **API Routes Not Working**:
   - Verify vercel.json routing configuration
   - Check server/index.js exports
   - Ensure environment variables are set

3. **Static Files Not Loading**:
   - Verify client build completed successfully
   - Check vercel.json static file routes
   - Ensure build output directory is correct

4. **Workflow Storage Issues**:
   - Vercel uses read-only filesystem in production
   - Consider using external storage (database, cloud storage)
   - For demo purposes, workflows are stored in memory

### Debugging

1. **Check Vercel Logs**:
   - Go to project dashboard
   - Navigate to Functions tab
   - View function logs

2. **Local Testing**:
   ```bash
   npm run build
   npm start
   ```

3. **Environment Variables**:
   - Verify all required variables are set
   - Check variable names and values

## 🔄 Updates and Redeployment

### Automatic Deployments

- **Git Integration**: Push to main branch triggers automatic deployment
- **Preview Deployments**: Pull requests create preview deployments

### Manual Redeployment

1. **Via Dashboard**: Click "Redeploy" in project dashboard
2. **Via CLI**: Run `vercel --prod`

### Environment Variable Updates

1. **Update in Vercel Dashboard**
2. **Redeploy** (automatic or manual)

## 📊 Monitoring

### Vercel Analytics

- **Performance**: View in project dashboard
- **Function Logs**: Monitor serverless function execution
- **Error Tracking**: Automatic error reporting

### Custom Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Performance monitoring (New Relic, DataDog)
- Analytics (Google Analytics, Mixpanel)

## 🚀 Production Considerations

### Performance

- **CDN**: Vercel provides global CDN
- **Edge Functions**: Consider for low-latency requirements
- **Caching**: Implement appropriate caching strategies

### Security

- **Environment Variables**: Never commit sensitive data
- **API Keys**: Use Vercel's secure environment variable storage
- **CORS**: Configure appropriate CORS settings

### Scalability

- **Serverless**: Automatic scaling based on demand
- **Database**: Consider external database for production
- **Storage**: Use cloud storage for file uploads

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in project dashboard
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Happy Deploying! 🎉** 