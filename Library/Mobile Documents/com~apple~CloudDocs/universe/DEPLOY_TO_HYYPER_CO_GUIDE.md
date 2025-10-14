# DEPLOY DISCOVERY DIAL TO HYYPER.CO

## Overview
This guide will help you deploy your Discovery Dial application to the `hyyper.co` domain, making it accessible at that URL.

## Current Setup
- **Discovery Dial App**: Built and ready for deployment
- **WordPress.com Site**: `hyyper.co` (for content management)
- **Target Domain**: `hyyper.co` (for the app)

## Deployment Options

### Option 1: Vercel with Custom Domain (Recommended)

#### Step 1: Deploy to Vercel
1. **Go to**: https://vercel.com
2. **Import your GitHub repository**: `peteraly/universe`
3. **Configure build settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `discovery-dial`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 2: Add Environment Variables
In Vercel dashboard, add these environment variables:
```
WORDPRESS_API_URL=https://hyyper.co/wp-json/wp/v2
```

#### Step 3: Add Custom Domain
1. **Go to your project settings** in Vercel
2. **Navigate to Domains**
3. **Add domain**: `hyyper.co`
4. **Follow DNS configuration instructions**

#### Step 4: Configure DNS
Update your domain's DNS settings:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### Option 2: Netlify with Custom Domain

#### Step 1: Deploy to Netlify
1. **Go to**: https://netlify.com
2. **Connect your GitHub repository**
3. **Configure build settings**:
   - **Base directory**: `discovery-dial`
   - **Build command**: `npm run build`
   - **Publish directory**: `discovery-dial/dist`

#### Step 2: Add Environment Variables
In Netlify dashboard:
```
WORDPRESS_API_URL=https://hyyper.co/wp-json/wp/v2
```

#### Step 3: Add Custom Domain
1. **Go to Site settings** → **Domain management**
2. **Add custom domain**: `hyyper.co`
3. **Configure DNS** as instructed

### Option 3: GitHub Pages (Free Option)

#### Step 1: Configure GitHub Pages
1. **Go to your repository settings**
2. **Navigate to Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` (create this branch)

#### Step 2: Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v2
      
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd discovery-dial
        npm install
        
    - name: Build
      run: |
        cd discovery-dial
        npm run build
        env:
          WORDPRESS_API_URL: https://hyyper.co/wp-json/wp/v2
          
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./discovery-dial/dist
```

#### Step 3: Configure Custom Domain
1. **Create `CNAME` file** in `discovery-dial/dist/`:
   ```
   hyyper.co
   ```
2. **Add to your repository**
3. **Configure DNS** to point to GitHub Pages

## DNS Configuration

### For hyyper.co Domain
Update your domain's DNS settings:

```
Type: A
Name: @
Value: 76.76.19.61 (Vercel) or 75.2.60.5 (Netlify)

Type: CNAME
Name: www
Value: cname.vercel-dns.com (Vercel) or your-site.netlify.app (Netlify)
```

### Alternative DNS Setup
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www  
Value: cname.vercel-dns.com
```

## Environment Configuration

### Create `.env.production` file:
```bash
# Production environment variables
WORDPRESS_API_URL=https://hyyper.co/wp-json/wp/v2
NODE_ENV=production
```

### Update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "WORDPRESS_API_URL": "https://hyyper.co/wp-json/wp/v2"
  }
}
```

## Testing Your Deployment

### Step 1: Test WordPress.com Connection
1. **Go to**: https://hyyper.co/wp-json/wp/v2/posts
2. **Verify you see JSON data**

### Step 2: Test Your App
1. **Visit your deployed app**
2. **Open browser console**
3. **Run**: `window.testWordPressCom.runAllTests()`
4. **Check for any errors**

### Step 3: Test WordPress.com Integration
1. **Create a test post** in WordPress.com admin
2. **Check if it appears** in your Discovery Dial app
3. **Test gesture controls** and scroll prevention

## Troubleshooting

### Common Issues:

#### 1. CORS Errors
If you get CORS errors, add this to your WordPress.com theme:
```php
// Add to your WordPress.com theme's functions.php (if available)
add_action('init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

#### 2. Environment Variables Not Working
- Check Vercel/Netlify dashboard for correct environment variables
- Ensure variable names match exactly
- Redeploy after adding environment variables

#### 3. DNS Not Propagating
- DNS changes can take 24-48 hours to propagate
- Use `nslookup hyyper.co` to check DNS status
- Try accessing via IP address temporarily

#### 4. Build Failures
- Check build logs in deployment platform
- Ensure all dependencies are installed
- Verify build commands are correct

## Final Steps

### 1. Update WordPress.com Posts
Create some test posts in your WordPress.com admin:
- **Title**: "Test Event"
- **Content**: "This is a test event"
- **Categories**: Create categories like "Social", "Educational"
- **Tags**: Add relevant tags
- **Featured Image**: Upload event images

### 2. Test Full Integration
1. **Visit your app** at `hyyper.co`
2. **Test gesture controls** (dial rotation, subcategory selection)
3. **Verify scroll prevention** works
4. **Check text overlap fixes** are working
5. **Test WordPress.com integration** with your posts

### 3. Monitor Performance
- **Check loading times**
- **Monitor error logs**
- **Test on different devices**
- **Verify mobile responsiveness**

## Success Checklist

- ✅ App deployed to `hyyper.co`
- ✅ WordPress.com integration working
- ✅ Gesture controls functioning
- ✅ Scroll prevention active
- ✅ Text overlap issues resolved
- ✅ Mobile responsive design
- ✅ Fast loading times
- ✅ Error-free console

## Support

If you encounter any issues:
1. **Check browser console** for errors
2. **Verify environment variables** are set correctly
3. **Test WordPress.com API** directly
4. **Check DNS propagation** status
5. **Review deployment logs** for build errors

Your Discovery Dial app will be live at `hyyper.co` with full WordPress.com integration!
