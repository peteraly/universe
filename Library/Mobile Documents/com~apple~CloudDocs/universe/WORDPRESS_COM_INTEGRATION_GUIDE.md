# WORDPRESS.COM INTEGRATION GUIDE

## Important: WordPress.com vs Self-Hosted WordPress

You're using **WordPress.com** (hosted WordPress), which has different capabilities than self-hosted WordPress. Here's how to integrate with your Discovery Dial:

## WordPress.com Limitations

- ❌ No access to `functions.php`
- ❌ No custom PHP code
- ❌ No custom post types (without Business plan)
- ❌ Limited plugin access
- ❌ No direct file editing

## WordPress.com Solutions

### Option 1: Use WordPress.com REST API (Recommended)

WordPress.com provides a REST API that we can use instead of GraphQL:

**API Endpoint**: `https://hyyper.co/wp-json/wp/v2/posts`

### Option 2: Upgrade to WordPress.com Business Plan

With a Business plan, you can:
- Install custom plugins (including WPGraphQL)
- Add custom post types
- Use custom PHP code

### Option 3: Use WordPress.com Posts as Events

We can use regular WordPress posts and add custom fields through the block editor.

## Implementation for WordPress.com

### Step 1: Test WordPress.com REST API

1. **Go to**: https://hyyper.co/wp-json/wp/v2/posts
2. **You should see JSON data** with your posts
3. **This confirms the API is working**

### Step 2: Create Posts as Events

1. **Go to Posts → Add New** in WordPress.com admin
2. **Use the title as event name**
3. **Use content as event description**
4. **Add custom fields** (if available in your plan):
   - `event_date`
   - `event_time`
   - `event_location`
   - `event_category`
   - `event_subcategory`
   - `event_distance`
   - `event_tags`

### Step 3: Update Discovery Dial Configuration

We'll modify the integration to use WordPress.com REST API instead of GraphQL.

## WordPress.com REST API Integration

### API Endpoints Available:

- **Posts**: `https://hyyper.co/wp-json/wp/v2/posts`
- **Categories**: `https://hyyper.co/wp-json/wp/v2/categories`
- **Tags**: `https://hyyper.co/wp-json/wp/v2/tags`
- **Media**: `https://hyyper.co/wp-json/wp/v2/media`

### Sample API Response:

```json
{
  "id": 1,
  "title": {
    "rendered": "Test Event"
  },
  "content": {
    "rendered": "This is a test event description"
  },
  "excerpt": {
    "rendered": "Event excerpt"
  },
  "date": "2025-01-14T17:47:35",
  "slug": "test-event",
  "featured_media": 123,
  "categories": [1, 2],
  "tags": [3, 4]
}
```

## Next Steps

1. **Test the REST API** at https://hyyper.co/wp-json/wp/v2/posts
2. **Create some test posts** in WordPress.com admin
3. **Update the Discovery Dial** to use REST API instead of GraphQL
4. **Configure the integration** for WordPress.com

## Alternative: Self-Hosted WordPress

If you need full control, consider:
- **WordPress.org** (self-hosted)
- **Hosting providers** like SiteGround, Bluehost, etc.
- **Full access** to plugins, themes, and custom code

Would you like me to:
1. **Update the Discovery Dial** to use WordPress.com REST API?
2. **Help you set up self-hosted WordPress** for full control?
3. **Show you how to use WordPress.com posts** as events?

Let me know which approach you prefer!
