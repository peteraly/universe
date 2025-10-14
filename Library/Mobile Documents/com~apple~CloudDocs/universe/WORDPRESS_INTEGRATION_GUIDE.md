# WORDPRESS INTEGRATION GUIDE

## Overview
This guide will help you connect your Discovery Dial application to your WordPress site using a headless architecture. We'll use WordPress as a CMS for managing events and content, while serving the frontend through Vercel.

## Prerequisites
- WordPress site with admin access
- Discovery Dial application (already built)
- Vercel account for deployment

## Step 1: WordPress Setup

### 1.1 Install WPGraphQL Plugin
1. Go to your WordPress dashboard
2. Navigate to Plugins → Add New
3. Search for "WPGraphQL"
4. Install and activate the WPGraphQL plugin
5. Go to GraphQL → Settings to configure the endpoint

### 1.2 Create Event Custom Post Type
We'll create a custom post type for events to better organize your content:

```php
// Add this to your WordPress theme's functions.php or create a custom plugin

function create_event_post_type() {
    register_post_type('event',
        array(
            'labels' => array(
                'name' => 'Events',
                'singular_name' => 'Event',
                'add_new' => 'Add New Event',
                'add_new_item' => 'Add New Event',
                'edit_item' => 'Edit Event',
                'new_item' => 'New Event',
                'view_item' => 'View Event',
                'search_items' => 'Search Events',
                'not_found' => 'No events found',
                'not_found_in_trash' => 'No events found in trash'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields'),
            'show_in_graphql' => true,
            'graphql_single_name' => 'event',
            'graphql_plural_name' => 'events',
            'menu_icon' => 'dashicons-calendar-alt'
        )
    );
}
add_action('init', 'create_event_post_type');

// Add custom fields for events
function add_event_meta_boxes() {
    add_meta_box(
        'event_details',
        'Event Details',
        'event_details_callback',
        'event',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_event_meta_boxes');

function event_details_callback($post) {
    wp_nonce_field('event_details_nonce', 'event_details_nonce');
    
    $event_date = get_post_meta($post->ID, '_event_date', true);
    $event_time = get_post_meta($post->ID, '_event_time', true);
    $event_location = get_post_meta($post->ID, '_event_location', true);
    $event_address = get_post_meta($post->ID, '_event_address', true);
    $event_category = get_post_meta($post->ID, '_event_category', true);
    $event_subcategory = get_post_meta($post->ID, '_event_subcategory', true);
    $event_distance = get_post_meta($post->ID, '_event_distance', true);
    $event_tags = get_post_meta($post->ID, '_event_tags', true);
    
    echo '<table class="form-table">';
    echo '<tr><th><label for="event_date">Event Date</label></th>';
    echo '<td><input type="date" id="event_date" name="event_date" value="' . esc_attr($event_date) . '" /></td></tr>';
    
    echo '<tr><th><label for="event_time">Event Time</label></th>';
    echo '<td><input type="time" id="event_time" name="event_time" value="' . esc_attr($event_time) . '" /></td></tr>';
    
    echo '<tr><th><label for="event_location">Location</label></th>';
    echo '<td><input type="text" id="event_location" name="event_location" value="' . esc_attr($event_location) . '" /></td></tr>';
    
    echo '<tr><th><label for="event_address">Address</label></th>';
    echo '<td><textarea id="event_address" name="event_address" rows="3" cols="50">' . esc_textarea($event_address) . '</textarea></td></tr>';
    
    echo '<tr><th><label for="event_category">Category</label></th>';
    echo '<td><select id="event_category" name="event_category">';
    echo '<option value="social" ' . selected($event_category, 'social', false) . '>Social</option>';
    echo '<option value="educational" ' . selected($event_category, 'educational', false) . '>Educational</option>';
    echo '<option value="recreational" ' . selected($event_category, 'recreational', false) . '>Recreational</option>';
    echo '<option value="professional" ' . selected($event_category, 'professional', false) . '>Professional</option>';
    echo '</select></td></tr>';
    
    echo '<tr><th><label for="event_subcategory">Subcategory</label></th>';
    echo '<td><input type="text" id="event_subcategory" name="event_subcategory" value="' . esc_attr($event_subcategory) . '" /></td></tr>';
    
    echo '<tr><th><label for="event_distance">Distance (miles)</label></th>';
    echo '<td><input type="number" id="event_distance" name="event_distance" value="' . esc_attr($event_distance) . '" step="0.1" /></td></tr>';
    
    echo '<tr><th><label for="event_tags">Tags (comma-separated)</label></th>';
    echo '<td><input type="text" id="event_tags" name="event_tags" value="' . esc_attr($event_tags) . '" /></td></tr>';
    echo '</table>';
}

function save_event_details($post_id) {
    if (!isset($_POST['event_details_nonce']) || !wp_verify_nonce($_POST['event_details_nonce'], 'event_details_nonce')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    $fields = array('event_date', 'event_time', 'event_location', 'event_address', 'event_category', 'event_subcategory', 'event_distance', 'event_tags');
    
    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
        }
    }
}
add_action('save_post', 'save_event_details');
```

