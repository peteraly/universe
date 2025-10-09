/**
 * CORSProxyService - Handles CORS bypass for venue parsing
 * Provides multiple fallback proxy endpoints to ensure reliable access
 */

class CORSProxyService {
  constructor() {
    this.proxyEndpoints = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://corsproxy.io/?',
      'https://api.corsproxy.io/?'
    ];
    this.currentProxyIndex = 0;
    this.failedProxies = new Set();
    this.successCounts = new Map();
    this.timeoutMs = 10000; // 10 second timeout
  }

  async fetchWithProxy(url) {
    console.log(`🔗 Attempting to fetch ${url} with CORS proxy...`);
    
    // Try each proxy endpoint
    for (let attempt = 0; attempt < this.proxyEndpoints.length; attempt++) {
      const proxyUrl = this.proxyEndpoints[this.currentProxyIndex] + encodeURIComponent(url);
      
      try {
        console.log(`🔄 Trying proxy ${this.currentProxyIndex + 1}/${this.proxyEndpoints.length}: ${this.proxyEndpoints[this.currentProxyIndex]}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Success with proxy ${this.currentProxyIndex + 1}`);
          this.recordSuccess(this.currentProxyIndex);
          return response;
        } else {
          console.warn(`❌ Proxy ${this.currentProxyIndex + 1} returned status: ${response.status}`);
          this.recordFailure(this.currentProxyIndex);
        }
      } catch (error) {
        console.warn(`❌ Proxy ${this.currentProxyIndex + 1} failed:`, error.message);
        this.recordFailure(this.currentProxyIndex);
      }
      
      // Move to next proxy
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyEndpoints.length;
    }
    
    throw new Error('All CORS proxies failed. Unable to fetch the requested URL.');
  }

  async fetchText(url) {
    const response = await this.fetchWithProxy(url);
    return await response.text();
  }

  async fetchJSON(url) {
    const response = await this.fetchWithProxy(url);
    return await response.json();
  }

  recordSuccess(proxyIndex) {
    const currentCount = this.successCounts.get(proxyIndex) || 0;
    this.successCounts.set(proxyIndex, currentCount + 1);
    this.failedProxies.delete(proxyIndex);
  }

  recordFailure(proxyIndex) {
    this.failedProxies.add(proxyIndex);
  }

  getProxyStats() {
    return {
      totalProxies: this.proxyEndpoints.length,
      failedProxies: this.failedProxies.size,
      successCounts: Object.fromEntries(this.successCounts),
      currentProxy: this.currentProxyIndex
    };
  }

  resetStats() {
    this.failedProxies.clear();
    this.successCounts.clear();
    this.currentProxyIndex = 0;
  }

  // Alternative method for direct URL testing (for development)
  async testDirectFetch(url) {
    try {
      console.log(`🧪 Testing direct fetch for ${url}...`);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors', // This will likely fail but we can test
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      console.log(`📊 Direct fetch result: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.log(`❌ Direct fetch failed (expected): ${error.message}`);
      throw error;
    }
  }

  // Method to check if a URL is likely to have CORS issues
  isLikelyCORSBlocked(url) {
    const currentOrigin = window.location.origin;
    const targetOrigin = new URL(url).origin;
    return currentOrigin !== targetOrigin;
  }

  // Smart proxy selection based on URL type
  selectBestProxy(url) {
    const urlLower = url.toLowerCase();
    
    // Prefer different proxies for different content types
    if (urlLower.includes('api') || urlLower.includes('json')) {
      return 0; // allorigins is good for APIs
    } else if (urlLower.includes('rss') || urlLower.includes('feed')) {
      return 1; // cors-anywhere for feeds
    } else {
      return this.currentProxyIndex; // Use current rotation
    }
  }
}

export default CORSProxyService;
