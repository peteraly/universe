/**
 * WordPress.com Connection Test Utility
 * Use this to test your WordPress.com REST API connection
 */

const WORDPRESS_COM_API_URL = 'https://hyyper.co/wp-json/wp/v2';

/**
 * Test WordPress.com REST API connection
 */
export async function testWordPressComConnection() {
  console.log('🔍 Testing WordPress.com connection to:', WORDPRESS_COM_API_URL);
  
  try {
    // Test basic REST API connection
    const response = await fetch(`${WORDPRESS_COM_API_URL}/posts?per_page=1`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ WordPress.com REST API connection successful!');
    console.log('📋 Sample post data:', data[0] ? {
      id: data[0].id,
      title: data[0].title.rendered,
      date: data[0].date
    } : 'No posts found');
    
    return { success: true, data: data };
  } catch (error) {
    console.error('❌ WordPress.com connection failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress.com Posts query
 */
export async function testWordPressComPosts() {
  console.log('🔍 Testing WordPress.com Posts query...');
  
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/posts?per_page=10&_embed=true`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.length} posts in WordPress.com`);
    
    if (data.length > 0) {
      const samplePost = data[0];
      console.log('📅 Sample post:', {
        id: samplePost.id,
        title: samplePost.title.rendered,
        excerpt: samplePost.excerpt.rendered,
        date: samplePost.date,
        slug: samplePost.slug,
        featured_media: samplePost.featured_media,
        categories: samplePost.categories,
        tags: samplePost.tags
      });
    } else {
      console.log('ℹ️ No posts found. Add some posts in WordPress.com admin!');
    }
    
    return { success: true, posts: data };
  } catch (error) {
    console.error('❌ WordPress.com Posts query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress.com Categories query
 */
export async function testWordPressComCategories() {
  console.log('🔍 Testing WordPress.com Categories query...');
  
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.length} categories in WordPress.com`);
    
    if (data.length > 0) {
      console.log('📂 Categories:', data.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat.count
      })));
    } else {
      console.log('ℹ️ No categories found. Add some categories in WordPress.com admin!');
    }
    
    return { success: true, categories: data };
  } catch (error) {
    console.error('❌ WordPress.com Categories query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress.com Tags query
 */
export async function testWordPressComTags() {
  console.log('🔍 Testing WordPress.com Tags query...');
  
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/tags`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.length} tags in WordPress.com`);
    
    if (data.length > 0) {
      console.log('🏷️ Tags:', data.slice(0, 10).map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag.count
      })));
    } else {
      console.log('ℹ️ No tags found. Add some tags in WordPress.com admin!');
    }
    
    return { success: true, tags: data };
  } catch (error) {
    console.error('❌ WordPress.com Tags query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress.com Media query
 */
export async function testWordPressComMedia() {
  console.log('🔍 Testing WordPress.com Media query...');
  
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/media?per_page=5`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Found ${data.length} media items in WordPress.com`);
    
    if (data.length > 0) {
      console.log('🖼️ Sample media:', data[0] ? {
        id: data[0].id,
        title: data[0].title.rendered,
        source_url: data[0].source_url,
        alt_text: data[0].alt_text
      } : 'No media found');
    } else {
      console.log('ℹ️ No media found. Upload some images in WordPress.com admin!');
    }
    
    return { success: true, media: data };
  } catch (error) {
    console.error('❌ WordPress.com Media query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test WordPress.com Search functionality
 */
export async function testWordPressComSearch() {
  console.log('🔍 Testing WordPress.com Search functionality...');
  
  try {
    const response = await fetch(`${WORDPRESS_COM_API_URL}/posts?search=test&per_page=5`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✅ Search for "test" returned ${data.length} results`);
    
    if (data.length > 0) {
      console.log('🔍 Search results:', data.map(post => ({
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered
      })));
    } else {
      console.log('ℹ️ No search results found. Try searching for different keywords!');
    }
    
    return { success: true, searchResults: data };
  } catch (error) {
    console.error('❌ WordPress.com Search query failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all WordPress.com tests
 */
export async function runWordPressComTests() {
  console.log('🚀 Starting WordPress.com integration tests...');
  console.log('='.repeat(50));
  
  // Test 1: Basic connection
  const connectionTest = await testWordPressComConnection();
  console.log('='.repeat(50));
  
  // Test 2: Posts query
  const postsTest = await testWordPressComPosts();
  console.log('='.repeat(50));
  
  // Test 3: Categories query
  const categoriesTest = await testWordPressComCategories();
  console.log('='.repeat(50));
  
  // Test 4: Tags query
  const tagsTest = await testWordPressComTags();
  console.log('='.repeat(50));
  
  // Test 5: Media query
  const mediaTest = await testWordPressComMedia();
  console.log('='.repeat(50));
  
  // Test 6: Search functionality
  const searchTest = await testWordPressComSearch();
  console.log('='.repeat(50));
  
  // Summary
  console.log('📊 Test Summary:');
  console.log(`Connection: ${connectionTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Posts Query: ${postsTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Categories Query: ${categoriesTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Tags Query: ${tagsTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Media Query: ${mediaTest.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Search Query: ${searchTest.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = connectionTest.success && postsTest.success && categoriesTest.success && tagsTest.success && mediaTest.success && searchTest.success;
  
  if (allPassed) {
    console.log('🎉 All tests passed! WordPress.com integration is working.');
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.');
  }
  
  return {
    connection: connectionTest,
    posts: postsTest,
    categories: categoriesTest,
    tags: tagsTest,
    media: mediaTest,
    search: searchTest,
    allPassed: allPassed
  };
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.testWordPressCom = {
    testConnection: testWordPressComConnection,
    testPosts: testWordPressComPosts,
    testCategories: testWordPressComCategories,
    testTags: testWordPressComTags,
    testMedia: testWordPressComMedia,
    testSearch: testWordPressComSearch,
    runAllTests: runWordPressComTests
  };
  
  console.log('🔧 WordPress.com test functions available at window.testWordPressCom');
  console.log('Run: window.testWordPressCom.runAllTests() to test your connection');
}
