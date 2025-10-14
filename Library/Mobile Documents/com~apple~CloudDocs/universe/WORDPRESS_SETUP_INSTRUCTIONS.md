# WORDPRESS SETUP INSTRUCTIONS

## Quick Start Guide

Follow these steps to connect your Discovery Dial application to WordPress:

### Step 1: WordPress Site Setup

1. **Access your WordPress admin dashboard**
2. **Install WPGraphQL Plugin:**
   - Go to Plugins → Add New
   - Search for "WPGraphQL"
   - Install and activate the plugin
   - Go to GraphQL → Settings to configure

3. **Add Custom Post Type for Events:**
   - Copy the PHP code from the integration guide
   - Add it to your theme's `functions.php` file or create a custom plugin
   - This creates an "Events" post type with custom fields

### Step 2: Environment Configuration

1. **Create `.env.local` file in your Discovery Dial project:**
   ```bash
   WORDPRESS_API_URL=https://your-wordpress-site.com/graphql
   ```

2. **Replace `your-wordpress-site.com` with your actual WordPress domain**

3. **Optional: Add authentication if needed:**
   ```bash
   WORDPRESS_PREVIEW_SECRET=your-secret-key
   WORDPRESS_USERNAME=your-username
   WORDPRESS_PASSWORD=your-password
   ```

### Step 3: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console for any errors**

3. **Verify events are loading from WordPress**

### Step 4: Deploy to Vercel

1. **Add environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `WORDPRESS_API_URL` with your GraphQL endpoint

2. **Deploy your application**

## WordPress Custom Post Type Code

Add this to your WordPress theme's `functions.php` file:

```php
// Create Event Custom Post Type
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

## Adding Events

1. **Go to Events → Add New in your WordPress admin**
2. **Fill in the event details:**
   - Title and description
   - Event date and time
   - Location and address
   - Category (Social, Educational, Recreational, Professional)
   - Subcategory (e.g., "Networking", "Workshop", "Meetup")
   - Distance in miles
   - Tags (comma-separated)
3. **Publish the event**

## Troubleshooting

### Common Issues:

1. **"Failed to fetch API" error:**
   - Check your `WORDPRESS_API_URL` is correct
   - Verify WPGraphQL plugin is active
   - Check if your WordPress site is accessible

2. **No events showing:**
   - Make sure you have published events in WordPress
   - Check the browser console for GraphQL errors
   - Verify the custom post type is registered

3. **GraphQL errors:**
   - Go to GraphQL → Settings in WordPress
   - Make sure "Events" post type is enabled
   - Check the GraphQL endpoint URL

### Testing GraphQL:

1. **Go to GraphQL → GraphiQL IDE in WordPress**
2. **Test this query:**
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

## Next Steps

1. **Set up your WordPress site with the custom post type**
2. **Add some test events**
3. **Configure the environment variables**
4. **Test locally with `npm run dev`**
5. **Deploy to Vercel with the environment variables**

Your Discovery Dial will now pull events from WordPress while maintaining all the gesture controls and scroll prevention features!
