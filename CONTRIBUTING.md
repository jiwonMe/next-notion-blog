# Contributing to Noxion

Thank you for your interest in contributing to Noxion! This guide will help you get started with contributing to this Next.js + Notion blog platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0.0 or higher
- pnpm (recommended) or npm
- Git
- A Notion account with a database set up for testing

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/noxion.git
   cd noxion
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/noxion.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Set up your Notion integration:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create a new integration
   - Copy the integration token
   - Create a test database and share it with your integration
   - Copy the database ID from the URL

3. Update `.env.local` with your credentials:
   ```bash
   NOTION_TOKEN=your_integration_token
   NOTION_DATABASE_ID=your_database_id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=Noxion Dev
   ```

### 3. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

Understanding the codebase structure will help you contribute effectively:

```
noxion/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage
│   ├── globals.css       # Global styles
│   ├── about/            # Static pages
│   └── posts/[slug]/     # Dynamic blog routes
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── blog-card.tsx     # Blog post cards
│   ├── header.tsx        # Site header
│   ├── footer.tsx        # Site footer
│   └── theme-*.tsx       # Theme-related components
├── lib/                  # Core utilities
│   ├── notion.ts         # Notion API integration
│   └── utils.ts          # Utility functions
├── types/                # TypeScript definitions
│   └── notion.ts         # Notion-specific types
└── Configuration files   # Config files (tailwind, next, etc.)
```

### Key Files to Understand

- **`lib/notion.ts`**: Core Notion integration and API functions
- **`types/notion.ts`**: TypeScript interfaces for Notion data
- **`app/page.tsx`**: Homepage with hero section and blog list
- **`app/posts/[slug]/page.tsx`**: Dynamic blog post pages
- **`components/ui/`**: Reusable UI components from shadcn/ui

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict type checking

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint --fix

# Check TypeScript
pnpm type-check
```

### Naming Conventions

- **Files**: Use kebab-case for file names (`blog-card.tsx`)
- **Components**: Use PascalCase (`BlogCard`)
- **Functions**: Use camelCase (`getDatabasePages`)
- **Constants**: Use UPPER_SNAKE_CASE (`NOTION_TOKEN`)

### Component Guidelines

1. **Functional Components**: Use functional components with hooks
2. **Props Interface**: Define props interface for each component
3. **Error Boundaries**: Handle errors gracefully
4. **Accessibility**: Include proper ARIA labels and semantic HTML

Example component structure:
```typescript
interface BlogCardProps {
  post: BlogPost
  className?: string
}

export function BlogCard({ post, className }: BlogCardProps) {
  return (
    <article className={cn("card", className)}>
      {/* Component content */}
    </article>
  )
}
```

### CSS and Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use CSS custom properties for theming
- Ensure responsive design (mobile-first)
- Support both light and dark modes

## Making Changes

### Branch Naming

Create descriptive branch names:
- `feature/add-search-functionality`
- `fix/notion-api-error-handling`
- `docs/update-setup-guide`
- `refactor/simplify-blog-card`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

feat(notion): add support for custom property names
fix(ui): resolve dark mode toggle issue
docs(readme): update installation instructions
refactor(components): simplify blog card component
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `style`: Code style changes
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

### Development Workflow

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, documented code
   - Follow existing patterns and conventions
   - Add or update tests if necessary

3. **Test your changes**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

### Manual Testing

Before submitting a PR, manually test:

1. **Homepage**: Verify blog posts load correctly
2. **Individual Posts**: Check post pages render properly
3. **Navigation**: Test header navigation and theme toggle
4. **Responsive Design**: Test on different screen sizes
5. **Dark Mode**: Verify theme switching works
6. **Error States**: Test with missing environment variables

### Build Testing

Ensure the application builds successfully:
```bash
pnpm build
pnpm start
```

### Type Checking

Verify TypeScript compilation:
```bash
pnpm type-check
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run final checks**:
   ```bash
   pnpm lint
   pnpm type-check
   pnpm build
   ```

3. **Update documentation** if needed

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Build passes
- [ ] TypeScript checks pass
- [ ] Responsive design verified

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as such)
```

### Review Process

1. **Automated Checks**: Ensure all CI checks pass
2. **Code Review**: Address any feedback from maintainers
3. **Testing**: Verify changes work as expected
4. **Documentation**: Update docs if necessary

## Issue Guidelines

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Alternatives considered

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Focus on constructive feedback
- Respect different viewpoints
- Help maintain a positive environment

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## Getting Help

### Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: [Join our community](https://discord.gg/your-invite) (if available)

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Notion API Reference](https://developers.notion.com/reference)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Recognition

We appreciate all contributors! Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given appropriate credit in commits

## Questions?

Don't hesitate to ask questions by:
- Opening an issue
- Starting a discussion
- Reaching out on Discord

Thank you for contributing to Noxion! 🎉