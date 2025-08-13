# GolfVision 🏌️‍♂️

Generate synthetic golf-course marketing videos without filming, using open data and procedural assets.

## 🎯 Overview

GolfVision is a production-ready system that creates cinematic golf course marketing videos from just a course name or coordinates. The system autonomously builds a lightweight "digital twin" model, renders cinematic clips, auto-edits a 45–90 second marketing video with voiceover and captions, and provides downloadable MP4 files with web previews.

## ✨ Features

- **No-Fail Architecture**: Graceful fallbacks for every component
- **Open Source Only**: Built entirely with free, open-source tools
- **Deterministic Output**: Same input produces same output every time
- **One-Click Operation**: Simple dashboard with step-by-step progress
- **Docker Ready**: Complete containerized deployment
- **Production Grade**: Robust error handling and monitoring

## 🏗️ Architecture

```
golfvision/
├── packages/
│   ├── web/                 # React + Vite + Tailwind dashboard
│   ├── server/              # Node.js Express + BullMQ job runner
│   └── workers/
│       ├── data-worker/     # Geocoding, DEM/OSM data fetching
│       ├── model-worker/    # Blender 3D model generation
│       └── post-worker/     # FFmpeg video processing + TTS
├── docker-compose.yml       # Complete system orchestration
├── Makefile                 # Development shortcuts
└── PROJECT_STATUS.md        # Project tracking
```

## 🚀 Quick Start

### Docker (Recommended)

```bash
# Clone and setup
git clone <your-repo>
cd golfvision

# Start the entire system
make up

# Open dashboard
open http://localhost:3000
```

### Local Development

```bash
# Prerequisites
node 18+, pnpm, docker, ffmpeg, blender

# Install dependencies
pnpm install

# Start services
pnpm dev

# Run tests
pnpm test
```

## 🎮 Usage

1. **Enter Course**: Input a course name (e.g., "Pebble Beach") or coordinates
2. **Set Seed**: Optional seed for reproducible results
3. **Click Run**: Watch the 6-step pipeline execute in real-time
4. **Download**: Get your MP4 video and captions file

## 🔧 Fallback Matrix

| Component | Primary | Fallback | Graceful Degradation |
|-----------|---------|----------|---------------------|
| Geocoding | Nominatim | Default demo AOI | Uses sample coordinates |
| DEM Data | SRTM/ASTER | Flat plane | Adjusts camera angles |
| OSM Data | OpenStreetMap | Procedural layout | Generic hole labels |
| 3D Rendering | Blender GPU | Storyboard Mode | Animated map stills |
| TTS | Piper/eSpeak | Captions only | Music bed + text |

## 🛠️ Technical Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **WebSocket** for live status updates
- **PWA** capabilities

### Backend
- **Node.js** + **Express**
- **BullMQ** + **Redis** for job queuing
- **Graceful retries** and error handling

### Workers
- **data-worker**: Node.js + Python for geocoding and data fetching
- **model-worker**: Blender Python scripts for 3D generation
- **post-worker**: Node.js + FFmpeg for video processing

### Data Sources
- **Geocoding**: Nominatim (OpenStreetMap)
- **Elevation**: SRTM/ASTER DEM (NASA)
- **Course Layout**: OpenStreetMap Overpass API
- **Assets**: CC0-licensed textures and music

## 📁 Project Structure

```
golfvision/
├── packages/
│   ├── web/                    # Dashboard frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── types/          # TypeScript definitions
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── server/                 # API server
│   │   ├── src/
│   │   │   ├── routes/         # Express routes
│   │   │   ├── services/       # Business logic
│   │   │   └── workers/        # Job queue handlers
│   │   └── package.json
│   └── workers/
│       ├── data-worker/        # Data fetching worker
│       │   ├── src/
│       │   │   ├── geocoding/  # Nominatim integration
│       │   │   ├── dem/        # Elevation data fetching
│       │   │   └── osm/        # OpenStreetMap queries
│       │   └── package.json
│       ├── model-worker/       # 3D model generation
│       │   ├── scripts/        # Blender Python scripts
│       │   ├── assets/         # Textures and materials
│       │   └── requirements.txt
│       └── post-worker/        # Video processing
│           ├── src/
│           │   ├── ffmpeg/     # Video processing logic
│           │   ├── tts/        # Text-to-speech
│           │   └── music/      # Audio mixing
│           └── package.json
├── docker-compose.yml          # Service orchestration
├── Makefile                    # Development commands
├── package.json                # Root workspace config
└── PROJECT_STATUS.md           # Project tracking
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:e2e
pnpm test:golden

# Run demo job
pnpm demo
```

## 🐳 Docker Deployment

The system is fully containerized with the following services:

- **web**: React dashboard (port 3000)
- **server**: API server (port 4000)
- **redis**: Job queue (port 6379)
- **data-worker**: Data fetching service
- **model-worker**: 3D rendering service
- **post-worker**: Video processing service

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🔍 Troubleshooting

### Common Issues

1. **Blender not found**: Install Blender 3.0+ or use Storyboard Mode
2. **FFmpeg errors**: Ensure FFmpeg is installed and in PATH
3. **Redis connection**: Check if Redis is running on port 6379
4. **GPU rendering fails**: System automatically falls back to CPU rendering

### Debug Mode

```bash
# Enable debug logging
DEBUG=* pnpm dev

# Check worker status
docker-compose logs workers
```

## 📊 Performance

- **Typical render time**: 2-5 minutes per video
- **Memory usage**: 2-4GB RAM during rendering
- **Storage**: ~500MB per video project
- **Concurrent jobs**: Up to 3 simultaneous renders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for course layout data
- **NASA** for elevation data (SRTM/ASTER)
- **Blender Foundation** for 3D rendering
- **FFmpeg** for video processing
- **Piper** for text-to-speech synthesis

---

**Ready to create stunning golf course videos? Start with `make up` and open http://localhost:3000!**
