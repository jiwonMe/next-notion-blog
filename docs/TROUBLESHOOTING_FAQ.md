# 트러블슈팅 및 FAQ

## 📋 목차
1. [일반적인 문제 해결](#일반적인-문제-해결)
2. [개발 환경 문제](#개발-환경-문제)
3. [배포 관련 문제](#배포-관련-문제)
4. [성능 관련 문제](#성능-관련-문제)
5. [보안 관련 문제](#보안-관련-문제)
6. [자주 묻는 질문 (FAQ)](#자주-묻는-질문-faq)
7. [디버깅 가이드](#디버깅-가이드)
8. [지원 요청 방법](#지원-요청-방법)

## 🔧 일반적인 문제 해결

### Notion 연동 문제

#### 문제: Notion API 연결 실패
```bash
Error: NotionClientError: Unauthorized
```

**해결 방법:**
1. **API 키 확인**
   ```bash
   # .env.local 파일 확인
   NOTION_TOKEN=secret_...
   NOTION_DATABASE_ID=...
   ```

2. **권한 확인**
   - Notion에서 해당 페이지/데이터베이스 공유 확인
   - Integration에 적절한 권한 부여 확인

3. **API 키 재생성**
   ```bash
   # Notion Developer Console에서 새 API 키 생성
   # https://www.notion.so/my-integrations
   ```

#### 문제: 데이터베이스 구조 불일치
```bash
Error: Property 'published' does not exist
```

**해결 방법:**
1. **데이터베이스 스키마 확인**
   ```typescript
   // 필요한 속성들이 있는지 확인
   const requiredProperties = [
     'Title',      // 제목 (title)
     'Status',     // 상태 (select)
     'Published',  // 발행일 (date)
     'Slug'        // 슬러그 (rich_text)
   ]
   ```

2. **스키마 마이그레이션 스크립트 실행**
   ```bash
   pnpm run notion:setup-database
   ```

### 인증 관련 문제

#### 문제: Clerk 인증 오류
```bash
Error: ClerkAuthenticationError: Invalid session
```

**해결 방법:**
1. **환경 변수 확인**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

2. **도메인 설정 확인**
   - Clerk Dashboard에서 허용된 도메인 확인
   - localhost:3000이 개발 환경에 추가되어 있는지 확인

3. **세션 초기화**
   ```bash
   # 브라우저 쿠키 및 로컬 스토리지 정리
   # 개발자 도구 > Application > Storage > Clear storage
   ```

#### 문제: Supabase RLS 권한 오류
```bash
Error: new row violates row-level security policy
```

**해결 방법:**
1. **RLS 정책 확인**
   ```sql
   -- Supabase SQL Editor에서 확인
   SELECT * FROM pg_policies WHERE tablename = 'blogs';
   ```

2. **사용자 ID 매핑 확인**
   ```typescript
   // JWT 토큰에서 사용자 ID 확인
   const { userId } = auth()
   console.log('Current user ID:', userId)
   ```

3. **정책 수동 테스트**
   ```sql
   -- 직접 쿼리로 권한 테스트
   SELECT * FROM blogs WHERE user_id = 'current_user_id';
   ```

### 플러그인 관련 문제

#### 문제: 플러그인 로딩 실패
```bash
Error: Plugin 'my-plugin' failed to load
```

**해결 방법:**
1. **플러그인 의존성 확인**
   ```json
   {
     "peerDependencies": {
       "@noxion/core": "^1.0.0",
       "react": "^18.0.0"
     }
   }
   ```

2. **플러그인 등록 확인**
   ```typescript
   // app/layout.tsx
   const plugins = [
     createMyPlugin({ /* config */ })
   ]
   ```

3. **플러그인 빌드 상태 확인**
   ```bash
   # 플러그인 패키지 빌드
   cd packages/plugin-my-feature
   pnpm build
   ```

## 💻 개발 환경 문제

### 설치 및 빌드 문제

#### 문제: pnpm 설치 오류
```bash
Error: Cannot resolve workspace dependencies
```

**해결 방법:**
1. **pnpm 버전 확인 및 업데이트**
   ```bash
   pnpm --version  # 8.0+ 필요
   npm install -g pnpm@latest
   ```

2. **워크스페이스 정리**
   ```bash
   # 모든 node_modules 삭제
   find . -name "node_modules" -type d -exec rm -rf {} +
   
   # 패키지 다시 설치
   pnpm install
   ```

3. **의존성 해결**
   ```bash
   # 의존성 트리 확인
   pnpm list --depth=0
   
   # 중복 의존성 제거
   pnpm dedupe
   ```

#### 문제: TypeScript 컴파일 오류
```bash
Error: Cannot find module '@noxion/types'
```

**해결 방법:**
1. **패키지 빌드 순서 확인**
   ```bash
   # 타입 패키지 먼저 빌드
   pnpm build:packages
   
   # 전체 빌드
   pnpm build
   ```

2. **타입 참조 확인**
   ```typescript
   // tsconfig.json에서 경로 확인
   {
     "compilerOptions": {
       "paths": {
         "@noxion/types": ["./packages/types/src/index.ts"]
       }
     }
   }
   ```

### 개발 서버 문제

#### 문제: 개발 서버 시작 실패
```bash
Error: EADDRINUSE: address already in use :::3000
```

**해결 방법:**
1. **포트 사용 프로세스 확인**
   ```bash
   # macOS/Linux
   lsof -ti:3000
   kill -9 $(lsof -ti:3000)
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **다른 포트 사용**
   ```bash
   pnpm dev -- --port 3001
   ```

#### 문제: Hot Reload가 작동하지 않음

**해결 방법:**
1. **파일 변경 감지 설정**
   ```javascript
   // next.config.js
   const nextConfig = {
     webpack: (config) => {
       config.watchOptions = {
         poll: 1000,
         aggregateTimeout: 300
       }
       return config
     }
   }
   ```

2. **파일 시스템 권한 확인**
   ```bash
   # Docker 환경에서 권한 문제 확인
   ls -la
   chmod -R 755 .
   ```

## 🚀 배포 관련 문제

### Vercel 배포 문제

#### 문제: 빌드 실패
```bash
Error: Build failed with exit code 1
```

**해결 방법:**
1. **로그 자세히 확인**
   ```bash
   # Vercel CLI로 로컬 빌드 테스트
   vercel build
   
   # 상세 로그 확인
   vercel --debug
   ```

2. **환경 변수 확인**
   ```bash
   # Vercel Dashboard에서 환경 변수 확인
   # 또는 CLI로 확인
   vercel env ls
   ```

3. **메모리 제한 해결**
   ```javascript
   // next.config.js
   const nextConfig = {
     experimental: {
       // 메모리 사용량 최적화
       isrMemoryCacheSize: 0
     }
   }
   ```

#### 문제: 환경 변수가 인식되지 않음

**해결 방법:**
1. **환경 변수 범위 확인**
   ```bash
   # 클라이언트 사이드 변수는 NEXT_PUBLIC_ 접두사 필요
   NEXT_PUBLIC_SUPABASE_URL=...
   
   # 서버 사이드 변수
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

2. **배포 환경별 설정**
   ```bash
   vercel env add NOTION_TOKEN production
   vercel env add NOTION_TOKEN preview
   vercel env add NOTION_TOKEN development
   ```

### 도메인 및 DNS 문제

#### 문제: 커스텀 도메인 연결 실패

**해결 방법:**
1. **DNS 설정 확인**
   ```bash
   # DNS 확인
   dig your-domain.com
   nslookup your-domain.com
   ```

2. **Vercel DNS 설정**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **SSL 인증서 확인**
   - Vercel Dashboard에서 SSL 상태 확인
   - 필요시 수동 갱신

## ⚡ 성능 관련 문제

### 느린 로딩 시간

#### 문제: 초기 페이지 로딩이 느림

**진단 방법:**
```bash
# Lighthouse 성능 측정
npx lighthouse https://your-site.com --output=html

# 번들 크기 분석
npx @next/bundle-analyzer
```

**해결 방법:**
1. **이미지 최적화**
   ```typescript
   // 올바른 이미지 사용
   import Image from 'next/image'
   
   <Image
     src="/image.jpg"
     alt="Description"
     width={800}
     height={600}
     priority={true} // 중요한 이미지만
   />
   ```

2. **코드 분할**
   ```typescript
   // 동적 임포트 사용
   const HeavyComponent = dynamic(
     () => import('./HeavyComponent'),
     { loading: () => <Spinner /> }
   )
   ```

3. **불필요한 의존성 제거**
   ```bash
   # 번들 분석으로 큰 라이브러리 확인
   npx webpack-bundle-analyzer .next/static/chunks/*.js
   ```

### 데이터베이스 성능 문제

#### 문제: 쿼리가 느림

**진단 방법:**
```sql
-- Supabase에서 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;
```

**해결 방법:**
1. **인덱스 추가**
   ```sql
   -- 자주 사용되는 쿼리에 인덱스 추가
   CREATE INDEX idx_posts_blog_published 
   ON posts (blog_id, published_at) 
   WHERE status = 'published';
   ```

2. **쿼리 최적화**
   ```typescript
   // N+1 쿼리 방지
   const { data } = await supabase
     .from('blogs')
     .select(`
       *,
       posts(id, title, published_at)
     `)
     .eq('user_id', userId)
   ```

## 🔒 보안 관련 문제

### 인증 보안 문제

#### 문제: 무단 접근 시도 감지

**모니터링:**
```typescript
// lib/security/monitoring.ts
export async function logSuspiciousActivity(
  ip: string, 
  attempt: string
) {
  console.warn(`Suspicious activity from ${ip}: ${attempt}`)
  
  // 보안 로그에 기록
  await supabase
    .from('security_logs')
    .insert({
      ip_address: ip,
      attempt_type: attempt,
      timestamp: new Date()
    })
}
```

**대응 방법:**
1. **IP 차단**
   ```typescript
   // middleware.ts
   const blockedIPs = ['xxx.xxx.xxx.xxx']
   
   if (blockedIPs.includes(request.ip)) {
     return new Response('Forbidden', { status: 403 })
   }
   ```

2. **Rate Limiting 강화**
   ```typescript
   // API 호출 제한 강화
   const rateLimitMap = new Map()
   
   export function rateLimit(ip: string, limit = 10) {
     const now = Date.now()
     const windowStart = now - 60000 // 1분
     
     const requests = rateLimitMap.get(ip) || []
     const recentRequests = requests.filter(time => time > windowStart)
     
     if (recentRequests.length >= limit) {
       throw new Error('Rate limit exceeded')
     }
     
     recentRequests.push(now)
     rateLimitMap.set(ip, recentRequests)
   }
   ```

## ❓ 자주 묻는 질문 (FAQ)

### 일반 사용법

#### Q: Notion 페이지를 블로그 포스트로 어떻게 변환하나요?

**A:** 
1. Notion에서 페이지 생성
2. 페이지를 공개 설정
3. Noxion에서 Notion 데이터베이스 연동
4. 자동으로 동기화됨

```typescript
// 수동 동기화도 가능
await syncNotionPosts(blogId)
```

#### Q: 커스텀 도메인을 어떻게 설정하나요?

**A:**
1. **Vercel에서 도메인 추가**
   ```bash
   vercel domains add your-domain.com
   ```

2. **DNS 설정**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **Noxion에서 도메인 연결**
   - 대시보드 > 블로그 설정 > 커스텀 도메인

#### Q: 플러그인을 어떻게 개발하나요?

**A:** [플러그인 개발 가이드](./PLUGIN_DEVELOPMENT.md) 참조

기본 구조:
```typescript
export function createMyPlugin(): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    register: async (core) => {
      core.registerComponent('MyComponent', MyComponent)
    }
  }
}
```

### 기술적 질문

#### Q: 데이터는 어디에 저장되나요?

**A:**
- **사용자 데이터**: Supabase PostgreSQL
- **콘텐츠**: Notion (원본) + Supabase (캐시)
- **미디어**: Vercel Blob Storage
- **분석 데이터**: Supabase + Vercel Analytics

#### Q: 백업은 어떻게 이루어지나요?

**A:**
- **자동 백업**: 일일 전체 백업, 시간별 증분 백업
- **지역 분산**: 3개 지역에 복제
- **수동 백업**: 대시보드에서 언제든 내보내기 가능

#### Q: 얼마나 많은 트래픽을 처리할 수 있나요?

**A:**
- **동시 사용자**: 10,000+
- **월간 페이지뷰**: 1,000,000+
- **자동 스케일링**: 트래픽에 따라 자동 확장

### 요금 및 제한

#### Q: 무료 플랜의 제한은 무엇인가요?

**A:**
- 블로그 1개
- 월 게시물 10개
- 기본 플러그인만 사용
- 커뮤니티 지원

#### Q: Pro 플랜으로 업그레이드하면 어떤 혜택이 있나요?

**A:**
- 무제한 블로그
- 무제한 게시물
- 모든 플러그인 사용
- 커스텀 도메인
- 우선 지원

### 데이터 관리

#### Q: 계정을 삭제하면 데이터는 어떻게 되나요?

**A:**
- **즉시 삭제**: 개인정보
- **30일 보관**: 콘텐츠 (복구 가능)
- **영구 삭제**: 30일 후 모든 데이터 완전 삭제

#### Q: 데이터를 내보낼 수 있나요?

**A:**
- **전체 내보내기**: JSON 형식으로 모든 데이터
- **선택적 내보내기**: 특정 블로그나 게시물만
- **표준 형식**: WordPress, Ghost 등 가져오기 가능한 형식

## 🔍 디버깅 가이드

### 로그 확인 방법

#### 1. 개발 환경 로그
```bash
# 상세 로그 활성화
DEBUG=* pnpm dev

# 특정 모듈만
DEBUG=noxion:* pnpm dev
```

#### 2. 프로덕션 로그
```bash
# Vercel 로그 확인
vercel logs

# 실시간 로그
vercel logs --follow
```

#### 3. 데이터베이스 로그
```sql
-- Supabase에서 최근 쿼리 확인
SELECT * FROM pg_stat_activity 
WHERE state = 'active';

-- 느린 쿼리 확인
SELECT query, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 성능 프로파일링

#### 1. React Developer Tools
```bash
# React DevTools Profiler 사용
# 1. Chrome Extension 설치
# 2. 개발자 도구 > Profiler 탭
# 3. 레코딩 시작 후 사용자 행동 시뮬레이션
```

#### 2. Network 분석
```bash
# 개발자 도구 > Network 탭에서 확인
# - 느린 요청 식별
# - 큰 리소스 확인
# - 캐시 상태 확인
```

#### 3. Lighthouse 분석
```bash
# 상세 성능 분석
npx lighthouse https://your-site.com \
  --output=html \
  --output-path=./lighthouse-report.html \
  --chrome-flags="--headless"
```

### 에러 추적

#### 1. Sentry 설정
```typescript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  beforeSend(event) {
    // 민감한 정보 필터링
    if (event.exception) {
      const error = event.exception.values?.[0]
      if (error?.value?.includes('password')) {
        return null
      }
    }
    return event
  }
})
```

#### 2. 커스텀 에러 추적
```typescript
// lib/error-tracking.ts
export function trackError(error: Error, context?: any) {
  console.error('Error:', error.message, context)
  
  // Sentry로 전송
  Sentry.captureException(error, {
    extra: context
  })
  
  // 로컬 로그 저장
  if (typeof window !== 'undefined') {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    localStorage.setItem(
      'error-log', 
      JSON.stringify(errorLog)
    )
  }
}
```

### 일반적인 디버깅 체크리스트

#### 🔍 문제 발생 시 확인사항
- [ ] 에러 메시지 전체 내용 확인
- [ ] 브라우저 개발자 도구 콘솔 확인
- [ ] 네트워크 탭에서 실패한 요청 확인
- [ ] 환경 변수 설정 확인
- [ ] 최근 코드 변경사항 확인
- [ ] 의존성 버전 확인
- [ ] 캐시 정리 (브라우저, CDN)

#### 🔧 단계별 디버깅
1. **문제 재현**: 일관된 재현 단계 확인
2. **로그 수집**: 관련된 모든 로그 수집
3. **변수 격리**: 문제 원인 범위 좁히기
4. **가설 수립**: 예상 원인 나열
5. **테스트**: 각 가설 체계적으로 테스트
6. **해결**: 근본 원인 해결
7. **검증**: 해결책 검증 및 회귀 테스트

## 📞 지원 요청 방법

### 지원 채널

#### 1. 커뮤니티 지원 (무료)
- **GitHub Issues**: [https://github.com/noxion/noxion/issues](https://github.com/noxion/noxion/issues)
- **Discord**: [https://discord.gg/noxion](https://discord.gg/noxion)
- **Reddit**: [r/noxion](https://reddit.com/r/noxion)

#### 2. 공식 지원 (Pro/Enterprise)
- **이메일**: support@noxion.co
- **우선 지원**: 24시간 내 응답
- **화상 지원**: 예약 가능

### 효과적인 버그 리포트 작성법

#### 필수 정보
```markdown
## 문제 설명
[문제에 대한 명확한 설명]

## 재현 단계
1. [첫 번째 단계]
2. [두 번째 단계]
3. [세 번째 단계]

## 예상 결과
[예상했던 결과]

## 실제 결과
[실제로 발생한 결과]

## 환경 정보
- OS: [macOS 14.0]
- 브라우저: [Chrome 120.0]
- Node.js: [v20.9.0]
- Noxion 버전: [v1.2.3]

## 추가 정보
- 에러 로그: [전체 에러 메시지]
- 스크린샷: [가능한 경우]
- 재현 가능성: [항상/가끔/한 번만]
```

### 응답 시간 기대치

| 지원 유형 | 초기 응답 | 해결 목표 |
|-----------|-----------|-----------|
| **Critical** | 1시간 | 4시간 |
| **High** | 4시간 | 24시간 |
| **Medium** | 24시간 | 3일 |
| **Low** | 3일 | 1주 |

### 셀프 서비스 리소스

#### 1. 문서
- [개발자 가이드](./PLUGIN_DEVELOPMENT.md)
- [API 참조](./API_REFERENCE.md)
- [배포 가이드](./DEPLOYMENT_INFRASTRUCTURE.md)

#### 2. 예제 및 템플릿
- [플러그인 예제](https://github.com/noxion/plugin-examples)
- [테마 템플릿](https://github.com/noxion/theme-templates)
- [Starter 키트](https://github.com/noxion/starter-kits)

#### 3. 커뮤니티 리소스
- [커뮤니티 플러그인](https://plugins.noxion.co)
- [튜토리얼 블로그](https://blog.noxion.co)
- [YouTube 채널](https://youtube.com/@noxion)

---

*이 트러블슈팅 및 FAQ 문서는 Noxion 사용자들이 겪는 일반적인 문제들과 해결책을 제공합니다. 새로운 문제와 해결책이 발견되면 지속적으로 업데이트됩니다.*