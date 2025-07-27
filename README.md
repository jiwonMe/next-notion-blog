# Noxion - 플러그인 기반 블로그 플랫폼

> Notion과 Next.js 14를 기반으로 한 현대적이고 확장 가능한 블로그 플랫폼입니다. 강력한 플러그인 시스템을 갖춘 모노레포 구조로 구축되었습니다.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Notion](https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white)](https://notion.so/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

## ✨ 주요 기능

### 🏗️ **모노레포 아키텍처**
- **독립적인 패키지**: 코어, 플러그인, 타입을 별도 npm 패키지로 배포 가능
- **pnpm 워크스페이스**: 효율적인 의존성 관리 및 빌드 캐싱
- **Turborepo**: 지능형 캐싱을 통한 최적화된 빌드 시스템

### 🔌 **플러그인 시스템**
- **확장 가능한 아키텍처**: 코어 코드 수정 없이 플러그인으로 기능 추가
- **React 컴포넌트 등록**: 플러그인에서 UI 컴포넌트 제공 가능
- **API 라우트 처리**: 플러그인에서 사용자 정의 API 엔드포인트 등록
- **훅 시스템**: 데이터 변환 및 기능 향상을 위한 라이프사이클 훅

### 📝 **콘텐츠 관리**
- **Notion 통합**: Notion을 CMS로 사용하며 전체 API 지원
- **마크다운 렌더링**: 구문 강조, 수학 공식 등을 포함한 풍부한 콘텐츠
- **캐싱 시스템**: 최적의 성능을 위한 스마트 캐싱
- **정적 생성**: ISR을 지원하는 완전한 SSG

### 🎨 **현대적인 UI/UX**
- **반응형 디자인**: Tailwind CSS를 활용한 모바일 우선 설계
- **다크/라이트 테마**: 내장된 테마 전환 기능
- **로딩 상태**: 스켈레톤 로더 및 부드러운 전환 효과
- **SEO 최적화**: 메타 태그, Open Graph, 구조화된 데이터

## 🏃 빠른 시작

### 사전 요구사항

- Node.js 18+
- pnpm 8+
- API 접근이 가능한 Notion 계정

### 1. 클론 및 설치

```bash
git clone https://github.com/your-username/noxion.git
cd noxion
pnpm install
```

### 2. 환경 설정

```bash
# 환경 변수 템플릿 복사
cp apps/web/.env.example apps/web/.env.local

# 환경 변수 설정
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id

# 선택사항: 댓글 플러그인용
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 빌드 및 실행

```bash
# 모든 패키지 빌드
pnpm build:packages

# 개발 서버 시작
pnpm dev

# 또는 프로덕션 빌드
pnpm build
pnpm start
```

## 📦 패키지 구조

```
noxion/
├── packages/                     # 독립적인 npm 패키지들
│   ├── types/                    # @noxion/types - 공유 TypeScript 타입
│   ├── core/                     # @noxion/core - 핵심 기능
│   └── plugin-comments/          # @noxion/plugin-comments - 댓글 플러그인
├── apps/
│   └── web/                      # Next.js 블로그 애플리케이션
├── docs/                         # 문서
└── examples/                     # 예제 설정
```

### 패키지 상세 설명

#### `@noxion/types`
모든 패키지에서 사용하는 핵심 TypeScript 인터페이스 및 타입 정의

#### `@noxion/core`
- 캐싱 기능이 포함된 Notion API 통합
- 플러그인 관리 시스템
- 마크다운 렌더링 컴포넌트
- 오류 처리 유틸리티
- 유효성 검사 및 데이터 정제

#### `@noxion/plugin-comments`
다음 기능을 포함한 완전한 댓글 시스템:
- Supabase 백엔드 통합
- 중첩 답글 지원
- 관리자 조절 기능
- 실시간 업데이트

## 🔌 플러그인 개발

### 플러그인 생성

```typescript
import { NoxionPlugin, NoxionCoreContext } from '@noxion/types'

export function createMyPlugin(config: MyPluginConfig): NoxionPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    register: (core: NoxionCoreContext) => {
      // 컴포넌트 등록
      core.registerComponent('MyComponent', MyComponent)
      
      // API 라우트 등록
      core.registerRoute('GET /api/my-route', handleMyRoute)
      
      // 훅 등록
      core.registerHook('afterPostRender', enhancePost)
    }
  }
}
```

### 플러그인 API 참조

#### 코어 컨텍스트 메서드

- `registerComponent(name, component)` - React 컴포넌트 등록
- `registerRoute(path, handler)` - API 라우트 핸들러 등록
- `registerHook(hookName, handler)` - 라이프사이클 훅 등록
- `getConfig()` - 전역 설정 접근
- `getPosts()` - 모든 게시물 가져오기
- `getPost(slug)` - 특정 게시물 가져오기

#### 사용 가능한 훅

- `beforePostRender` - 렌더링 전 게시물 변환
- `afterPostRender` - 처리 후 게시물 향상
- `beforePostsQuery` - 게시물 쿼리 수정
- `afterPostsQuery` - 게시물 목록 변환

## 🚀 배포

### Vercel (권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### 정적 사이트 내보내기

```bash
# 정적 사이트 빌드
pnpm build
pnpm export

