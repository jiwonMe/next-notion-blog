# 플러그인 개발 가이드

## 🔌 개요

Noxion의 플러그인 시스템은 코어 코드를 수정하지 않고도 사용자 정의 기능으로 플랫폼을 확장할 수 있게 해줍니다. 플러그인은 UI 컴포넌트, API 라우트, 데이터 변환 등을 추가할 수 있습니다.

## 🚀 빠른 시작

### 1. 플러그인 패키지 생성

```bash
# 새 플러그인 디렉토리 생성
mkdir packages/plugin-myfeature
cd packages/plugin-myfeature

# 패키지 초기화
pnpm init

# 의존성 설치
pnpm add @noxion/types @noxion/core
pnpm add -D typescript tsup
```

### 2. 패키지 구조 설정

```
packages/plugin-myfeature/
├── src/
│   ├── index.ts         # 플러그인 진입점
│   ├── client.ts        # 클라이언트 측 코드
│   ├── server.ts        # 서버 측 코드
│   ├── components/      # React 컴포넌트
│   │   └── MyComponent.tsx
│   └── api/             # API 핸들러
│       └── routes.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

### 3. 플러그인 정의 생성

```typescript
// src/index.ts
import { NoxionPlugin, NoxionCoreContext } from '@noxion/types'
import { MyComponent } from './components/MyComponent'
import { handleApiRoute } from './api/routes'

export interface MyFeatureConfig {
  apiKey?: string
  enableFeatureX?: boolean
}

export function createMyFeaturePlugin(config: MyFeatureConfig = {}): NoxionPlugin {
  return {
    name: 'myfeature',
    version: '1.0.0',
    description: '블로그에 놀라운 기능을 추가합니다',
    author: '귀하의 이름',
    
    register: async (core: NoxionCoreContext) => {
      // React 컴포넌트 등록
      core.registerComponent('MyComponent', MyComponent)
      
      // API 라우트 등록
      core.registerRoute('GET /api/myfeature/data', handleApiRoute)
      
      // 훅 등록
      core.registerHook('afterPostRender', async ({ post }) => {
        // 게시물 데이터 향상
        return {
          ...post,
          myFeatureData: await fetchFeatureData(post.id)
        }
      })
      
      // 웹훅 등록
      core.registerWebhook('myfeature.event', async (data) => {
        // 웹훅 처리
      })
    },
    
    // 선택사항: 클라이언트 측 초기화
    initializeClient: async () => {
      // 클라이언트 측 기능 설정
      if (typeof window !== 'undefined') {
        window.myFeatureGlobal = { config }
      }
    }
  }
}

// 소비자를 위한 타입 내보내기
export * from './types'
```

## 📦 플러그인 아키텍처

### 핵심 개념

1. **플러그인 인터페이스**
   ```typescript
   interface NoxionPlugin {
     name: string
     version: string
     description?: string
     author?: string
     register: (core: NoxionCoreContext) => Promise<void> | void
     initializeClient?: () => Promise<void> | void
   }
   ```

2. **코어 컨텍스트 API**
   ```typescript
   interface NoxionCoreContext {
     // 컴포넌트 등록
     registerComponent(name: string, component: React.ComponentType): void
     getComponent(name: string): React.ComponentType | undefined
     
     // 라우트 등록
     registerRoute(pattern: string, handler: RouteHandler): void
     
     // 훅 등록
     registerHook(name: HookName, handler: HookHandler): void
     executeHook(name: HookName, data: any): Promise<any>
     
     // 데이터 접근
     getPosts(): Promise<Post[]>
     getPost(slug: string): Promise<Post | null>
     
     // 설정
     getConfig(): CoreConfig
     getBlogConfig(): BlogConfig
     
     // 유틸리티
     cache: CacheManager
     logger: Logger
   }
   ```

### 사용 가능한 훅

1. **콘텐츠 훅**
   - `beforePostRender` - 렌더링 전 게시물 데이터 수정
   - `afterPostRender` - 처리 후 게시물 향상
   - `beforePostsQuery` - 데이터베이스 쿼리 수정
   - `afterPostsQuery` - 게시물 목록 변환

2. **페이지 훅**
   - `beforePageRender` - 페이지 props 수정
   - `afterPageRender` - 페이지 향상 기능 추가
   - `onRouteChange` - 라우트 전환 처리

3. **시스템 훅**
   - `onPluginInstall` - 플러그인 설치 시 실행
   - `onPluginUninstall` - 제거 시 정리
   - `onBlogCreate` - 새 블로그 초기화
   - `onBlogDelete` - 블로그 데이터 정리

## 🎨 컴포넌트 생성

### 기본 컴포넌트

```typescript
// src/components/MyComponent.tsx
import React from 'react'
import { usePlugin } from '@noxion/core/hooks'

interface MyComponentProps {
  postId: string
  className?: string
}

export function MyComponent({ postId, className }: MyComponentProps) {
  const { config, data } = usePlugin('myfeature')
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    // 컴포넌트 데이터 로드
    loadData()
  }, [postId])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div className={className}>
      <h3>내 기능 컴포넌트</h3>
      {/* 컴포넌트 콘텐츠 */}
    </div>
  )
}
```

### UI 프리미티브 사용

```typescript
// Noxion의 UI 컴포넌트 사용
import { Button, Card, Input } from '@noxion/core/components/ui'

