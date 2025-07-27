# API 참조

## 🔧 핵심 API

### @noxion/core

코어 패키지는 블로그 플랫폼의 기본 기능을 제공합니다.

#### Notion 서비스

```typescript
import { NotionService } from '@noxion/core'

// Notion 서비스 초기화
const notion = new NotionService({
  token: process.env.NOTION_TOKEN,
  databaseId: process.env.NOTION_DATABASE_ID
})

// 모든 게시물 가져오기
const posts = await notion.getPosts({
  filter: 'published',
  sort: 'date_desc',
  limit: 10
})

// 슬러그로 단일 게시물 가져오기
const post = await notion.getPost('my-post-slug')

// Notion에서 게시물 동기화
await notion.syncPosts()
```

#### 플러그인 매니저

```typescript
import { PluginManager } from '@noxion/core'

// 플러그인 매니저 초기화
const pluginManager = new PluginManager()

// 플러그인 등록
pluginManager.register(myPlugin)

// 등록된 컴포넌트 가져오기
const Component = pluginManager.getComponent('MyComponent')

// 훅 실행
await pluginManager.executeHook('beforePostRender', { post })
```

#### 멀티 테넌트 플러그인 매니저

```typescript
import { MultiTenantPluginManager } from '@noxion/core'

// 특정 블로그용 초기화
const manager = new MultiTenantPluginManager({
  blogId: 'blog-123',
  userId: 'user-456'
})

// 블로그별 플러그인 로드
await manager.loadBlogPlugins()

// 플러그인 활성화 여부 확인
const isEnabled = await manager.isPluginEnabled('comments')
```

#### 캐시 유틸리티

```typescript
import { cache } from '@noxion/core'

// TTL과 함께 캐시 설정
await cache.set('key', data, { ttl: 3600 })

// 캐시에서 가져오기
const cached = await cache.get('key')

// 캐시 무효화
await cache.invalidate('posts-*')
```

## 🌐 REST API 엔드포인트

### 인증 (Clerk를 통한)

모든 대시보드 엔드포인트는 Authorization 헤더에 Clerk JWT를 통한 인증이 필요합니다.

```
Authorization: Bearer <clerk-jwt-token>
```

### 블로그 관리

#### 사용자 블로그 목록
```http
GET /api/dashboard/blogs
```

Response:
```json
{
  "blogs": [
    {
      "id": "blog-123",
      "username": "johndoe",
      "name": "John's Tech Blog",
      "description": "Writing about web development",
      "notion_database_id": "abc123...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 블로그 생성
```http
POST /api/dashboard/blogs
Content-Type: application/json

{
  "name": "My New Blog",
  "username": "mynewblog",
  "description": "A blog about tech"
}
```

#### 블로그 업데이트
```http
PATCH /api/dashboard/blogs/[id]
Content-Type: application/json

{
  "name": "Updated Blog Name",
  "description": "Updated description",
  "notion_database_id": "new-notion-id",
  "notion_token": "encrypted-token"
}
```

#### 블로그 삭제
```http
DELETE /api/dashboard/blogs/[id]
```

#### Notion 연결 테스트
```http
POST /api/dashboard/blogs/[id]/test-notion
```

Response:
```json
{
  "success": true,
  "message": "Successfully connected to Notion",
  "postsCount": 15
}
```

### 플러그인 관리

#### 사용 가능한 플러그인 목록
```http
GET /api/dashboard/plugins
```

Response:
```json
{
  "plugins": [
    {
      "id": "plugin-comments",
      "name": "Comments",
      "description": "Add commenting functionality",
      "version": "1.0.0",
      "author": "Noxion Team"
    }
  ]
}
```

#### 블로그 플러그인 목록
```http
GET /api/dashboard/blogs/[id]/plugins
```

Response:
```json
{
  "plugins": [
    {
      "id": "blog-plugin-123",
      "plugin_id": "plugin-comments",
      "enabled": true,
      "config": {
        "moderation": true,
        "autoApprove": false
      }
    }
  ]
}
```

#### 플러그인 설치/업데이트
```http
POST /api/dashboard/blogs/[id]/plugins
Content-Type: application/json

{
  "pluginId": "plugin-comments",
  "enabled": true,
  "config": {
    "moderation": true
  }
}
```

#### 플러그인 제거
```http
DELETE /api/dashboard/blogs/[id]/plugins/[pluginId]
```

### 웹훅 엔드포인트

#### Clerk 사용자 동기화
```http
POST /api/webhooks/clerk
Content-Type: application/json
Svix-Signature: <webhook-signature>

