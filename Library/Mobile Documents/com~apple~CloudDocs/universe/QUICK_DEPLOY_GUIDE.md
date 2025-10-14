# QUICK DEPLOY GUIDE - Discovery Dial to hyyper.co

## 🚀 Deploy Your Discovery Dial App to hyyper.co

### Option 1: Vercel (Recommended - 5 minutes)

#### Step 1: Deploy to Vercel
1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Import**: `peteraly/universe`
5. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `discovery-dial`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Click "Deploy"**

#### Step 2: Add Custom Domain
1. **Go to your project** in Vercel dashboard
2. **Click "Settings"** → **"Domains"**
3. **Add domain**: `hyyper.co`
4. **Follow DNS instructions**

#### Step 3: Add Environment Variable
1. **Go to "Settings"** → **"Environment Variables"**
2. **Add**:
   - **Name**: `WORDPRESS_API_URL`
   - **Value**: `https://hyyper.co/wp-json/wp/v2`
3. **Redeploy**

### Option 2: Command Line (Advanced)

```bash
# Navigate to your project
cd /Users/alyssapeterson/Library/Mobile\ Documents/com~apple~CloudDocs/universe

# Run the deployment script
./deploy-to-hyyper.sh
```

### Option 3: Manual Build & Deploy

```bash
# Navigate to discovery-dial
cd discovery-dial

# Install dependencies
npm install

# Build the app
npm run build

# Deploy to Vercel (if you have Vercel CLI)
vercel --prod
```

## 🌐 DNS Configuration

### Update your domain's DNS settings:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OR**

```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## ✅ Test Your Deployment

### 1. Test WordPress.com API
Visit: https://hyyper.co/wp-json/wp/v2/posts
- Should show JSON data with your posts

### 2. Test Your App
1. **Visit your deployed app**
2. **Open browser console**
3. **Run**: `window.testWordPressCom.runAllTests()`
4. **Check for errors**

### 3. Test WordPress.com Integration
1. **Create a test post** in WordPress.com admin
2. **Check if it appears** in your Discovery Dial
3. **Test gesture controls**

## 🎯 What You'll Get

Your Discovery Dial app will be live at **hyyper.co** with:
- ✅ **WordPress.com integration** (posts as events)
- ✅ **Gesture controls** (dial rotation, subcategory selection)
- ✅ **Scroll prevention** (no accidental scrolling)
- ✅ **Text overlap fixes** (clear event information)
- ✅ **Mobile responsive** design
- ✅ **Fast loading** with caching
- ✅ **Automatic updates** from WordPress.com

## 🔧 Troubleshooting

### If deployment fails:
1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set
3. **Ensure DNS is configured** correctly
4. **Test WordPress.com API** directly

### If app doesn't load:
1. **Check browser console** for errors
2. **Verify domain is pointing** to Vercel
3. **Wait for DNS propagation** (up to 24 hours)
4. **Try accessing via Vercel URL** first

## 📱 Mobile Testing

Test your app on mobile devices:
1. **Visit hyyper.co** on your phone
2. **Test gesture controls** (dial rotation)
3. **Verify scroll prevention** works
4. **Check text readability** and layout

## 🎉 Success!

Once deployed, your Discovery Dial will be accessible at **hyyper.co** with full WordPress.com integration!

**Next steps:**
1. **Create posts** in WordPress.com admin as events
2. **Test the app** on different devices
3. **Share the URL** with others
4. **Monitor performance** and user feedback
