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