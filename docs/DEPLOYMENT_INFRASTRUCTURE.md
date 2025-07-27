# 배포 및 인프라 명세서

## 📋 목차
1. [인프라 개요](#인프라-개요)
2. [배포 아키텍처](#배포-아키텍처)
3. [환경 구성](#환경-구성)
4. [CI/CD 파이프라인](#cicd-파이프라인)
5. [모니터링 및 로깅](#모니터링-및-로깅)
6. [확장성 전략](#확장성-전략)
7. [재해 복구](#재해-복구)
8. [운영 가이드](#운영-가이드)

## 🏗️ 인프라 개요

### 클라우드 아키텍처

**주요 선택 이유**:
- **Vercel**: Next.js 최적화, 전역 CDN, 자동 스케일링
- **Supabase**: 관리형 PostgreSQL, 실시간 기능, RLS 지원
- **Clerk**: 전문 인증 서비스, 다양한 OAuth 제공자
- **Cloudflare**: DNS 관리, DDoS 보호, 추가 CDN

### 인프라 구성 요소

```mermaid
graph TB
    subgraph "글로벌 엣지"
        CF[Cloudflare]
        VERCEL_CDN[Vercel Edge Network]
    end
    
    subgraph "애플리케이션 레이어"
        VERCEL[Vercel Functions]
        NEXTJS[Next.js App]
    end
    
    subgraph "데이터베이스"
        SUPABASE[Supabase]
        REDIS[Redis Cache]
    end
    
    subgraph "외부 서비스"
        CLERK[Clerk Auth]
        NOTION[Notion API]
        MONITORING[모니터링]
    end
    
    CF --> VERCEL_CDN
    VERCEL_CDN --> VERCEL
    VERCEL --> NEXTJS
    NEXTJS --> SUPABASE
    NEXTJS --> REDIS
    NEXTJS --> CLERK
    NEXTJS --> NOTION
    NEXTJS --> MONITORING
```

### 기술 스택 매핑

| 계층 | 기술 | 목적 | 대안 |
|------|------|------|------|
| **CDN** | Vercel Edge + Cloudflare | 전역 컨텐츠 배포 | AWS CloudFront |
| **컴퓨팅** | Vercel Serverless | 서버리스 실행 | AWS Lambda |
| **데이터베이스** | Supabase PostgreSQL | 관계형 데이터 | AWS RDS |
| **캐시** | Redis Cloud | 인메모리 캐싱 | AWS ElastiCache |
| **인증** | Clerk | 사용자 관리 | Auth0, Firebase Auth |
| **DNS** | Cloudflare | 도메인 관리 | Route53 |
| **모니터링** | Vercel Analytics + Sentry | 성능 및 오류 추적 | DataDog |

## 🌐 배포 아키텍처

### 환경별 배포 전략

#### 1. 개발 환경 (Development)
```yaml
development:
  domain: "dev.noxion.co"
  deployment: "git push → 자동 배포"
  features:
    - hot_reloading: true
    - debug_mode: true
    - test_data: enabled
  resources:
    vercel_functions: unlimited
    database: development_instance
    cache: shared_redis
```

#### 2. 스테이징 환경 (Staging)
```yaml
staging:
  domain: "staging.noxion.co"
  deployment: "PR merge → main → 자동 배포"
  features:
    - production_like: true
    - test_workflows: enabled
    - performance_testing: enabled
  resources:
    vercel_functions: pro_tier
    database: staging_instance
    cache: dedicated_redis
```

#### 3. 프로덕션 환경 (Production)
```yaml
production:
  domain: "noxion.co"
  deployment: "manual trigger + approval"
  features:
    - high_availability: true
    - monitoring: comprehensive
    - backup: automated
  resources:
    vercel_functions: enterprise_tier
    database: production_cluster
    cache: redis_cluster
```

### 배포 방식

#### 1. Blue-Green 배포
```typescript
interface BlueGreenDeployment {
  strategy: 'blue-green'
  
  phases: {
    preparation: {
      steps: [
        'Build new version',
        'Deploy to staging slot',
        'Run integration tests',
        'Warm up environment'
      ]
    }
    
    switch: {
      steps: [
        'Update DNS routing',
        'Monitor health checks',
        'Verify traffic routing',
        'Complete switch'
      ]
    }
    
    cleanup: {
      steps: [
        'Monitor for 30 minutes',
        'Decommission old version',
        'Clean up resources'
      ]
    }
  }
  
  rollback: {
    trigger: 'automatic on failure'
    time_limit: '5 minutes'
    conditions: ['error_rate > 1%', 'response_time > 2s']
  }
}
```

#### 2. 카나리 배포
```typescript
interface CanaryDeployment {
  strategy: 'canary'
  
  stages: [
    { traffic_percentage: 5, duration: '10m' },
    { traffic_percentage: 25, duration: '30m' },
    { traffic_percentage: 50, duration: '60m' },
    { traffic_percentage: 100, duration: 'complete' }
  ]
  
  success_criteria: {
    error_rate: '<0.5%'
    response_time: '<1s'
    user_feedback: 'positive'
  }
  
  automated_rollback: {
    enabled: true
    threshold: {
      error_rate: '>1%'
      response_time: '>2s'
    }
  }
}
```

## ⚙️ 환경 구성

### 환경 변수 관리

#### 1. 필수 환경 변수
```bash
# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=https://noxion.co
NODE_ENV=production

# 데이터베이스
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 인증
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Notion 통합
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret

# 캐싱
REDIS_URL=redis://username:password@host:port

# 모니터링
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# 웹훅 보안
WEBHOOK_SECRET=your-webhook-secret
```

#### 2. 환경별 설정

```typescript
// lib/config.ts
interface EnvironmentConfig {
  app: {
    url: string
    env: 'development' | 'staging' | 'production'
  }
  
  database: {
    url: string
    poolSize: number
    ssl: boolean
  }
  
  cache: {
    url: string
    ttl: {
      posts: number
      blogs: number
      users: number
    }
  }
  
  features: {
    debugging: boolean
    analytics: boolean
    experimentalFeatures: boolean
  }
}

export const config: EnvironmentConfig = {
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NODE_ENV as any
  },
  
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    ssl: process.env.NODE_ENV === 'production'
  },
  
  cache: {
    url: process.env.REDIS_URL!,
    ttl: {
      posts: 300,      // 5분
      blogs: 3600,     // 1시간
      users: 86400     // 24시간
    }
  },
  
  features: {
    debugging: process.env.NODE_ENV !== 'production',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    experimentalFeatures: process.env.EXPERIMENTAL_FEATURES === 'true'
  }
}
```

### 보안 설정

#### 1. 환경 변수 암호화
```bash
# Vercel CLI를 사용한 환경 변수 설정
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NOTION_CLIENT_SECRET production

# GitHub Secrets 설정 (CI/CD용)
VERCEL_TOKEN=your-vercel-token
SUPABASE_ACCESS_TOKEN=your-supabase-token
```

#### 2. 네트워크 보안
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD 파이프라인

### GitHub Actions 워크플로우

#### 1. 메인 파이프라인
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build packages
        run: pnpm build:packages
      
      - name: Build application
        run: pnpm build

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./apps/web

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./apps/web
```

#### 2. 데이터베이스 마이그레이션
```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run migrations
        run: |
          pnpm run migrate:${{ github.event.inputs.environment }}
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

#### 3. 보안 스캔
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * *'  # 매일 오전 2시
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Upload result to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: snyk.sarif
```

### 배포 스크립트

#### 1. 로컬 배포 스크립트
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying to $ENVIRONMENT..."

# 의존성 설치
echo "📦 Installing dependencies..."
pnpm install

# 타입 체크
echo "🔍 Type checking..."
pnpm type-check

# 린트
echo "🧹 Linting..."
pnpm lint

# 테스트
echo "🧪 Running tests..."
pnpm test

# 빌드
echo "🏗️ Building..."
pnpm build

# 배포
echo "🌐 Deploying..."
if [ "$ENVIRONMENT" = "production" ]; then
  vercel --prod
else
  vercel
fi

echo "✅ Deployment completed!"
```

#### 2. 데이터베이스 마이그레이션 스크립트
```bash
#!/bin/bash
# scripts/migrate.sh

ENVIRONMENT=${1:-development}
DATABASE_URL=${2:-$DATABASE_URL}

echo "🗄️ Running migrations for $ENVIRONMENT..."

# 마이그레이션 실행
supabase db push --db-url "$DATABASE_URL"

# 시드 데이터 (개발 환경만)
if [ "$ENVIRONMENT" = "development" ]; then
  echo "🌱 Seeding development data..."
  supabase db seed --db-url "$DATABASE_URL"
fi

echo "✅ Migration completed!"
```

## 📊 모니터링 및 로깅

### 애플리케이션 모니터링

#### 1. Vercel Analytics 설정
```typescript
// lib/analytics.ts
import { Analytics } from '@vercel/analytics/react'

export function VercelAnalytics() {
  return <Analytics />
}

// 커스텀 이벤트 추적
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', name, properties)
  }
}
```

#### 2. Sentry 오류 추적
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event) {
    // 민감한 정보 필터링
    if (event.request?.headers) {
      delete event.request.headers.authorization
      delete event.request.headers.cookie
    }
    return event
  }
})
```

#### 3. 성능 메트릭
```typescript
// lib/metrics.ts
interface PerformanceMetrics {
  webVitals: {
    fcp: number  // First Contentful Paint
    lcp: number  // Largest Contentful Paint
    fid: number  // First Input Delay
    cls: number  // Cumulative Layout Shift
  }
  
  apiMetrics: {
    responseTime: number
    errorRate: number
    throughput: number
  }
  
  businessMetrics: {
    activeUsers: number
    postsCreated: number
    blogsCreated: number
  }
}

export function collectMetrics(): PerformanceMetrics {
  // 메트릭 수집 로직
}
```

### 로깅 전략

#### 1. 구조화된 로깅
```typescript
// lib/logger.ts
import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

// 사용 예시
logger.info('User created blog', {
  userId: '123',
  blogId: '456',
  blogTitle: 'My Blog'
})
```

#### 2. 감사 로깅
```typescript
// lib/audit.ts
interface AuditLog {
  userId: string
  action: string
  resource: string
  resourceId: string
  metadata: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
}

export async function auditLog(log: AuditLog) {
  await supabase
    .from('audit_logs')
    .insert(log)
}
```

### 알림 및 대시보드

#### 1. 알림 설정
```yaml
alerts:
  error_rate:
    condition: "error_rate > 1%"
    duration: "5m"
    channels: ["slack", "email"]
  
  response_time:
    condition: "avg_response_time > 2s"
    duration: "10m"
    channels: ["slack"]
  
  downtime:
    condition: "uptime < 99%"
    duration: "1m"
    channels: ["slack", "sms", "email"]
```

#### 2. 대시보드 구성
```typescript
interface DashboardMetrics {
  systemHealth: {
    uptime: string
    responseTime: number
    errorRate: number
    throughput: number
  }
  
  businessMetrics: {
    totalUsers: number
    activeUsers: number
    totalBlogs: number
    totalPosts: number
  }
  
  infrastructure: {
    cpuUsage: number
    memoryUsage: number
    dbConnections: number
    cacheHitRate: number
  }
}
```

## 📈 확장성 전략

### 수평 확장

#### 1. 서버리스 스케일링
```typescript
// vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "regions": ["icn1", "hnd1", "pdx1"],
  "framework": "nextjs"
}
```

#### 2. 데이터베이스 확장
```yaml
database_scaling:
  read_replicas:
    - region: "asia-northeast-1"
      tier: "db-r5.large"
    - region: "us-west-2" 
      tier: "db-r5.large"
  
  connection_pooling:
    max_connections: 100
    pool_mode: "transaction"
  
  caching:
    strategy: "redis_cluster"
    ttl_policies:
      posts: "5m"
      blogs: "1h"
      users: "24h"
```

### 성능 최적화

#### 1. CDN 설정
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  async headers() {
    return [
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

#### 2. 캐싱 전략
```typescript
// lib/cache.ts
interface CacheConfig {
  redis: {
    url: string
    keyPrefix: 'noxion:'
    defaultTTL: 3600
  }
  
  strategies: {
    posts: {
      ttl: 300  // 5분
      tags: ['posts']
    }
    
    blogs: {
      ttl: 3600  // 1시간
      tags: ['blogs']
    }
    
    static: {
      ttl: 86400  // 24시간
      tags: ['static']
    }
  }
}
```

## 🔥 재해 복구

### 백업 전략

#### 1. 자동 백업
```yaml
backup_strategy:
  database:
    frequency: "hourly"
    retention: "30 days"
    encryption: true
    locations: ["primary", "dr_region"]
  
  static_assets:
    frequency: "daily"
    retention: "90 days"
    versioning: true
  
  configuration:
    frequency: "on_change"
    retention: "indefinite"
    version_control: true
```

#### 2. 복구 절차
```bash
#!/bin/bash
# scripts/disaster-recovery.sh

RECOVERY_TYPE=${1:-partial}
BACKUP_DATE=${2:-latest}

case $RECOVERY_TYPE in
  "full")
    echo "🔥 Starting full system recovery..."
    restore_database "$BACKUP_DATE"
    restore_static_assets "$BACKUP_DATE"
    restore_configuration "$BACKUP_DATE"
    ;;
  
  "database")
    echo "🗄️ Restoring database only..."
    restore_database "$BACKUP_DATE"
    ;;
  
  "partial")
    echo "⚡ Starting partial recovery..."
    restore_critical_data "$BACKUP_DATE"
    ;;
esac
```

### RTO/RPO 목표

```yaml
sla_targets:
  rto: "4 hours"     # Recovery Time Objective
  rpo: "1 hour"      # Recovery Point Objective
  
  service_levels:
    critical: "99.9%"  # 8.7시간/년 다운타임
    important: "99.5%" # 43.8시간/년 다운타임
    normal: "99.0%"    # 87.7시간/년 다운타임
```

## 🔧 운영 가이드

### 일상 운영 작업

#### 1. 모니터링 체크리스트
```markdown
## 일일 체크리스트
- [ ] 시스템 상태 확인 (Uptime, Response Time)
- [ ] 에러율 모니터링 (< 1% 목표)
- [ ] 데이터베이스 성능 확인
- [ ] 캐시 히트율 확인 (> 90% 목표)
- [ ] 백업 상태 확인

## 주간 체크리스트
- [ ] 보안 업데이트 확인
- [ ] 의존성 취약점 스캔
- [ ] 용량 계획 검토
- [ ] 비용 최적화 검토

## 월간 체크리스트
- [ ] 재해 복구 테스트
- [ ] 성능 벤치마크
- [ ] 보안 감사
- [ ] 아키텍처 리뷰
```

#### 2. 트러블슈팅 가이드
```typescript
interface TroubleshootingGuide {
  performance_issues: {
    symptoms: ["Slow response times", "High CPU usage"]
    checks: [
      "Check database query performance",
      "Review cache hit rates",
      "Analyze function execution times"
    ]
    solutions: [
      "Optimize database queries",
      "Increase cache TTL",
      "Scale up functions"
    ]
  }
  
  availability_issues: {
    symptoms: ["502 errors", "Connection timeouts"]
    checks: [
      "Check function health",
      "Verify database connectivity", 
      "Review DNS resolution"
    ]
    solutions: [
      "Restart functions",
      "Scale database connections",
      "Update DNS settings"
    ]
  }
}
```

### 용량 계획

#### 1. 리소스 모니터링
```typescript
interface CapacityMetrics {
  compute: {
    functionInvocations: number
    executionDuration: number
    memoryUsage: number
  }
  
  storage: {
    databaseSize: number
    backupSize: number
    staticAssets: number
  }
  
  network: {
    bandwidth: number
    requests: number
    dataTransfer: number
  }
}
```

#### 2. 확장 임계점
```yaml
scaling_thresholds:
  database:
    connections: 80  # 80% of max connections
    cpu: 70         # 70% CPU usage
    memory: 80      # 80% memory usage
  
  functions:
    concurrent_executions: 1000
    duration: 25s   # 25s of 30s max
    memory: 80      # 80% of allocated memory
  
  cache:
    memory_usage: 75  # 75% of available memory
    eviction_rate: 5  # 5% eviction rate
```

---

*이 배포 및 인프라 명세서는 Noxion 프로젝트의 운영 환경과 배포 전략을 상세히 정의합니다. 시스템 성장에 따라 지속적으로 업데이트됩니다.*