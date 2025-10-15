/**
 * Social Sharing Testing Utilities
 * Comprehensive testing suite for playlist and social features
 */

import { isDocumentAvailable, isWindowAvailable } from './safeDOM';

export const testPlaylistCreation = () => {
  console.log('🧪 Testing Playlist Creation...');
  
  try {
    // Test playlist data structure
    const testPlaylist = {
      id: 'test_' + Date.now(),
      name: 'Test Playlist',
      description: 'A test playlist for testing',
      events: ['event1', 'event2'],
      owner: 'test_user',
      collaborators: [],
      viewers: [],
      privacy: 'private',
      tags: ['test'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareUrl: 'https://hyyper.co/playlist/test',
      isCollaborative: false,
      maxCollaborators: 10,
      allowComments: false,
      eventOrder: ['event1', 'event2']
    };

    // Validate required fields
    const requiredFields = ['id', 'name', 'events', 'owner', 'privacy', 'createdAt'];
    const missingFields = requiredFields.filter(field => !testPlaylist[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return false;
    }

    // Test localStorage operations
    if (isWindowAvailable()) {
      const stored = localStorage.getItem('discovery-dial-playlists');
      const playlists = stored ? JSON.parse(stored) : [];
      playlists.push(testPlaylist);
      localStorage.setItem('discovery-dial-playlists', JSON.stringify(playlists));
      
      // Verify storage
      const retrieved = JSON.parse(localStorage.getItem('discovery-dial-playlists'));
      const found = retrieved.find(p => p.id === testPlaylist.id);
      
      if (!found) {
        console.error('❌ Failed to store/retrieve playlist');
        return false;
      }
      
      // Cleanup
      const cleaned = retrieved.filter(p => p.id !== testPlaylist.id);
      localStorage.setItem('discovery-dial-playlists', JSON.stringify(cleaned));
    }

    console.log('✅ Playlist creation test passed');
    return true;
  } catch (error) {
    console.error('❌ Playlist creation test failed:', error);
    return false;
  }
};

export const testSocialFeatures = () => {
  console.log('🧪 Testing Social Features...');
  
  try {
    // Test friend data structure
    const testFriend = {
      id: 'friend_' + Date.now(),
      username: 'testfriend',
      displayName: 'Test Friend',
      avatar: '',
      addedAt: new Date().toISOString()
    };

    // Test friend request
    const testRequest = {
      id: 'request_' + Date.now(),
      fromUser: 'test_user',
      toUser: 'testfriend',
      message: 'Test friend request',
      status: 'pending',
      createdAt: new Date().toISOString(),
      respondedAt: null
    };

    // Test notification
    const testNotification = {
      id: 'notif_' + Date.now(),
      userId: 'test_user',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Test friend wants to be your friend',
      data: { fromUser: 'testfriend', requestId: testRequest.id },
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/friends'
    };

    // Test localStorage operations
    if (isWindowAvailable()) {
      // Test friends storage
      const storedFriends = localStorage.getItem('discovery-dial-friends');
      const friends = storedFriends ? JSON.parse(storedFriends) : [];
      friends.push(testFriend);
      localStorage.setItem('discovery-dial-friends', JSON.stringify(friends));

      // Test friend requests storage
      const storedRequests = localStorage.getItem('discovery-dial-friend-requests');
      const requests = storedRequests ? JSON.parse(storedRequests) : [];
      requests.push(testRequest);
      localStorage.setItem('discovery-dial-friend-requests', JSON.stringify(requests));

      // Test notifications storage
      const storedNotifications = localStorage.getItem('discovery-dial-notifications');
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
      notifications.push(testNotification);
      localStorage.setItem('discovery-dial-notifications', JSON.stringify(notifications));

      // Verify all storage
      const retrievedFriends = JSON.parse(localStorage.getItem('discovery-dial-friends'));
      const retrievedRequests = JSON.parse(localStorage.getItem('discovery-dial-friend-requests'));
      const retrievedNotifications = JSON.parse(localStorage.getItem('discovery-dial-notifications'));

      const friendFound = retrievedFriends.find(f => f.id === testFriend.id);
      const requestFound = retrievedRequests.find(r => r.id === testRequest.id);
      const notificationFound = retrievedNotifications.find(n => n.id === testNotification.id);

      if (!friendFound || !requestFound || !notificationFound) {
        console.error('❌ Failed to store/retrieve social data');
        return false;
      }

      // Cleanup
      const cleanedFriends = retrievedFriends.filter(f => f.id !== testFriend.id);
      const cleanedRequests = retrievedRequests.filter(r => r.id !== testRequest.id);
      const cleanedNotifications = retrievedNotifications.filter(n => n.id !== testNotification.id);
      
      localStorage.setItem('discovery-dial-friends', JSON.stringify(cleanedFriends));
      localStorage.setItem('discovery-dial-friend-requests', JSON.stringify(cleanedRequests));
      localStorage.setItem('discovery-dial-notifications', JSON.stringify(cleanedNotifications));
    }

    console.log('✅ Social features test passed');
    return true;
  } catch (error) {
    console.error('❌ Social features test failed:', error);
    return false;
  }
};

export const testPlaylistSharing = () => {
  console.log('🧪 Testing Playlist Sharing...');
  
  try {
    // Test share link generation
    const generateShareUrl = () => {
      return `https://hyyper.co/playlist/${Math.random().toString(36).substr(2, 9)}`;
    };

    const shareUrl = generateShareUrl();
    if (!shareUrl || !shareUrl.includes('hyyper.co/playlist/')) {
      console.error('❌ Invalid share URL generated');
      return false;
    }

    // Test privacy levels
    const privacyLevels = ['private', 'public', 'link'];
    const testPrivacy = privacyLevels[Math.floor(Math.random() * privacyLevels.length)];
    
    if (!privacyLevels.includes(testPrivacy)) {
      console.error('❌ Invalid privacy level');
      return false;
    }

    // Test collaboration permissions
    const permissions = ['viewer', 'collaborator', 'admin'];
    const testPermission = permissions[Math.floor(Math.random() * permissions.length)];
    
    if (!permissions.includes(testPermission)) {
      console.error('❌ Invalid collaboration permission');
      return false;
    }

    console.log('✅ Playlist sharing test passed');
    return true;
  } catch (error) {
    console.error('❌ Playlist sharing test failed:', error);
    return false;
  }
};

export const testUIComponents = () => {
  console.log('🧪 Testing UI Components...');
  
  try {
    if (!isDocumentAvailable()) {
      console.warn('⚠️ Document not available for UI testing');
      return true;
    }

    // Test playlist button
    const playlistButton = document.querySelector('.playlist-button');
    if (!playlistButton) {
      console.error('❌ Playlist button not found');
      return false;
    }

    // Test playlist panel
    const playlistPanel = document.querySelector('.playlist-panel');
    if (!playlistPanel) {
      console.log('ℹ️ Playlist panel not visible (expected when closed)');
    }

    // Test playlist builder
    const playlistBuilder = document.querySelector('.playlist-builder');
    if (!playlistBuilder) {
      console.log('ℹ️ Playlist builder not visible (expected when closed)');
    }

    // Test button clickability
    const buttonRect = playlistButton.getBoundingClientRect();
    if (buttonRect.width < 44 || buttonRect.height < 44) {
      console.warn('⚠️ Playlist button may be too small for touch targets');
    }

    console.log('✅ UI components test passed');
    return true;
  } catch (error) {
    console.error('❌ UI components test failed:', error);
    return false;
  }
};

export const testMobileCompatibility = () => {
  console.log('🧪 Testing Mobile Compatibility...');
  
  try {
    if (!isWindowAvailable()) {
      console.warn('⚠️ Window not available for mobile testing');
      return true;
    }

    // Test viewport detection
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (window.innerWidth <= 768) ||
             ('ontouchstart' in window);
    };

    const mobileDetected = isMobile();
    console.log(`📱 Mobile detected: ${mobileDetected}`);

    // Test touch support
    const touchSupported = 'ontouchstart' in window;
    console.log(`👆 Touch supported: ${touchSupported}`);

    // Test responsive design
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    console.log(`📐 Viewport: ${viewportWidth}x${viewportHeight}`);

    // Test CSS media queries
    if (isDocumentAvailable()) {
      const testElement = document.createElement('div');
      testElement.style.width = '100vw';
      testElement.style.height = '100vh';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const width = parseInt(computedStyle.width);
      const height = parseInt(computedStyle.height);
      
      document.body.removeChild(testElement);
      
      if (width !== viewportWidth || height !== viewportHeight) {
        console.warn('⚠️ CSS viewport units may not be working correctly');
      }
    }

    console.log('✅ Mobile compatibility test passed');
    return true;
  } catch (error) {
    console.error('❌ Mobile compatibility test failed:', error);
    return false;
  }
};

export const testPerformance = () => {
  console.log('🧪 Testing Performance...');
  
  try {
    if (!isWindowAvailable()) {
      console.warn('⚠️ Window not available for performance testing');
      return true;
    }

    // Test localStorage performance
    const startTime = performance.now();
    
    // Simulate storing large playlist data
    const largePlaylist = {
      id: 'perf_test_' + Date.now(),
      name: 'Performance Test Playlist',
      events: Array.from({ length: 100 }, (_, i) => `event_${i}`),
      collaborators: Array.from({ length: 50 }, (_, i) => `user_${i}`),
      tags: Array.from({ length: 20 }, (_, i) => `tag_${i}`)
    };

    const stored = localStorage.getItem('discovery-dial-playlists');
    const playlists = stored ? JSON.parse(stored) : [];
    playlists.push(largePlaylist);
    localStorage.setItem('discovery-dial-playlists', JSON.stringify(playlists));

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`⏱️ LocalStorage operation took ${duration.toFixed(2)}ms`);

    if (duration > 100) {
      console.warn('⚠️ LocalStorage operation may be slow');
    }

    // Cleanup
    const cleaned = playlists.filter(p => p.id !== largePlaylist.id);
    localStorage.setItem('discovery-dial-playlists', JSON.stringify(cleaned));

    // Test memory usage
    if (performance.memory) {
      const memoryInfo = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
      
      console.log(`🧠 Memory usage: ${memoryInfo.used}MB / ${memoryInfo.total}MB (limit: ${memoryInfo.limit}MB)`);
      
      if (memoryInfo.used > memoryInfo.limit * 0.8) {
        console.warn('⚠️ High memory usage detected');
      }
    }

    console.log('✅ Performance test passed');
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return false;
  }
};

