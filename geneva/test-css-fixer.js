#!/usr/bin/env node

/**
 * Test script to demonstrate CSS error auto-fix functionality
 */

const fs = require('fs').promises;
const path = require('path');

// CSS fixes configuration
const CSS_FIXES = [
  {
    pattern: 'ring-offset-background',
    replacement: '',
    description: 'Remove invalid ring-offset-background class (not available in Tailwind)',
    severity: 'medium'
  },
  {
    pattern: 'focus-visible:ring-ring',
    replacement: 'focus-visible:ring-primary-500',
    description: 'Replace invalid ring-ring with valid primary color',
    severity: 'medium'
  },
  {
    pattern: 'bg-background',
    replacement: 'bg-white',
    description: 'Replace invalid bg-background with bg-white',
    severity: 'low'
  },
  {
    pattern: 'text-foreground',
    replacement: 'text-gray-900',
    description: 'Replace invalid text-foreground with text-gray-900',
    severity: 'low'
  },
  {
    pattern: 'border-border',
    replacement: 'border-gray-300',
    description: 'Replace invalid border-border with border-gray-300',
    severity: 'low'
  }
];

async function fixCSSFile(filePath) {
  try {
    console.log(`🔧 Fixing CSS file: ${filePath}`);
    
    let content = await fs.readFile(filePath, 'utf-8');
    const originalContent = content;
    let fixed = 0;

    console.log('📄 Original content:');
    console.log(content);
    console.log('');

    // Apply all fixes
    for (const fix of CSS_FIXES) {
      const regex = new RegExp(fix.pattern, 'g');
      const matches = content.match(regex);
      
      if (matches) {
        content = content.replace(regex, fix.replacement);
        fixed += matches.length;
        
        console.log(`✅ Applied fix: ${fix.description}`);
        console.log(`   Pattern: ${fix.pattern} → ${fix.replacement}`);
        console.log(`   Matches: ${matches.length}`);
        console.log('');
      }
    }

    // Write back if changes were made
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`📝 Updated file: ${filePath} (${fixed} fixes applied)`);
      console.log('');
      console.log('📄 Fixed content:');
      console.log(content);
    } else {
      console.log('✅ No fixes needed');
    }

    return { fixed, errors: [] };
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error);
    return { fixed: 0, errors: [error.message] };
  }
}

async function main() {
  console.log('🎨 CSS Error Auto-Fix Demo');
  console.log('==========================');
  console.log('');

  const testFile = 'test-css-error.css';
  
  try {
    await fs.access(testFile);
  } catch (error) {
    console.error(`❌ Test file ${testFile} not found`);
    return;
  }

  console.log('🔍 Before fixing:');
  console.log('================');
  const beforeContent = await fs.readFile(testFile, 'utf-8');
  console.log(beforeContent);
  console.log('');

  console.log('🔧 Running auto-fix...');
  console.log('=====================');
  const result = await fixCSSFile(testFile);
  
  console.log('');
  console.log('📊 Results:');
  console.log('===========');
  console.log(`✅ Fixed: ${result.fixed} errors`);
  console.log(`❌ Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('Errors:', result.errors);
  }

  console.log('');
  console.log('🎉 Auto-fix demo completed!');
}

main().catch(console.error);
