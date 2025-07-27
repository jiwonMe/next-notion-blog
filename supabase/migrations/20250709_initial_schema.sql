-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  notion_database_id TEXT,
  notion_token TEXT,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  notion_page_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_md TEXT,
  summary TEXT,
  cover_url TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, slug)
);

-- Create plugins table (catalog of available plugins)
CREATE TABLE IF NOT EXISTS plugins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  author TEXT,
  package_url TEXT,
  config_schema JSONB DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_plugins table (installed plugins per blog)
CREATE TABLE IF NOT EXISTS blog_plugins (
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  installed_version TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (blog_id, plugin_id)
);

-- Create comments table (for comments plugin)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table (for analytics plugin)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  post_slug TEXT,
  event_type TEXT NOT NULL, -- 'page_view', 'post_view', 'search', etc.
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_blogs_owner_id ON blogs(owner_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_posts_blog_id ON posts(blog_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(blog_id, slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, published_at);
CREATE INDEX IF NOT EXISTS idx_comments_blog_post ON comments(blog_id, post_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_blog_id ON analytics(blog_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type, created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_plugins_updated_at BEFORE UPDATE ON blog_plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- Blog owners can manage their blogs
CREATE POLICY "Blog owners can manage their blogs" ON blogs
  FOR ALL USING (
    owner_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Public can read published blogs
CREATE POLICY "Public can read published blogs" ON blogs
  FOR SELECT USING (true);

-- Blog owners can manage their posts
CREATE POLICY "Blog owners can manage their posts" ON posts
  FOR ALL USING (
    blog_id IN (
      SELECT b.id FROM blogs b
      JOIN users u ON b.owner_id = u.id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Public can read published posts
CREATE POLICY "Public can read published posts" ON posts
  FOR SELECT USING (published = true);

-- Blog owners can manage their plugins
CREATE POLICY "Blog owners can manage their plugins" ON blog_plugins
  FOR ALL USING (
    blog_id IN (
      SELECT b.id FROM blogs b
      JOIN users u ON b.owner_id = u.id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Comments policies
CREATE POLICY "Public can read approved comments" ON comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can create comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Blog owners can manage comments" ON comments
  FOR ALL USING (
    blog_id IN (
      SELECT b.id FROM blogs b
      JOIN users u ON b.owner_id = u.id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Analytics policies
CREATE POLICY "Blog owners can view their analytics" ON analytics
  FOR SELECT USING (
    blog_id IN (
      SELECT b.id FROM blogs b
      JOIN users u ON b.owner_id = u.id
      WHERE u.clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Anyone can create analytics events" ON analytics
  FOR INSERT WITH CHECK (true);

-- Insert default plugins
INSERT INTO plugins (name, version, description, author, package_url) VALUES
  ('analytics', '1.0.0', 'Basic analytics tracking for blog views and engagement', 'Noxion Team', '@noxion/plugin-analytics'),
  ('comments', '1.0.0', 'Comment system with moderation and reply support', 'Noxion Team', '@noxion/plugin-comments'),
  ('seo', '1.0.0', 'SEO optimization with meta tags and structured data', 'Noxion Team', '@noxion/plugin-seo')
ON CONFLICT (name) DO NOTHING;