export function MyFormComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>기능 설정</Card.Title>
      </Card.Header>
      <Card.Content>
        <Input placeholder="값 입력" />
        <Button>저장</Button>
      </Card.Content>
    </Card>
  )
}
```

## 🌐 API 라우트 추가

### 라우트 핸들러

```typescript
// src/api/routes.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function handleApiRoute(
  request: NextRequest,
  { params }: { params: { blogId: string } }
) {
  // 인증 검증
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 데이터베이스 접근
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // 플러그인 데이터 가져오기
  const { data, error } = await supabase
    .from('plugin_myfeature_data')
    .select('*')
    .eq('blog_id', params.blogId)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
```

### 라우트 등록

```typescript
// 플러그인 등록 함수에서
core.registerRoute('GET /api/blogs/:blogId/myfeature', handleGetData)
core.registerRoute('POST /api/blogs/:blogId/myfeature', handlePostData)
core.registerRoute('DELETE /api/blogs/:blogId/myfeature/:id', handleDelete)
```

## 💾 데이터 저장

### 데이터베이스 스키마

```sql
-- 플러그인 전용 테이블 생성
CREATE TABLE plugin_myfeature_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 추가
CREATE POLICY "Blog owners can manage plugin data" ON plugin_myfeature_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blogs 
      WHERE blogs.id = plugin_myfeature_data.blog_id 
      AND blogs.user_id = auth.uid()
    )
  );
```

### Using Plugin Storage

```typescript
// Store plugin data
await core.storage.set(`myfeature:${blogId}:settings`, {
  enabled: true,
  config: { ... }
})

// Retrieve plugin data
const settings = await core.storage.get(`myfeature:${blogId}:settings`)

// Delete plugin data
await core.storage.delete(`myfeature:${blogId}:*`)
```

## 🎯 Best Practices

### 1. Performance

- **Lazy Loading**: Load components only when needed
  ```typescript
  const MyComponent = React.lazy(() => import('./components/MyComponent'))
  ```

- **Caching**: Use the built-in cache manager
  ```typescript
  const cached = await core.cache.get(`myfeature:${postId}`)
  if (!cached) {
    const data = await fetchData()
    await core.cache.set(`myfeature:${postId}`, data, { ttl: 3600 })
  }
  ```

### 2. Security

- **Input Validation**: Always validate user input
  ```typescript
  import { z } from 'zod'
  
  const schema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().max(5000)
  })
  
  const validated = schema.parse(input)
  ```

- **Authentication**: Check user permissions
  ```typescript
  if (!core.canUserAccessBlog(userId, blogId)) {
    throw new Error('Forbidden')
  }
  ```

### 3. Error Handling

```typescript
try {
  await riskyOperation()
} catch (error) {
  core.logger.error('Plugin error:', error)
  
  // Graceful fallback
  return {
    error: 'Feature temporarily unavailable',
    fallback: true
  }
}
```

### 4. TypeScript

```typescript
// Export types for better DX
export interface MyFeatureData {
  id: string
  value: number
  metadata: Record<string, any>
}

// Use generics for flexibility
export function createHandler<T extends MyFeatureData>(): Handler<T> {
  // Implementation
}
```

## 🧪 Testing

### Unit Tests

```typescript
// src/__tests__/plugin.test.ts
import { createMyFeaturePlugin } from '../index'
import { createMockCore } from '@noxion/core/testing'

describe('MyFeature Plugin', () => {
  it('registers components correctly', async () => {
    const plugin = createMyFeaturePlugin()
    const core = createMockCore()
    
    await plugin.register(core)
    
    expect(core.getComponent('MyComponent')).toBeDefined()
  })
})
```

### Integration Tests

```typescript
// Test with real Next.js app
import { render } from '@testing-library/react'
import { PluginProvider } from '@noxion/core/testing'

test('component renders correctly', () => {
  const { getByText } = render(
    <PluginProvider plugins={[myPlugin]}>
      <MyComponent postId="123" />
    </PluginProvider>
  )
  
  expect(getByText('My Feature Component')).toBeInTheDocument()
})
```

## 📄 Package Configuration

### package.json

```json
{
  "name": "@yourname/plugin-myfeature",
  "version": "1.0.0",
  "description": "Amazing feature plugin for Noxion",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "jest"
  },
  "peerDependencies": {
    "@noxion/core": "^1.0.0",
    "@noxion/types": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@noxion/core', '@noxion/types']
})
```

## 🚀 Publishing

1. **Build the plugin**
   ```bash
   pnpm build
   ```

2. **Test locally**
   ```bash
   pnpm link
   # In your blog project
   pnpm link @yourname/plugin-myfeature
   ```

3. **Publish to npm**
   ```bash
   npm publish --access public
   ```

4. **Add to plugin catalog**
   - Submit PR to add your plugin to the official catalog
   - Include documentation and examples

## 📚 Examples

Check out these official plugins for reference:

- **Comments Plugin**: Full-featured commenting system
- **Analytics Plugin**: Page view tracking and metrics
- **SEO Plugin**: Meta tags and structured data

## 🤝 Getting Help

- **Documentation**: Check the full docs at `/docs`
- **Examples**: See `/packages/plugin-*` for examples
- **Community**: Join our Discord server
- **Issues**: Report bugs on GitHub