# ./apps/web/out/ 폴더를 정적 호스팅 서비스에 배포
```

## ⚙️ 설정

### 플러그인 설정

```typescript
// apps/web/lib/noxion.ts
import { createDefaultConfig } from '@noxion/core'
import { createCommentsPlugin } from '@noxion/plugin-comments'

const config = createDefaultConfig([
  createCommentsPlugin({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    autoApprove: false,
    moderationEnabled: true,
  }),
  // 여기에 더 많은 플러그인 추가
])
```

### 사이트 설정

```typescript
// apps/web/site.config.ts
export const siteConfig = {
  name: '내 블로그',
  description: '블로그 설명',
  url: 'https://yourblog.com',
  author: {
    name: '작성자 이름',
    email: 'your@email.com',
  },
  social: {
    twitter: '@yourusername',
    github: 'https://github.com/yourusername',
  },
}
```

## 🧪 개발

### 스크립트

```bash
# 개발
pnpm dev                  # 개발 서버 시작
pnpm build:packages      # 모든 패키지 빌드
pnpm build               # 전체 빌드
pnpm type-check          # 타입 검사
pnpm lint                # 모든 패키지 린트
pnpm clean               # 모든 빌드 출력 정리

# 배포 (관리자 전용)
pnpm changeset           # 변경사항 생성
pnpm version-packages    # 패키지 버전 관리
pnpm release             # npm에 배포
```

### 테스트

```bash
# 테스트 실행
pnpm test

# 감시 모드
pnpm test:watch

# 커버리지
pnpm test:coverage
```

## 📚 문서

- [플러그인 개발 가이드](./docs/plugin-development.md)
- [API 참조](./docs/api-reference.md)
- [배포 가이드](./docs/deployment.md)
- [기여 가이드라인](./CONTRIBUTING.md)

## 🤝 기여하기

기여를 환영합니다! 자세한 내용은 [기여 가이드라인](./CONTRIBUTING.md)을 참조해주세요.

### 개발 환경 설정

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다
3. 변경사항을 적용합니다
4. 해당되는 경우 테스트를 추가합니다
5. 풀 리퀘스트를 제출합니다

## 📄 라이선스

MIT © [Noxion Team](./LICENSE)

## 🙏 감사의 말

- 놀라운 API를 제공해준 [Notion](https://notion.so/)
- 훌륭한 프레임워크를 제공해준 [Next.js](https://nextjs.org/)
- 유틸리티 우선 스타일링을 제공해준 [Tailwind CSS](https://tailwindcss.com/)
- 백엔드 인프라를 제공해준 [Supabase](https://supabase.io/)

---

<div align="center">
  <sub>Noxion 팀이 ❤️로 만들었습니다</sub>
</div>