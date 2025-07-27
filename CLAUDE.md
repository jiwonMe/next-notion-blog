# Noxion 프로젝트 지침서

## 🌏 문서화 언어 정책

**기본 원칙**: 모든 문서는 한국어로 작성합니다.

### 📝 문서 작성 규칙

#### 1. 주요 문서 (한국어 우선)
- **README.md**: 프로젝트 소개 및 설치 가이드
- **설정 가이드**: MULTI_TENANT_SETUP.md 
- **개발 문서**: 컴포넌트, API, 아키텍처 설명
- **사용자 가이드**: 플러그인 사용법, 블로그 관리

#### 2. 기술 문서 (한국어 + 영어 병기)
- **API 문서**: "인증 (Authentication)", "데이터베이스 (Database)" 
- **코드 주석**: 비즈니스 로직은 한국어, 기술 구현은 영어 허용
- **타입 정의**: 인터페이스 설명은 한국어

#### 3. 개발자 문서
- **기술 스펙**: 한국어로 작성, 필요시 영어 기술 용어 병기
- **아키텍처**: 시스템 설계 설명은 한국어
- **플러그인 개발**: 개발 가이드는 한국어

### 📋 작성 예시

```markdown
# 블로그 관리 API

## 개요
사용자의 블로그를 생성, 수정, 삭제할 수 있는 API입니다.

## 엔드포인트 (Endpoints)

### POST /api/blogs
새로운 블로그를 생성합니다.

**요청 형식 (Request Format)**:
```json
{
  "name": "블로그 이름",
  "username": "사용자명", 
  "description": "블로그 설명"
}
```

**응답 (Response)**:
```json
{
  "success": true,
  "blog": {
    "id": "blog-123",
    "name": "블로그 이름"
  }
}
```
```

### 🔧 기존 문서 변환 가이드

1. **우선순위**: README.md → API 문서 → 사용자 가이드 순으로 변환
2. **점진적 적용**: 새로 작성하는 문서부터 한국어 적용
3. **일관성 유지**: 용어 통일 (예: "플러그인", "대시보드", "설정")

---

# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

searching for articles

*Session: 86df8f0804d8fc05d8d22b332861bd79 | Generated: 2025. 7. 6. 오후 1:29:23*

### Analysis Summary

# Codebase Analysis Report: Article Search and Display

## High-Level Overview

This Next.js application serves as a blog, primarily fetching content from Notion. The core functionality revolves around retrieving blog posts (referred to as "articles" in the query) and rendering them on the frontend. The main components involved are the **Notion API integration** for data fetching, **Next.js pages** for routing and server-side rendering, and **React components** for displaying the articles.

## Mid-Level Component Interaction

### **Data Fetching: Notion Integration**

The application interacts with the Notion API to retrieve blog posts. This is primarily handled by the [lib/notion.ts](lib/notion.ts) module.

*   **Purpose:** Provides functions to interact with the Notion API, specifically to fetch blog posts and individual post details.
*   **Internal Parts:**
    *   `getPosts()`: Fetches a list of all published blog posts.
    *   `getPost(slug: string)`: Fetches a single blog post by its slug.
*   **External Relationships:** Called by Next.js page components (e.g., [app/page.tsx](app/page.tsx) and [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx)) to retrieve article data.

### **Page Rendering: Next.js Pages**

Next.js pages are responsible for fetching data and rendering the appropriate views for articles.

#### **Homepage (Article Listing)**

The main page of the application displays a list of blog posts.

*   **Purpose:** Renders the homepage, showcasing a list of blog posts.
*   **Internal Parts:**
    *   [app/page.tsx](app/page.tsx): The main page component that fetches posts and renders them using the `BlogCard` component.
*   **External Relationships:**
    *   Calls `getPosts()` from [lib/notion.ts](lib/notion.ts) to retrieve all posts.
    *   Utilizes the [components/blog-card.tsx](components/blog-card.tsx) component to display each individual post in the list.

#### **Individual Article Page**

Each blog post has its own dedicated page.

*   **Purpose:** Renders a single blog post based on its slug.
*   **Internal Parts:**
    *   [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx): The dynamic route page component that fetches a specific post and renders its content.
*   **External Relationships:**
    *   Calls `getPost(slug)` from [lib/notion.ts](lib/notion.ts) to retrieve the specific post's data.
    *   Uses the [components/markdown-content.tsx](components/markdown-content.tsx) component to render the rich text content of the post.

### **UI Components: Article Display**

React components are used to structure and display the article content.

#### **Blog Card Component**

Used for displaying a summary of a blog post in a list.

*   **Purpose:** Renders a card-like representation of a blog post, typically used in a list of posts.
*   **Internal Parts:** Displays the post's title, description, and a link to the full article.
*   **External Relationships:** Consumed by [app/page.tsx](app/page.tsx) to render the list of articles. Defined in [components/blog-card.tsx](components/blog-card.tsx).

#### **Markdown Content Component**

Used for rendering the full content of a blog post.

*   **Purpose:** Takes markdown content and renders it as HTML.
*   **Internal Parts:** Processes and displays rich text content.
*   **External Relationships:** Consumed by [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx) to display the main body of an article. Defined in [components/markdown-content.tsx](components/markdown-content.tsx).

