# 프로젝트 구조

## 📁 Noxion 모노레포 아키텍처

```
noxion/
├── 📦 packages/                     # 독립적인 npm 패키지들
│   ├── types/                       # @noxion/types - 공유 TypeScript 타입
│   │   ├── src/
│   │   │   └── index.ts            # 핵심 타입 정의
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                        # @noxion/core - 핵심 기능
│   │   ├── src/
│   │   │   ├── index.ts            # 메인 내보내기
│   │   │   ├── notion.ts           # Notion API 통합
│   │   │   ├── plugin-manager.ts   # 플러그인 시스템 핵심
│   │   │   ├── multi-tenant-plugin-manager.ts  # 멀티 테넌트 확장
│   │   │   ├── cache.ts            # 캐싱 유틸리티
│   │   │   ├── validation.ts       # 입력 검증
│   │   │   ├── error-handling.ts   # 오류 처리
│   │   │   ├── utils.ts            # 유틸리티 함수
│   │   │   └── components/
│   │   │       ├── index.ts
│   │   │       └── markdown-content.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── plugin-comments/             # @noxion/plugin-comments
│   │   ├── src/
│   │   │   ├── index.ts            # 플러그인 진입점
│   │   │   ├── server.ts           # 서버 사이드 로직
│   │   │   ├── client.ts           # 클라이언트 사이드 로직
│   │   │   ├── plugin.ts           # 플러그인 정의
│   │   │   ├── api/
│   │   │   │   ├── routes.ts       # API 라우트 핸들러
│   │   │   │   └── supabase.ts     # Supabase 통합
│   │   │   └── components/
│   │   │       ├── index.ts
│   │   │       └── comments-section.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── plugin-analytics/            # @noxion/plugin-analytics
│   │   ├── src/
│   │   │   └── index.ts            # 분석 플러그인
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── plugin-seo/                  # @noxion/plugin-seo
│       ├── src/
│       │   └── index.ts            # SEO 플러그인
│       ├── package.json
│       └── tsconfig.json
│
├── 🚀 apps/
│   └── web/                         # Next.js 블로그 애플리케이션
│       ├── app/                     # Next.js 14 App Router
│       │   ├── page.tsx            # 플랫폼 홈페이지
│       │   ├── layout.tsx          # 루트 레이아웃
│       │   ├── not-found.tsx       # 404 페이지
│       │   ├── globals.css         # 전역 스타일
│       │   ├── manifest.ts         # PWA 매니페스트
│       │   ├── robots.ts           # SEO 로봇
│       │   ├── sitemap.ts          # 동적 사이트맵
│       │   │
│       │   ├── [username]/         # 사용자 블로그 라우트
│       │   │   ├── page.tsx        # 블로그 홈페이지
│       │   │   └── posts/
│       │   │       ├── page.tsx    # 게시물 목록
│       │   │       └── [slug]/
│       │   │           └── page.tsx # 개별 게시물
│       │   │
│       │   ├── dashboard/          # 사용자 대시보드
│       │   │   ├── layout.tsx      # 대시보드 레이아웃
│       │   │   ├── page.tsx        # 대시보드 홈
│       │   │   └── blogs/
│       │   │       └── [id]/
│       │   │           └── page.tsx # 블로그 설정
│       │   │
│       │   ├── sign-in/            # Clerk 인증
│       │   │   └── [[...sign-in]]/
│       │   │       └── page.tsx
│       │   │
│       │   ├── sign-up/            # Clerk 회원가입
│       │   │   └── [[...sign-up]]/
│       │   │       └── page.tsx
│       │   │
│       │   └── api/                # API 라우트
│       │       ├── webhooks/
│       │       │   └── clerk/
│       │       │       └── route.ts # Clerk 웹훅
│       │       └── dashboard/
│       │           ├── blogs/
│       │           │   ├── route.ts # 블로그 CRUD
│       │           │   └── [id]/
│       │           │       ├── route.ts
│       │           │       ├── test-notion/
│       │           │       │   └── route.ts
│       │           │       └── plugins/
│       │           │           ├── route.ts
│       │           │           └── [pluginId]/
│       │           │               └── route.ts
│       │           └── plugins/
│       │               └── route.ts # 플러그인 카탈로그
│       │
│       ├── components/              # React 컴포넌트
│       │   ├── ui/                 # UI 프리미티브
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   ├── tabs.tsx
│       │   │   └── ... (기타 UI 컴포넌트)
│       │   │
│       │   ├── common/             # 공통 컴포넌트
│       │   │   ├── index.ts
│       │   │   ├── theme-provider.tsx
│       │   │   ├── theme-toggle.tsx
│       │   │   ├── error-boundary.tsx
│       │   │   └── progressive-blur-backdrop.tsx
│       │   │
│       │   ├── layout/             # 레이아웃 컴포넌트
│       │   │   ├── index.ts
│       │   │   ├── footer.tsx
│       │   │   ├── blog-header.tsx
│       │   │   └── platform-header.tsx
│       │   │
│       │   ├── dashboard/          # 대시보드 컴포넌트
│       │   │   ├── blog-card.tsx
│       │   │   ├── create-blog-button.tsx
│       │   │   ├── blog-settings-form.tsx
│       │   │   ├── notion-config-form.tsx
│       │   │   └── plugin-manager.tsx
│       │   │
│       │   └── blog-card.tsx       # 블로그 게시물 카드
│       │
│       ├── lib/                    # 유틸리티 및 설정
│       │   ├── utils.ts            # 일반 유틸리티
│       │   ├── supabase.ts         # Supabase 클라이언트
│       │   ├── validation.ts       # 폼 검증
│       │   ├── cache.ts            # 캐시 유틸리티
│       │   ├── error-handling.ts   # 오류 처리
│       │   ├── og-image.ts         # OG 이미지 생성
│       │   └── performance.ts      # 성능 유틸리티
│       │
│       ├── hooks/                  # 사용자 정의 React 훅
│       │   ├── use-scroll-progress.ts
│       │   └── use-table-of-contents.ts
│       │
│       ├── middleware.ts           # Next.js 미들웨어
│       ├── site.config.ts          # 사이트 설정
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── 📚 docs/                         # 문서
│   ├── PROJECT_STRUCTURE.md        # 이 파일
│   ├── API_REFERENCE.md            # API 문서
│   ├── PLUGIN_DEVELOPMENT.md       # 플러그인 가이드
│   └── MIGRATION-GUIDE.md          # 마이그레이션 가이드
│
├── 🗄️ supabase/
│   └── migrations/
│       └── 20250709_initial_schema.sql  # 데이터베이스 스키마
│
├── 📋 설정 파일
│   ├── package.json                # 루트 package.json
│   ├── pnpm-workspace.yaml         # pnpm 워크스페이스 설정
│   ├── turbo.json                  # Turborepo 설정
│   ├── tsconfig.json               # 루트 TypeScript 설정
│   ├── vercel.json                 # Vercel 배포
│   ├── .gitignore
│   └── .env.example                # 환경 변수 템플릿
│
└── 📖 문서 파일
    ├── README.md                   # 메인 문서
    ├── MULTI_TENANT_SETUP.md       # 멀티 테넌트 가이드
    ├── CONTRIBUTING.md             # 기여 가이드
    ├── CHANGELOG.md                # 버전 히스토리
    ├── CODE_OF_CONDUCT.md          # 커뮤니티 가이드라인
    ├── SECURITY.md                 # 보안 정책
    └── LICENSE                     # MIT 라이선스
```