{
  "type": "user.created",
  "data": {
    "id": "user_123",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## 🔌 플러그인 API

### 댐글 플러그인 API

#### 게시물 댐글 가져오기
```http
GET /api/blogs/[username]/posts/[slug]/comments
```

Response:
```json
{
  "comments": [
    {
      "id": "comment-123",
      "content": "Great post!",
      "author_name": "Jane Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "replies": []
    }
  ]
}
```

#### 댐글 작성
```http
POST /api/blogs/[username]/posts/[slug]/comments
Content-Type: application/json

{
  "content": "This is my comment",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "parent_id": null
}
```

#### 댐글 조절 (관리자)
```http
PATCH /api/dashboard/blogs/[id]/comments/[commentId]
Content-Type: application/json
Authorization: Bearer <admin-jwt>

{
  "status": "approved" | "rejected"
}
```

### 분석 플러그인 API

#### 페이지 조회 추적
```http
POST /api/blogs/[username]/analytics/pageview
Content-Type: application/json

{
  "path": "/posts/my-post",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0..."
}
```

#### 분석 데이터 가져오기 (대시보드)
```http
GET /api/dashboard/blogs/[id]/analytics
  ?period=7d|30d|90d
  &metric=views|visitors|engagement
```

Response:
```json
{
  "period": "7d",
  "metrics": {
    "totalViews": 1234,
    "uniqueVisitors": 456,
    "avgTimeOnPage": 120,
    "topPosts": [...]
  }
}
```

### SEO 플러그인 API

#### SEO 메타데이터 가져오기
```http
GET /api/blogs/[username]/posts/[slug]/seo
```

Response:
```json
{
  "title": "Post Title | Blog Name",
  "description": "Post excerpt...",
  "openGraph": {
    "title": "Post Title",
    "description": "Post excerpt...",
    "image": "https://..."
  },
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    ...
  }
}
```

## 🔐 인증 및 권한 부여

### Clerk 통합

모든 인증된 엔드포인트는 JWT 검증을 위해 Clerk를 사용합니다:

```typescript
import { auth } from '@clerk/nextjs'

export async function GET(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // 인증된 요청 처리
}
```

### Supabase RLS 정책

데이터베이스 접근은 행 수준 보안으로 보호됩니다:

```sql
-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = clerk_id);

-- 블로그 소유자는 자신의 블로그를 관리할 수 있음
CREATE POLICY "Users can manage own blogs" ON blogs
  FOR ALL USING (user_id = auth.uid());

-- 공개된 콘텐츠는 누구나 읽을 수 있음
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT USING (published = true);
```

## 📡 클라이언트 SDK 사용법

### React 훅

```typescript
// 블로그 데이터 사용
import { useBlog } from '@noxion/core/hooks'

function MyComponent() {
  const { blog, loading, error } = useBlog('username')
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{blog.name}</div>
}
```

### 플러그인 컴포넌트

```typescript
// 플러그인 컴포넌트 사용
import { PluginComponent } from '@noxion/core/components'

function PostPage({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      
      {/* 플러그인 컴포넌트 렌더링 */}
      <PluginComponent name="CommentsSection" props={{ postId: post.id }} />
    </article>
  )
}
```

## 🚦 요청 빈도 제한

API 엔드포인트는 요청 빈도 제한을 구현합니다:

- **공개 엔드포인트**: 60개 요청/분
- **인증 엔드포인트**: 120개 요청/분
- **분석 추적**: 300개 요청/분

Headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## 🔧 오류 처리

모든 API 응답은 일관된 오류 형식을 따릅니다:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "username",
      "reason": "Username already taken"
    }
  }
}
```

일반적인 오류 코드:
- `UNAUTHORIZED` - 인증 누락 또는 잘못된 인증
- `FORBIDDEN` - 권한 부족
- `NOT_FOUND` - 리소스를 찾을 수 없음
- `VALIDATION_ERROR` - 잘못된 입력 데이터
- `RATE_LIMITED` - 너무 많은 요청
- `INTERNAL_ERROR` - 서버 오류

## 📊 웹훅

### 나가는 웹훅

플러그인은 이벤트에 대한 웹훅을 등록할 수 있습니다:

```typescript
// 플러그인에서
core.registerWebhook('post.published', async (data) => {
  await fetch('https://external-api.com/webhook', {
    method: 'POST',
    body: JSON.stringify(data)
  })
})
```

### 웹훅 이벤트

- `post.published` - 새 게시물 발행
- `post.updated` - 게시물 콘텐츠 업데이트
- `comment.created` - 새 댓글 작성
- `plugin.installed` - 블로그에 플러그인 설치
- `blog.created` - 새 블로그 생성