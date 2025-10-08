#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://discovery-dial-r65ogdvyd-alyssas-projects-323405fb.vercel.app/';

console.log('🔍 Extracting design from:', TARGET_URL);

// Function to fetch HTML content
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Function to extract CSS from HTML
function extractCSS(html) {
  const cssMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const linkMatches = html.match(/<link[^>]*rel="stylesheet"[^>]*>/gi);
  
  return {
    inlineCSS: cssMatches || [],
    stylesheetLinks: linkMatches || []
  };
}

// Function to extract component structure
function extractComponentStructure(html) {
  // Look for React component patterns
  const componentPatterns = [
    /<div[^>]*className="[^"]*discovery[^"]*"[^>]*>/gi,
    /<div[^>]*className="[^"]*dial[^"]*"[^>]*>/gi,
    /<div[^>]*className="[^"]*event[^"]*"[^>]*>/gi,
    /<div[^>]*className="[^"]*circle[^"]*"[^>]*>/gi,
    /<div[^>]*className="[^"]*card[^"]*"[^>]*>/gi
  ];
  
  const components = [];
  componentPatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      components.push(...matches);
    }
  });
  
  return components;
}

// Main extraction function
async function extractDesign() {
  try {
    console.log('📥 Fetching HTML...');
    const html = await fetchHTML(TARGET_URL);
    
    console.log('🎨 Extracting CSS...');
    const cssData = extractCSS(html);
    
    console.log('🧩 Extracting component structure...');
    const components = extractComponentStructure(html);
    
    // Save extracted data
    const outputDir = path.join(__dirname, 'extracted-design');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save HTML
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    console.log('✅ Saved: index.html');
    
    // Save CSS analysis
    const cssReport = {
      inlineCSS: cssData.inlineCSS,
      stylesheetLinks: cssData.stylesheetLinks,
      extractedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'css-analysis.json'), JSON.stringify(cssReport, null, 2));
    console.log('✅ Saved: css-analysis.json');
    
    // Save components
    fs.writeFileSync(path.join(outputDir, 'components.html'), components.join('\n'));
    console.log('✅ Saved: components.html');
    
    // Extract key design patterns
    const designPatterns = {
      gradients: html.match(/bg-gradient-[^"]*/gi) || [],
      rounded: html.match(/rounded-[^"]*/gi) || [],
      shadows: html.match(/shadow-[^"]*/gi) || [],
      colors: html.match(/text-[^"]*|bg-[^"]*/gi) || [],
      spacing: html.match(/p-[^"]*|m-[^"]*|px-[^"]*|py-[^"]*/gi) || []
    };
    
    fs.writeFileSync(path.join(outputDir, 'design-patterns.json'), JSON.stringify(designPatterns, null, 2));
    console.log('✅ Saved: design-patterns.json');
    
    console.log('\n🎯 EXTRACTION COMPLETE!');
    console.log('📁 Files saved to:', outputDir);
    console.log('\n📋 Next steps:');
    console.log('1. Review the extracted files');
    console.log('2. Copy the working HTML structure');
    console.log('3. Apply the CSS classes to your components');
    console.log('4. Test the implementation');
    
  } catch (error) {
    console.error('❌ Error extracting design:', error.message);
  }
}

// Run extraction
extractDesign();
