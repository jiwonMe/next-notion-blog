# @noxion/plugin-comments

> Full-featured commenting system plugin for Noxion with Supabase backend, nested replies, and moderation.

## Installation

```bash
npm install @noxion/plugin-comments @noxion/core @noxion/types @supabase/supabase-js
# or
pnpm add @noxion/plugin-comments @noxion/core @noxion/types @supabase/supabase-js
# or
yarn add @noxion/plugin-comments @noxion/core @noxion/types @supabase/supabase-js
```

## Quick Start

### 1. Setup Supabase

1. Create a new Supabase project
2. Run the database schema (see [Database Setup](#database-setup))
3. Get your project URL and anon key

### 2. Configure Plugin

```typescript
// apps/web/lib/noxion.ts
import { createDefaultConfig } from '@noxion/core'
import { createCommentsPlugin } from '@noxion/plugin-comments'

const config = createDefaultConfig([
  createCommentsPlugin({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    autoApprove: false,        // Comments require approval
    moderationEnabled: true,   // Enable moderation features
  }),
])
```

### 3. Environment Variables

```bash
# Add to your .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Use Comments Component

The plugin automatically registers the `CommentsSection` component:

```typescript
// In your blog post page
import { getCommentsComponent } from '@/lib/noxion'

export default function PostPage({ post }) {
  const CommentsComponent = getCommentsComponent()
  
  return (
    <article>
      {/* Your post content */}
      
      {CommentsComponent && (
        <CommentsComponent 
          postSlug={post.slug}
          supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
          supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
        />
      )}
    </article>
  )
}
```

## Features

### 💬 **Rich Comments**
- Nested replies (up to 3 levels deep)
- Real-time comment submission
- Author avatars and timestamps
- Rich text support

### 🛡️ **Moderation**
- Comment approval system
- Admin moderation interface
- Spam protection
- Content validation

### 🎨 **UI/UX**
- Responsive design
- Dark/light theme support
- Loading states
- Error handling

### 🚀 **Performance**
- Optimistic updates
- Smart caching
- Pagination support
- Real-time subscriptions (future)

## Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to approved comments
CREATE POLICY "Anyone can view approved comments" ON comments
  FOR SELECT USING (approved = true);

-- Create policy for inserting new comments (public can insert, but they're not approved by default)
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (approved = false);
```

## API Reference

### Plugin Configuration

```typescript
interface CommentsPluginConfig {
  supabaseUrl: string
  supabaseKey: string
  autoApprove?: boolean      // Default: false
  moderationEnabled?: boolean // Default: true
}
```

### CommentsSection Component

```typescript
interface CommentsSectionProps {
  postSlug: string
  supabaseUrl: string
  supabaseKey: string
  className?: string
}
```

### SupabaseCommentsAPI

Direct API class for custom implementations:

```typescript
import { SupabaseCommentsAPI } from '@noxion/plugin-comments'

const api = new SupabaseCommentsAPI(supabaseUrl, supabaseKey)

// Get comments for a post
const result = await api.getComments('my-post-slug')

// Create a new comment
const comment = await api.createComment({
  postSlug: 'my-post-slug',
  author: 'John Doe',
  email: 'john@example.com',
  content: 'Great post!',
  parentId: undefined, // For replies
})

// Admin functions
await api.approveComment(commentId)
await api.deleteComment(commentId)
```

## API Routes

The plugin automatically registers these API routes:

### GET `/api/comments/[slug]`

Get all approved comments for a post.

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": "uuid",
      "postSlug": "my-post",
      "author": "John Doe",
      "email": "john@example.com",
      "content": "Great post!",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "approved": true,
      "parentId": null,
      "replies": []
    }
  ]
}
```

### POST `/api/comments/[slug]`

Create a new comment.

**Request Body:**
```json
{
  "author": "John Doe",
  "email": "john@example.com", 
  "content": "Great post!",
  "parentId": "optional-parent-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "comment": { /* comment object */ },
  "message": "Comment submitted successfully! It will appear after approval."
}
```

### PUT `/api/comments/approve/[id]` 

Approve a comment (admin only).

### DELETE `/api/comments/[id]`

Delete a comment (admin only).

## Customization

### Styling

The component uses Tailwind CSS classes. You can customize the appearance by:

1. **Override Tailwind classes:**
```typescript
<CommentsComponent 
  className="my-custom-comments"
  // ... other props
/>
```

2. **Custom CSS:**
```css
.my-custom-comments {
  /* Your custom styles */
}

.my-custom-comments .comment-item {
  /* Style individual comments */
}
```

### Custom Comment Component

Create your own comment component using the API:

```typescript
import { SupabaseCommentsAPI } from '@noxion/plugin-comments'

function MyCustomComments({ postSlug }) {
  const [comments, setComments] = useState([])
  const api = new SupabaseCommentsAPI(supabaseUrl, supabaseKey)
  
  useEffect(() => {
    api.getComments(postSlug).then(result => {
      if (result.success) {
        setComments(result.comments)
      }
    })
  }, [postSlug])
  
  // Your custom UI
  return <div>{/* Custom comment UI */}</div>
}
```

## Admin Moderation

### Setting up Admin Routes

For admin functionality, you'll need to implement authentication:

```typescript
// Example admin middleware
function withAdminAuth(handler) {
  return async (req, res) => {
    // Verify admin authentication
    const isAdmin = await verifyAdminToken(req)
    if (!isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    return handler(req, res)
  }
}

// Protect admin routes
export default withAdminAuth(async (req, res) => {
  const api = new SupabaseCommentsAPI(supabaseUrl, supabaseKey)
  await api.approveComment(req.query.id)
  res.json({ success: true })
})
```

### Admin Dashboard Example

```typescript
function AdminDashboard() {
  const [pendingComments, setPendingComments] = useState([])
  
  // Fetch pending comments (you'll need to extend the API)
  
  return (
    <div>
      {pendingComments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => approveComment(comment.id)}>
            Approve
          </button>
          <button onClick={() => deleteComment(comment.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type { 
  Comment, 
  CommentFormData, 
  CommentApiResponse 
} from '@noxion/plugin-comments'
```

## Security Considerations

- Comments are **not approved by default** for security
- Email addresses are **not displayed publicly**
- Row Level Security (RLS) is enabled on the database
- Input validation and sanitization
- XSS protection through proper escaping

## Troubleshooting

### Common Issues

1. **Comments not appearing:**
   - Check if comments are approved in your Supabase dashboard
   - Verify RLS policies are correctly set up

2. **API errors:**
   - Ensure environment variables are set correctly
   - Check Supabase project settings and API keys

3. **Styling issues:**
   - Ensure Tailwind CSS is properly configured
   - Check for CSS conflicts

### Debug Mode

Enable debug logging:

```typescript
createCommentsPlugin({
  // ... config
  debug: process.env.NODE_ENV === 'development'
})
```

## License

MIT © [Noxion Team](../../LICENSE)