# 멀티 테넌트 블로그 SaaS 플랫폼 - 설정 가이드

## 개요

이 가이드는 Clerk 인증과 Supabase 데이터베이스를 사용하여 멀티 테넌트 Noxion 블로그 플랫폼을 설정하는 방법을 안내합니다.

## 사전 요구사항

- Node.js 18+
- pnpm 8+
- Supabase 계정
- Clerk 계정
- Vercel 계정 (배포용)

## 1. 데이터베이스 설정

### Supabase 구성

1. 새로운 Supabase 프로젝트 생성
2. `supabase/migrations/20250709_initial_schema.sql`에 있는 마이그레이션 스크립트 실행
3. 모든 테이블에서 행 수준 보안(RLS) 활성화
4. Supabase 대시보드에서 프로젝트 URL과 익명 키 획득

### 환경 변수

`.env.example`을 `.env.local`로 복사하고 값을 입력합니다:

```bash
# Clerk 인증
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase 구성
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 사이트 구성
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Noxion
NEXT_PUBLIC_SITE_DESCRIPTION=Notion 기반 멀티 테넌트 블로그 플랫폼

# 웹훅 시크릿 (Clerk 대시보드에서)
WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 2. Clerk 설정

### Clerk 애플리케이션 생성

1. [Clerk 대시보드](https://dashboard.clerk.com)로 이동
2. 새 애플리케이션 생성
3. OAuth 제공자 활성화 (Google, GitHub 등)
4. 퍼블리셔블 키와 시크릿 키를 `.env.local`에 복사

### 웹훅 구성

1. Clerk 대시보드에서 웹훅으로 이동
2. 새 웹훅 엔드포인트 생성: `https://your-domain.com/api/webhooks/clerk`
3. `user.created` 이벤트 구독
4. 웹훅 시크릿을 `.env.local`에 복사

### JWT 템플릿 구성

1. Clerk 대시보드에서 JWT 템플릿으로 이동
2. "supabase"라는 새 템플릿 생성
3. 다음 클레임 추가:
```json
{
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}"
}
```

## 3. Supabase RLS 정책

마이그레이션 스크립트에 RLS 정책이 포함되어 있지만, Supabase 대시보드에서 확인할 수 있습니다:

### 사용자 테이블
- 사용자는 자신의 데이터만 볼 수 있음
- 사용자는 자신의 데이터만 업데이트할 수 있음

### 블로그 테이블
- 블로그 소유자는 자신의 블로그를 관리할 수 있음
- 공개된 블로그는 누구나 읽을 수 있음

### 게시물 테이블
- 블로그 소유자는 자신의 게시물을 관리할 수 있음
- 공개된 게시물은 누구나 읽을 수 있음

## 4. 애플리케이션 실행

### 개발 환경

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 프로덕션 빌드

```bash
# 패키지 빌드
pnpm build:packages

# 웹 앱 빌드
pnpm build:web

# 프로덕션 서버 시작
pnpm start
```

## 5. 멀티 테넌트 아키텍처

### 사용자 플로우

1. **회원가입**: 사용자가 Clerk OAuth를 통해 계정 생성
2. **첫 로그인**: 기본 블로그가 자동으로 생성됨
3. **대시보드**: 사용자가 여러 블로그를 관리할 수 있음
4. **공개 접근**: 각 블로그는 `/{username}`에서 접근 가능

### 블로그 구조

- **URL 패턴**: 블로그 홈페이지는 `/{username}`
- **게시물 URL**: `/{username}/posts/{slug}`
- **RSS 피드**: `/{username}/rss.xml`

### 플러그인 시스템

각 블로그는 서로 다른 플러그인을 활성화할 수 있습니다:

1. **분석 플러그인**: 페이지 조회수와 참여도 추적
2. **댓글 플러그인**: 조절 기능이 있는 사용자 댓글
3. **SEO 플러그인**: 메타 태그와 구조화된 데이터

## 6. 데이터베이스 스키마

### 핵심 테이블

- `users`: Clerk ID와 연결된 사용자 프로필
- `blogs`: 개별 블로그 설정
- `posts`: Notion에서 동기화된 블로그 게시물
- `plugins`: 사용 가능한 플러그인 카탈로그
- `blog_plugins`: 블로그별 설치된 플러그인

### 플러그인 테이블

- `comments`: 게시물에 대한 댓글
- `analytics`: 분석 이벤트

## 7. 주요 기능

### 대시보드

- **블로그 관리**: 블로그 생성, 편집, 설정
- **Notion 통합**: Notion 데이터베이스에 연결
- **플러그인 관리**: 플러그인 설치 및 설정
- **분석**: 블로그 성능 보기 (활성화된 경우)

### 공개 블로그

- **동적 라우팅**: 각 사용자가 고유한 블로그 URL을 가짐
- **Notion 동기화**: 게시물이 Notion에서 자동으로 동기화
- **플러그인 확장**: 댓글, 분석, SEO 향상 기능
- **반응형 디자인**: 모바일 친화적인 블로그 레이아웃

## 8. 개발

### 새 플러그인 추가

1. `packages/plugin-{name}`에 새 패키지 생성
2. `NoxionPlugin` 인터페이스 구현
3. Supabase의 plugins 테이블에 추가
4. 플러그인 로더에서 가져오기

### 사용자 정의 도메인

1. blogs 테이블의 `domain` 필드 업데이트
2. 배포 서버를 가리키도록 DNS 설정
3. 사용자 정의 도메인을 처리하도록 미들웨어 업데이트

## 9. 배포

### Vercel 배포

1. 저장소를 Vercel에 연결
2. Vercel 대시보드에서 환경 변수 설정
3. 기존 `vercel.json` 설정을 사용하여 배포

### 데이터베이스 마이그레이션

- 배포 전에 Supabase에서 마이그레이션 실행
- RLS 정책이 올바르게 설정되었는지 확인
- 웹훅 엔드포인트에 접근 가능한지 테스트

## 10. 보안

### 인증

- Clerk가 모든 인증을 처리
- 각 요청마다 JWT 토큰 인증
- 행 수준 보안으로 데이터 격리 강제

### 데이터 보호

- 각 블로그의 데이터는 RLS를 통해 격리
- Notion 토큰은 저장 시 암호화
- 웹훅 서명 검증

## 11. 모니터링

### 분석

- 블로그 조회수와 참여도 추적
- 플러그인 성능 모니터링
- 사용자 활동 대시보드

### 오류 처리

- 포괄적인 오류 로깅
- 실패한 요청에 대한 우아한 대체 처리
- 사용자 친화적인 오류 메시지

## 12. 확장성

### 성능

- 플러그인 시스템은 멀티 테넌시에 최적화
- 데이터베이스 쿼리는 적절한 인덱스 사용
- 공개 블로그 페이지에 대한 정적 생성

### 멀티 리전

- Supabase는 멀티 리전 배포 지원
- 글로벌 성능을 위한 Vercel Edge Functions
- 정적 자산에 대한 CDN

## 지원

문제나 질문이 있을 경우:
- `/docs`의 문서 확인
- 코드베이스 예제 검토
- GitHub에 이슈 오픈

## 라이선스

MIT 라이선스 - 자세한 내용은 LICENSE 파일 참조