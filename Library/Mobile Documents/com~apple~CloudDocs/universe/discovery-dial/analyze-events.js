#!/usr/bin/env node

// Script to analyze event distribution across all filter combinations
import { ENHANCED_SAMPLE_EVENTS } from './src/data/enhancedSampleEvents.js';

console.log('🔍 ANALYZING EVENT DISTRIBUTION\n');

// Get all unique values for each filter dimension
const categories = [...new Set(ENHANCED_SAMPLE_EVENTS.map(e => e.categoryPrimary))];
const subcategories = [...new Set(ENHANCED_SAMPLE_EVENTS.map(e => e.categorySecondary))];
const times = [...new Set(ENHANCED_SAMPLE_EVENTS.map(e => e.time))];
const days = [...new Set(ENHANCED_SAMPLE_EVENTS.map(e => e.day))];

console.log('📊 AVAILABLE VALUES:');
console.log('Categories:', categories);
console.log('Subcategories:', subcategories);
console.log('Times:', times);
console.log('Days:', days);
console.log('');

// Analyze distribution
console.log('📈 DISTRIBUTION ANALYSIS:');
console.log('Total events:', ENHANCED_SAMPLE_EVENTS.length);
console.log('');

// By category
console.log('By Category:');
categories.forEach(cat => {
  const count = ENHANCED_SAMPLE_EVENTS.filter(e => e.categoryPrimary === cat).length;
  console.log(`  ${cat}: ${count} events`);
});
console.log('');

// By subcategory
console.log('By Subcategory:');
subcategories.forEach(sub => {
  const count = ENHANCED_SAMPLE_EVENTS.filter(e => e.categorySecondary === sub).length;
  console.log(`  ${sub}: ${count} events`);
});
console.log('');

// By time
console.log('By Time:');
times.forEach(time => {
  const count = ENHANCED_SAMPLE_EVENTS.filter(e => e.time === time).length;
  console.log(`  ${time}: ${count} events`);
});
console.log('');

// By day
console.log('By Day:');
days.forEach(day => {
  const count = ENHANCED_SAMPLE_EVENTS.filter(e => e.day === day).length;
  console.log(`  ${day}: ${count} events`);
});
console.log('');

// Check for missing combinations
console.log('🔍 CHECKING FOR MISSING COMBINATIONS:');
console.log('');

// Expected filter values from the UI
const expectedTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];
const expectedDays = ['Today', 'Tomorrow', 'This Week', 'Weekend'];
const expectedCategories = ['Professional', 'Social', 'Arts/Culture', 'Wellness'];
const expectedSubcategories = {
  'Professional': ['Talks', 'Workshops', 'Conferences', 'Networking', 'Mentorship'],
  'Social': ['Parties', 'Meetups', 'Dining', 'Volunteer'],
  'Arts/Culture': ['Music', 'Theater', 'Galleries', 'Film', 'Festivals'],
  'Wellness': ['Fitness', 'Outdoor', 'Sports', 'Mindfulness']
};

// Check missing times
const missingTimes = expectedTimes.filter(time => !times.includes(time));
if (missingTimes.length > 0) {
  console.log('❌ Missing times:', missingTimes);
} else {
  console.log('✅ All expected times present');
}

// Check missing days
const missingDays = expectedDays.filter(day => !days.includes(day));
if (missingDays.length > 0) {
  console.log('❌ Missing days:', missingDays);
} else {
  console.log('✅ All expected days present');
}

// Check missing categories
const missingCategories = expectedCategories.filter(cat => !categories.includes(cat));
if (missingCategories.length > 0) {
  console.log('❌ Missing categories:', missingCategories);
} else {
  console.log('✅ All expected categories present');
}

// Check missing subcategories
console.log('\nSubcategory coverage:');
Object.entries(expectedSubcategories).forEach(([category, subs]) => {
  subs.forEach(sub => {
    const count = ENHANCED_SAMPLE_EVENTS.filter(e => 
      e.categoryPrimary === category && e.categorySecondary === sub
    ).length;
    if (count === 0) {
      console.log(`❌ Missing: ${category} > ${sub}`);
    } else {
      console.log(`✅ ${category} > ${sub}: ${count} events`);
    }
  });
});

// Check specific combinations that might be missing
console.log('\n🔍 CHECKING SPECIFIC COMBINATIONS:');
console.log('');

// Check each category + subcategory + time + day combination
let missingCombinations = 0;
let totalCombinations = 0;

expectedCategories.forEach(category => {
  expectedSubcategories[category].forEach(subcategory => {
    expectedTimes.forEach(time => {
      expectedDays.forEach(day => {
        totalCombinations++;
        const count = ENHANCED_SAMPLE_EVENTS.filter(e => 
          e.categoryPrimary === category &&
          e.categorySecondary === subcategory &&
          e.time === time &&
          e.day === day
        ).length;
        
        if (count === 0) {
          missingCombinations++;
          console.log(`❌ Missing: ${category} > ${subcategory} > ${time} > ${day}`);
        }
      });
    });
  });
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total possible combinations: ${totalCombinations}`);
console.log(`Missing combinations: ${missingCombinations}`);
console.log(`Coverage: ${((totalCombinations - missingCombinations) / totalCombinations * 100).toFixed(1)}%`);

if (missingCombinations > 0) {
  console.log('\n💡 RECOMMENDATION: Add more sample events to cover missing combinations');
} else {
  console.log('\n✅ All combinations covered!');
}
