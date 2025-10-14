/**
 * WordPress Connection Test Utility
 * Use this to test your WordPress GraphQL connection
 */

const WORDPRESS_API_URL = 'https://hyyper.co/graphql';

/**
 * Test WordPress GraphQL connection
 */
export async function testWordPressConnection() {
  console.log('🔍 Testing WordPress connection to:', WORDPRESS_API_URL);
  
  try {
    // Test basic GraphQL connection
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            __schema {
              types {
                name
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return { success: false, errors: data.errors };
    }

    console.log('✅ WordPress GraphQL connection successful!');
    console.log('📋 Available types:', data.data.__schema.types.map(t => t.name).filter(name => name.includes('Event')));
    
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ WordPress connection failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress Events query
 */
export async function testWordPressEvents() {
  console.log('🔍 Testing WordPress Events query...');
  
  try {
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            events {
              edges {
                node {
                  id
                  title
                  excerpt
                  slug
                  date
                  eventDetails {
                    eventDate
                    eventTime
                    eventLocation
                    eventAddress
                    eventCategory
                    eventSubcategory
                    eventDistance
                    eventTags
                  }
                }
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return { success: false, errors: data.errors };
    }

    const events = data.data.events?.edges || [];
    console.log(`✅ Found ${events.length} events in WordPress`);
    
    if (events.length > 0) {
      console.log('📅 Sample event:', events[0].node);
    } else {
      console.log('ℹ️ No events found. Add some events in WordPress admin!');
    }
    
    return { success: true, events: events };
  } catch (error) {
    console.error('❌ WordPress Events query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all WordPress tests
 */
export async function runWordPressTests() {
  console.log('🚀 Starting WordPress integration tests...');
  console.log('='.repeat(50));
  
  // Test 1: Basic connection
  const connectionTest = await testWordPressConnection();
  console.log('='.repeat(50));
  
  // Test 2: Events query
  const eventsTest = await testWordPressEvents();
  console.log('='.repeat(50));
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`Connection: ${connectionTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Events Query: ${eventsTest.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (connectionTest.success && eventsTest.success) {
    console.log('🎉 All tests passed! WordPress integration is working.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }
  
  return {
    connection: connectionTest,
    events: eventsTest,
    allPassed: connectionTest.success && eventsTest.success
  };
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.testWordPress = {
    testConnection: testWordPressConnection,
    testEvents: testWordPressEvents,
    runAllTests: runWordPressTests
  };
  
  console.log('🔧 WordPress test functions available at window.testWordPress');
  console.log('Run: window.testWordPress.runAllTests() to test your connection');
}
