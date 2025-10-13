/**
 * Script to enhance events with startTime, date, primaryCategory, and subcategory fields
 * Run with: node scripts/enhance-events.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract start time from display string
function extractStartTime(timeString) {
  // Match patterns like "2–4 PM", "7 PM", "2:30 PM", "10 AM"
  const match = timeString.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
  if (!match) return "12:00 PM"; // Default fallback
  
  const hours = match[1];
  const minutes = match[2] || "00";
  const period = match[3].toUpperCase();
  
  return `${hours}:${minutes} ${period}`;
}

// Helper to extract date from display string
function extractDate(timeString) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate dates for this week
  const dates = {
    today: formatDate(today),
    tomorrow: formatDate(addDays(today, 1)),
    friday: formatDate(getNextDayOfWeek(today, 5)), // Friday
    saturday: formatDate(getNextDayOfWeek(today, 6)), // Saturday
    sunday: formatDate(getNextDayOfWeek(today, 0)), // Sunday
    nextWeek: formatDate(addDays(today, 7))
  };
  
  const lowerTime = timeString.toLowerCase();
  
  if (lowerTime.includes('today') || lowerTime.includes('tonight')) {
    return dates.today;
  }
  if (lowerTime.includes('tomorrow')) {
    return dates.tomorrow;
  }
  if (lowerTime.includes('fri')) {
    return dates.friday;
  }
  if (lowerTime.includes('sat')) {
    return dates.saturday;
  }
  if (lowerTime.includes('sun')) {
    return dates.sunday;
  }
  if (lowerTime.includes('next week')) {
    return dates.nextWeek;
  }
  
  // Default to today
  return dates.today;
}

// Helper functions
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextDayOfWeek(date, targetDay) {
  const result = new Date(date);
  const currentDay = result.getDay();
  let daysToAdd = targetDay - currentDay;
  
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Next week
  }
  
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

// Main enhancement function
function enhanceEvents(categories) {
  return categories.map(category => ({
    ...category,
    subcategories: category.subcategories.map(sub => ({
      ...sub,
      events: sub.events.map(event => ({
        ...event,
        // Add startTime (extracted from time field)
        startTime: extractStartTime(event.time),
        // Add date (extracted from time field)
        date: extractDate(event.time),
        // Add category links
        primaryCategory: category.label,
        subcategory: sub.label
      }))
    }))
  }));
}

// Read, enhance, and write back
const filePath = path.join(__dirname, '../src/data/categories.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Enhancing events with startTime, date, primaryCategory, and subcategory...');

const enhanced = {
  categories: enhanceEvents(data.categories)
};

// Write back with pretty formatting
fs.writeFileSync(filePath, JSON.stringify(enhanced, null, 2), 'utf8');

console.log('✅ Events enhanced successfully!');
console.log(`📊 Processed ${data.categories.length} categories`);

// Count total events
let totalEvents = 0;
data.categories.forEach(cat => {
  cat.subcategories.forEach(sub => {
    totalEvents += sub.events.length;
  });
});

console.log(`📅 Enhanced ${totalEvents} events`);
console.log('🎯 Fields added: startTime, date, primaryCategory, subcategory');

