# 🎬 Video Generation System Setup Guide

## ✅ **Installation Complete!**

Your video generation system is now fully installed and configured. Here's what we've set up:

### 🛠️ **Dependencies Installed:**

1. **✅ Blender 4.5.1 LTS** - 3D modeling and rendering
2. **✅ FFmpeg 7.1.1** - Video processing and encoding
3. **✅ ImageMagick 7.1.2** - Image processing and effects
4. **✅ gTTS 2.5.4** - Text-to-speech generation

### 📁 **Directory Structure Created:**

```
packages/server/
├── outputs/
│   ├── videos/          # Generated video files
│   ├── captions/        # SRT caption files
│   └── thumbnails/      # Video thumbnails
├── temp/                # Temporary processing files
└── .env                 # Environment configuration
```

### 🔧 **Environment Configuration:**

Your `.env` file is configured with:
- **FFmpeg Path**: `/opt/homebrew/bin/ffmpeg`
- **Blender Path**: `/Applications/Blender.app/Contents/MacOS/Blender`
- **Output Directory**: `./outputs/videos`
- **Temp Directory**: `./temp`

## 🚀 **Next Steps:**

### **1. Start the Development Server**

```bash
cd packages/server
npm run dev
```

### **2. Start the Frontend**

```bash
cd packages/web
npm run dev
```

### **3. Access the Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🎯 **API Keys (Optional for Development)**

The system works with mock data in development mode. For production, you can add these API keys to your `.env` file:

### **Recommended APIs:**

1. **Elevation Data**
   - **OpenTopography**: Free elevation data
   - **USGS**: Government elevation data
   - **Key**: `ELEVATION_API_KEY=your_key_here`

2. **Terrain Information**
   - **MapBox**: Terrain and satellite data
   - **Google Maps**: Comprehensive mapping data
   - **Key**: `TERRAIN_API_KEY=your_key_here`

3. **Weather Data**
   - **OpenWeatherMap**: Free weather API
   - **WeatherAPI**: Comprehensive weather data
   - **Key**: `WEATHER_API_KEY=your_key_here`

4. **Golf Course Database**
   - **GolfNow**: Course information
   - **PGA Tour**: Professional course data
   - **Key**: `GOLF_COURSE_API_KEY=your_key_here`

5. **Satellite Imagery**
   - **Google Earth Engine**: High-resolution imagery
   - **Planet**: Commercial satellite data
   - **Key**: `SATELLITE_API_KEY=your_key_here`

6. **Text-to-Speech**
   - **Google Cloud TTS**: High-quality voice synthesis
   - **Amazon Polly**: Natural-sounding voices
   - **Key**: `TTS_API_KEY=your_key_here`

## 🧪 **Testing the System**

### **Run the Test Suite:**

```bash
cd packages/server
node test-video.js
```

This will verify:
- ✅ All dependencies are working
- ✅ Test video generation
- ✅ Test audio generation
- ✅ Test image processing
- ✅ Directory structure
- ✅ Environment configuration

### **Expected Test Output:**

```
🎬 Testing Video Generation System...

1️⃣ Testing FFmpeg...
✅ FFmpeg is working: ffmpeg version 7.1.1

2️⃣ Testing ImageMagick...
✅ ImageMagick is working: Version: ImageMagick 7.1.2-0

3️⃣ Testing Blender...
✅ Blender is working: Blender 4.5.1 LTS

4️⃣ Testing gTTS...
✅ gTTS is working: gtts-cli, version 2.5.4

5️⃣ Creating test directories...
✅ Test directories created

6️⃣ Generating test video...
✅ Test video created: outputs/videos/test_video.mp4 (106.7 KB)

7️⃣ Generating test audio...
✅ Test audio created: outputs/captions/test_audio.wav (31.9 KB)

8️⃣ Generating test image...
✅ Test image created: outputs/thumbnails/test_thumbnail.jpg (6.6 KB)

🎉 All tests completed successfully!
```

## 🎬 **Creating Your First Golf Course Video**

### **1. Open the Application**
- Navigate to http://localhost:3000
- You'll see the GolfVision interface

### **2. Search for a Golf Course**
- Type "Bacon Park Golf Course" in the search box
- Select the course from the dropdown
- Confirm the selection

### **3. Generate the Video**
- Click "Generate Video"
- Watch the real-time progress:
  - **Geocoding** → Finding course location
  - **Fetching Data** → Downloading elevation/layout
  - **Building Model** → Creating 3D course model
  - **Rendering** → Generating cinematic video
  - **Post-Production** → Adding voiceover/captions
  - **Deliver** → Finalizing video

### **4. Download and Share**
- Download the MP4 video file
- Share with friends and family
- Rate the video quality

## 📊 **Analytics Dashboard**

Access the analytics dashboard to monitor:
- **Performance Metrics**: Render times, success rates
- **System Health**: CPU, memory, disk usage
- **User Behavior**: Popular courses, feedback
- **Error Tracking**: Issues and resolutions

**Dashboard URL**: http://localhost:4000/api/analytics/dashboard

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Command not found" errors**
   - Restart your terminal after installation
   - Run `source ~/.zshrc` to reload PATH

2. **Permission errors**
   - Ensure directories are writable
   - Check file permissions

3. **Blender not found**
   - Verify Blender is installed in `/Applications/`
   - Check the path in `.env` file

4. **FFmpeg errors**
   - Run `ffmpeg -version` to verify installation
   - Check if codecs are available

### **Performance Optimization:**

1. **GPU Rendering** (if available)
   - Enable GPU acceleration in Blender
   - Use hardware encoding in FFmpeg

2. **Memory Management**
   - Monitor system resources
   - Clean up temporary files regularly

3. **Parallel Processing**
   - Adjust `MAX_CONCURRENT_JOBS` in `.env`
   - Balance between speed and resource usage

## 🎉 **Congratulations!**

Your GolfVision video generation system is now ready to create professional-quality golf course videos! 

### **What You Can Do:**

- ✅ **Search** for any golf course worldwide
- ✅ **Generate** cinematic 3D videos
- ✅ **Download** high-quality MP4 files
- ✅ **Share** videos with friends
- ✅ **Track** performance and analytics
- ✅ **Monitor** system health

### **Next Level Features:**

- **Custom Voiceovers**: Add personalized narration
- **Multiple Formats**: Export to different video formats
- **Batch Processing**: Generate multiple videos
- **Advanced Effects**: Add weather, time of day
- **Course Comparisons**: Side-by-side video analysis

---

**Happy golf course video creation!** ⛳🎬
