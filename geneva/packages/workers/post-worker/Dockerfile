FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies and FFmpeg
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    python3 \
    python3-pip \
    build-essential \
    software-properties-common \
    && add-apt-repository ppa:savoury1/ffmpeg4 \
    && apt-get update \
    && apt-get install -y \
    ffmpeg \
    espeak \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Create necessary directories
RUN mkdir -p logs temp outputs

# Install Python dependencies
RUN pip3 install numpy

# Expose port (for health checks)
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3003/health || exit 1

# Start the worker
CMD ["pnpm", "start"]
