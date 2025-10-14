# WORDPRESS QUICK SETUP FOR HYYPER.CO

## Your WordPress Site: hyyper.co

Based on your WPGraphQL installation, here's how to quickly set up the integration:

### Step 1: WordPress Admin Setup (5 minutes)

1. **Go to your WordPress admin**: https://hyyper.co/wp-admin
2. **Add the Event Custom Post Type**:
   - Go to **Appearance → Theme Editor**
   - Select **functions.php**
   - Add this code at the end:

```php
// Create Event Custom Post Type for Discovery Dial
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

3. **Save the file**

### Step 2: Test Your GraphQL Endpoint

1. **Go to GraphQL → GraphiQL IDE** in your WordPress admin
2. **Test this query**:
```graphql
query {
  events {
    edges {
      node {
        title
        eventDetails {
          eventCategory
          eventSubcategory
        }
      }
    }
  }
}
```

3. **If it works, you'll see your events (or empty if none exist yet)**

### Step 3: Add Your First Event

1. **Go to Events → Add New** in WordPress admin
2. **Fill in the details**:
   - **Title**: "Test Event"
   - **Description**: "This is a test event"
   - **Event Date**: Today's date
   - **Event Time**: 7:00 PM
   - **Location**: "Test Location"
   - **Address**: "123 Test St, Test City"
   - **Category**: "Social"
   - **Subcategory**: "Meetup"
   - **Distance**: 5.0
   - **Tags**: "test, networking, fun"
3. **Publish the event**

### Step 4: Configure Your Discovery Dial

1. **Create `.env.local` file** in your Discovery Dial project:
```bash
WORDPRESS_API_URL=https://hyyper.co/graphql
```

2. **Test locally**:
```bash
npm run dev
```

3. **Check browser console** for any errors

### Step 5: Deploy to Vercel

1. **Go to Vercel dashboard**
2. **Add environment variable**:
   - Name: `WORDPRESS_API_URL`
   - Value: `https://hyyper.co/graphql`
3. **Redeploy your application**

## Troubleshooting

### If GraphQL doesn't work:
1. **Check WPGraphQL plugin is active**
2. **Go to GraphQL → Settings**
3. **Make sure "Events" post type is enabled**
4. **Check the endpoint URL is `/graphql`**

### If no events show:
1. **Make sure you have published events**
2. **Check the browser console for errors**
3. **Verify the GraphQL query works in GraphiQL IDE**

### If you get CORS errors:
1. **Add this to your WordPress theme's functions.php**:
```php
// Allow CORS for GraphQL
add_action('init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

## Your GraphQL Endpoint
**https://hyyper.co/graphql**

## Next Steps
1. Add more events through WordPress admin
2. Customize the event categories and subcategories
3. Add event images and more detailed information
4. Test the Discovery Dial with your WordPress events

Your Discovery Dial will now pull events from your WordPress site at hyyper.co!