### 1.3 Configure WPGraphQL Settings
1. Go to GraphQL → Settings in your WordPress admin
2. Enable the "Events" post type in the Schema Configuration
3. Note your GraphQL endpoint URL (usually `/graphql`)

## Step 2: Frontend Integration

### 2.1 Environment Variables
Create a `.env.local` file in your Discovery Dial project:

```bash
# WordPress GraphQL API
WORDPRESS_API_URL=https://your-wordpress-site.com/graphql

# Optional: WordPress REST API (if needed)
WORDPRESS_REST_API_URL=https://your-wordpress-site.com/wp-json/wp/v2

# Optional: WordPress credentials for preview mode
WORDPRESS_PREVIEW_SECRET=your-secret-key
```

### 2.2 WordPress Data Fetching Utilities
Create a new file `src/lib/wordpress.js`:

```javascript
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (process.env.WORDPRESS_PREVIEW_SECRET) {
    headers['Authorization'] = `Bearer ${process.env.WORDPRESS_PREVIEW_SECRET}`;
  }

  const res = await fetch(WORDPRESS_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(json.errors);
    throw new Error('Failed to fetch API');
  }
  return json.data;
}

export async function getAllEvents(preview = false) {
  const data = await fetchAPI(`
    query AllEvents {
      events(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
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
  `);

  return data.events.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  }));
}

export async function getEventBySlug(slug, preview = false) {
  const data = await fetchAPI(`
    query GetEventBySlug($slug: ID!) {
      event(id: $slug, idType: SLUG) {
        id
        title
        content
        excerpt
        slug
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
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
  `, {
    variables: { slug },
  });

  return data.event;
}

export async function getEventsByCategory(category, preview = false) {
  const data = await fetchAPI(`
    query GetEventsByCategory($category: String!) {
      events(first: 50, where: { metaQuery: { key: "_event_category", value: $category } }) {
        edges {
          node {
            id
            title
            excerpt
            slug
            date
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
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
  `, {
    variables: { category },
  });

  return data.events.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title,
    excerpt: edge.node.excerpt,
    slug: edge.node.slug,
    date: edge.node.date,
    image: edge.node.featuredImage?.node?.sourceUrl,
    imageAlt: edge.node.featuredImage?.node?.altText,
    ...edge.node.eventDetails
  }));
}
```

### 2.3 Update Event Data Structure
Modify your existing event data to work with WordPress:

```javascript
// src/data/wordpressEvents.js
import { getAllEvents, getEventsByCategory } from '../lib/wordpress';

export async function getWordPressEvents() {
  try {
    const events = await getAllEvents();
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug
    }));
  } catch (error) {
    console.error('Error fetching WordPress events:', error);
    return [];
  }
}

export async function getWordPressEventsByCategory(category) {
  try {
    const events = await getEventsByCategory(category);
    return events.map(event => ({
      id: event.id,
      name: event.title,
      description: event.excerpt,
      address: event.eventAddress || event.eventLocation,
      time: formatEventTime(event.eventDate, event.eventTime),
      distance: event.eventDistance ? `${event.eventDistance} mi` : null,
      category: event.eventCategory,
      subcategory: event.eventSubcategory,
      tags: event.eventTags ? event.eventTags.split(',').map(tag => tag.trim()) : [],
      image: event.image,
      imageAlt: event.imageAlt,
      slug: event.slug
    }));
  } catch (error) {
    console.error(`Error fetching WordPress events for category ${category}:`, error);
    return [];
  }
}

function formatEventTime(date, time) {
  if (!date && !time) return 'TBD';
  
  const eventDate = new Date(date);
  const timeStr = time || '12:00';
  
  return eventDate.toLocaleDateString() + ' at ' + timeStr;
}
```

### 2.4 Update Discovery Dial Component
Modify your main component to use WordPress data:

```javascript
// src/components/EventCompassFinal.jsx
import { useState, useEffect } from 'react';
import { getWordPressEvents, getWordPressEventsByCategory } from '../data/wordpressEvents';

export default function EventCompassFinal({ categories }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const wordPressEvents = await getWordPressEvents();
      setEvents(wordPressEvents);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventsByCategory = async (category) => {
    try {
      setLoading(true);
      const categoryEvents = await getWordPressEventsByCategory(category);
      setEvents(categoryEvents);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to load events for category ${category}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component logic...
}
```

## Step 3: Deployment Configuration

### 3.1 Vercel Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add:
   - `WORDPRESS_API_URL`: Your WordPress GraphQL endpoint
   - `WORDPRESS_PREVIEW_SECRET`: (Optional) For preview mode

### 3.2 Update vercel.json
```json
{
  "rewrites": [
    {
      "source": "/admin",
      "destination": "/index.html"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "functions": {
    "src/pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

## Step 4: Testing and Optimization

### 4.1 Test WordPress Connection
1. Start your development server: `npm run dev`
2. Check the browser console for any GraphQL errors
3. Verify events are loading from WordPress

### 4.2 Implement Caching
Add caching to improve performance:

```javascript
// src/lib/wordpress.js
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

export async function fetchAPI(query, { variables } = {}) {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // ... existing fetch logic ...
  
  cache.set(cacheKey, {
    data: json.data,
    timestamp: Date.now()
  });
  
  return json.data;
}
```

## Step 5: Content Management Workflow

### 5.1 Adding Events
1. Go to your WordPress admin
2. Navigate to Events → Add New
3. Fill in the event details:
   - Title and description
   - Event date and time
   - Location and address
   - Category and subcategory
   - Distance and tags
4. Publish the event

### 5.2 Content Updates
- Changes in WordPress will be reflected in your Discovery Dial app
- Use ISR (Incremental Static Regeneration) for automatic updates
- Set revalidation intervals based on your content update frequency

## Benefits of This Setup

1. **Content Management**: Easy event management through WordPress admin
2. **Performance**: Static generation with ISR for fast loading
3. **Scalability**: WordPress handles content, Vercel handles delivery
4. **Flexibility**: Can add more content types (venues, organizers, etc.)
5. **SEO**: Better SEO with static generation
6. **Security**: WordPress backend is decoupled from frontend

## Next Steps

1. Set up your WordPress site with the custom post type
2. Install and configure WPGraphQL
3. Add the environment variables
4. Test the integration locally
5. Deploy to Vercel with the new configuration
6. Start adding events through WordPress admin

This setup gives you the best of both worlds: the powerful content management of WordPress with the performance and flexibility of a modern React application.