## Low-Level Implementation Details

### **`getPosts` Function**

The `getPosts` function in [lib/notion.ts](lib/notion.ts:10) is responsible for querying the Notion database for published posts. It filters by the `published` property and sorts by `Date`.

### **`getPost` Function**

The `getPost` function in [lib/notion.ts](lib/notion.ts:40) retrieves a single post by its slug. It queries the Notion database and then fetches the block content for the specific page.

### **`BlogCard` Component Structure**

The [components/blog-card.tsx](components/blog-card.tsx) component uses UI elements like `Card` and `CardHeader` from [components/ui/card.tsx](components/ui/card.tsx) to structure the display of each article summary.

### **`MarkdownContent` Component Structure**

The [components/markdown-content.tsx](components/markdown-content.tsx) component likely uses a markdown rendering library (though not explicitly shown in the provided file list, it's a common pattern for such a component) to convert Notion's rich text blocks into displayable HTML.

<codebase_context>

# CodeViz Research Context

> **Note**: This file contains research context from ALL active CodeViz sessions.

> **Active Sessions**: 1 research reports

> **Generated**: 2025. 7. 6. 오후 1:30:53

## Research Query

searching for articles

*Session: 86df8f0804d8fc05d8d22b332861bd79 | Generated: 2025. 7. 6. 오후 1:30:53*

### Analysis Summary

# Codebase Analysis Report: Article Search and Display

## High-Level Overview

This Next.js application serves as a blog, primarily fetching content from Notion. The core functionality revolves around retrieving blog posts (referred to as "articles" in the query) and rendering them on the frontend. The main components involved are the **Notion API integration** for data fetching, **Next.js pages** for routing and server-side rendering, and **React components** for displaying the articles.

## Mid-Level Component Interaction

### **Data Fetching: Notion Integration**

The application interacts with the Notion API to retrieve blog posts. This is primarily handled by the [lib/notion.ts](lib/notion.ts) module.

*   **Purpose:** Provides functions to interact with the Notion API, specifically to fetch blog posts and individual post details.
*   **Internal Parts:**
    *   `getPosts()`: Fetches a list of all published blog posts.
    *   `getPost(slug: string)`: Fetches a single blog post by its slug.
*   **External Relationships:** Called by Next.js page components (e.g., [app/page.tsx](app/page.tsx) and [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx)) to retrieve article data.

### **Page Rendering: Next.js Pages**

Next.js pages are responsible for fetching data and rendering the appropriate views for articles.

#### **Homepage (Article Listing)**

The main page of the application displays a list of blog posts.

*   **Purpose:** Renders the homepage, showcasing a list of blog posts.
*   **Internal Parts:**
    *   [app/page.tsx](app/page.tsx): The main page component that fetches posts and renders them using the `BlogCard` component.
*   **External Relationships:**
    *   Calls `getPosts()` from [lib/notion.ts](lib/notion.ts) to retrieve all posts.
    *   Utilizes the [components/blog-card.tsx](components/blog-card.tsx) component to display each individual post in the list.

#### **Individual Article Page**

Each blog post has its own dedicated page.

*   **Purpose:** Renders a single blog post based on its slug.
*   **Internal Parts:**
    *   [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx): The dynamic route page component that fetches a specific post and renders its content.
*   **External Relationships:**
    *   Calls `getPost(slug)` from [lib/notion.ts](lib/notion.ts) to retrieve the specific post's data.
    *   Uses the [components/markdown-content.tsx](components/markdown-content.tsx) component to render the rich text content of the post.

### **UI Components: Article Display**

React components are used to structure and display the article content.

#### **Blog Card Component**

Used for displaying a summary of a blog post in a list.

*   **Purpose:** Renders a card-like representation of a blog post, typically used in a list of posts.
*   **Internal Parts:** Displays the post's title, description, and a link to the full article.
*   **External Relationships:** Consumed by [app/page.tsx](app/page.tsx) to render the list of articles. Defined in [components/blog-card.tsx](components/blog-card.tsx).

#### **Markdown Content Component**

Used for rendering the full content of a blog post.

*   **Purpose:** Takes markdown content and renders it as HTML.
*   **Internal Parts:** Processes and displays rich text content.
*   **External Relationships:** Consumed by [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx) to display the main body of an article. Defined in [components/markdown-content.tsx](components/markdown-content.tsx).

## Low-Level Implementation Details

### **`getPosts` Function**

The `getPosts` function in [lib/notion.ts](lib/notion.ts:10) is responsible for querying the Notion database for published posts. It filters by the `published` property and sorts by `Date`.

### **`getPost` Function**

The `getPost` function in [lib/notion.ts](lib/notion.ts:40) retrieves a single post by its slug. It queries the Notion database and then fetches the block content for the specific page.

### **`BlogCard` Component Structure**

The [components/blog-card.tsx](components/blog-card.tsx) component uses UI elements like `Card` and `CardHeader` from [components/ui/card.tsx](components/ui/card.tsx) to structure the display of each article summary.

### **`MarkdownContent` Component Structure**

The [components/markdown-content.tsx](components/markdown-content.tsx) component likely uses a markdown rendering library (though not explicitly shown in the provided file list, it's a common pattern for such a component) to convert Notion's rich text blocks into displayable HTML.



</codebase_context>