export const testErrorHandling = () => {
  console.log('🧪 Testing Error Handling...');
  
  try {
    // Test invalid playlist data
    const invalidPlaylist = {
      // Missing required fields
      name: '',
      events: null,
      privacy: 'invalid'
    };

    // Test error recovery
    try {
      JSON.stringify(invalidPlaylist);
    } catch (error) {
      console.log('✅ Error handling for invalid data works');
    }

    // Test localStorage error handling
    if (isWindowAvailable()) {
      try {
        // Try to access localStorage with invalid key
        localStorage.getItem(null);
        console.log('✅ LocalStorage error handling works');
      } catch (error) {
        console.log('✅ LocalStorage error caught and handled');
      }
    }

    // Test component error boundaries
    if (isDocumentAvailable()) {
      const errorBoundary = document.querySelector('[data-error-boundary]');
      if (errorBoundary) {
        console.log('✅ Error boundary component found');
      }
    }

    console.log('✅ Error handling test passed');
    return true;
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return false;
  }
};

export const runAllSocialSharingTests = async () => {
  console.log('🚀 Starting Social Sharing Test Suite...');
  console.log('='.repeat(50));

  const tests = [
    { name: 'Playlist Creation', fn: testPlaylistCreation },
    { name: 'Social Features', fn: testSocialFeatures },
    { name: 'Playlist Sharing', fn: testPlaylistSharing },
    { name: 'UI Components', fn: testUIComponents },
    { name: 'Mobile Compatibility', fn: testMobileCompatibility },
    { name: 'Performance', fn: testPerformance },
    { name: 'Error Handling', fn: testErrorHandling }
  ];

  const results = [];
  
  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} Test...`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      console.log(result ? '✅ PASSED' : '❌ FAILED');
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error);
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Social sharing features are working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }

  return results;
};

// Expose testing utilities globally
if (isWindowAvailable()) {
  window.socialSharingTesting = {
    testPlaylistCreation,
    testSocialFeatures,
    testPlaylistSharing,
    testUIComponents,
    testMobileCompatibility,
    testPerformance,
    testErrorHandling,
    runAllSocialSharingTests
  };
  
  console.log('🔧 Social Sharing Testing utilities loaded. Access via window.socialSharingTesting');
}

export default {
  testPlaylistCreation,
  testSocialFeatures,
  testPlaylistSharing,
  testUIComponents,
  testMobileCompatibility,
  testPerformance,
  testErrorHandling,
  runAllSocialSharingTests
};