## 🔧 주요 구성 요소

### 핵심 아키텍처

1. **모노레포 구조**
   - 의존성 관리를 위한 pnpm 워크스페이스 사용
   - 최적화된 빌드와 캐싱을 위한 Turborepo
   - npm에 배포 가능한 독립적인 패키지들

2. **플러그인 시스템**
   - 코어 수정 없이 기능 추가를 가능하게 하는 확장 가능한 아키텍처
   - 플러그인에서 컴포넌트, API 라우트, 훅 등록 가능
   - 블로그별 플러그인 설정을 지원하는 멀티 테넌트 지원

3. **멀티 테넌트 SaaS**
   - 각 사용자가 여러 블로그 생성 가능
   - `/{username}` 라우트에서 블로그 접근 가능
   - Supabase RLS를 사용한 완전한 데이터 격리

### 기술 스택

- **프론트엔드**: Next.js 14 (App Router), React 18, TypeScript
- **스타일링**: Tailwind CSS, Radix UI 컴포넌트
- **인증**: Clerk (OAuth, JWT)
- **데이터베이스**: Supabase (RLS가 적용된 PostgreSQL)
- **CMS**: Notion API 통합
- **빌드**: Turborepo, pnpm, tsup
- **배포**: Vercel 지원

### 데이터 플로우

1. **인증 플로우**
   ```
   사용자 → Clerk OAuth → 웹훅 → Supabase 사용자 생성 → 대시보드 접근
   ```

2. **콘텐츠 플로우**
   ```
   Notion 데이터베이스 → API 동기화 → Supabase 캐시 → Next.js SSG → 공개 블로그
   ```

3. **플러그인 플로우**
   ```
   플러그인 등록 → 블로그 설정 → 런타임 로딩 → 기능 확장
   ```

## 🎯 개발 워크플로우

1. **패키지 개발**
   - `/packages/*`에 독립적인 패키지
   - `pnpm build:packages`로 빌드
   - 개발 중 핫 리로드

2. **플러그인 개발**
   - `/packages/plugin-*`에 새 플러그인 생성
   - `NoxionPlugin` 인터페이스 구현
   - 플러그인 카탈로그에 등록

3. **기능 개발**
   - `/apps/web/app/dashboard`에 대시보드 기능
   - `/apps/web/app/[username]`에 공개 블로그 기능
   - `/apps/web/components`에 공유 컴포넌트

4. **테스트 및 배포**
   - `pnpm type-check`로 타입 검사
   - `pnpm lint`로 린트
   - Vercel 또는 Docker로 배포