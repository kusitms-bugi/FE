## 📁 프로젝트 구조

```
src/
├── main/         # Electron Main Process
├── preload/      # Electron Preload Script
└── renderer/     # Electron Renderer Process (React)
    └── src/
        ├── packages/
        │   ├── api/    # API 관련 로직 및 훅
        │   └── ui/     # UI 컴포넌트 및 스타일
        ├── pages/      # 페이지 컴포넌트
        ├── components/ # 공통 컴포넌트
        └── ...
```

## 📍 Git Commit Convention

## 1. Branch Naming Rule

**Branch 이름**은 **작업 목적과 연관된 이슈 번호를 포함하는 방식**

```php
<타입>/<이슈 번호>-<간단한 설명>

- feature/1234-add-user-login
- bugfix/5678-fix-login-error
- release/1.2.0
```

### Branch Type

- **feature/ - 새로운 기능 개발 시**
- **bugfix/ -** **버그 수정** 시
- **hotfix/ -** **긴급한 버그 수정** 시 (보통 프로덕션 환경에서 발생)
- **release/ -** **릴리즈 준비 시**
- **chore/ -** 빌드 및 기타 작업 자동화, 문서 작업 등 **코드와 관련 없는 작업**

---

## 🔧 API 패키지에 새로운 기능 추가하기

### 1. 새로운 API 엔드포인트 추가

#### 1.1 타입 정의 추가

```typescript
// packages/api/src/types/index.ts
export interface NewFeatureResponse {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
```

#### 1.2 API 클라이언트 메서드 추가

```typescript
// packages/api/src/client/api-client.ts
export class ElectronAPIClient {
  // 기존 메서드들...

  async getNewFeature(id: string): Promise<NewFeatureResponse> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.getNewFeature(id);
    }
    throw new Error('Electron API not available');
  }
}

export class WebAPIClient {
  // 기존 메서드들...

  async getNewFeature(id: string): Promise<NewFeatureResponse> {
    const response = await fetch(`${this.baseURL}/new-feature/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch new feature');
    }
    return await response.json();
  }
}
```

#### 1.3 React Query 훅 추가

```typescript
// packages/api/src/hooks/use-new-feature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAPIClient } from '../../index';
import { NewFeatureResponse } from '../types';

let apiClient: ReturnType<typeof createAPIClient> | null = null;

function getApiClient() {
  if (!apiClient) {
    apiClient = createAPIClient();
  }
  return apiClient;
}

// 조회 훅
export function useNewFeature(id: string) {
  return useQuery({
    queryKey: ['newFeature', id],
    queryFn: () => getApiClient().getNewFeature(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
  });
}

// 생성/수정/삭제 뮤테이션 훅
export function useNewFeatureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NewFeatureResponse>) =>
      getApiClient().createNewFeature(data),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['newFeature'] });
    },
  });
}
```

#### 1.4 훅 익스포트 추가

```typescript
// packages/api/src/hooks/index.ts
export * from './use-new-feature';
// 기존 익스포트들...
```

#### 1.5 메인 익스포트 업데이트

```typescript
// packages/api/index.ts
// 기존 익스포트들...
export * from './src/hooks/use-new-feature';
```

### 2. 새로운 유틸리티 함수 추가

#### 2.1 유틸리티 함수 작성

```typescript
// packages/api/src/utils/new-feature-utils.ts
export function formatNewFeatureName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export function validateNewFeatureData(data: any): boolean {
  return data && typeof data.name === 'string' && data.name.length > 0;
}
```

#### 2.2 유틸리티 익스포트 추가

```typescript
// packages/api/src/utils/index.ts
export * from './new-feature-utils';
// 기존 익스포트들...
```

## 🎨 UI 패키지에 새로운 컴포넌트 추가하기

### 1. 새로운 컴포넌트 생성

#### 1.1 컴포넌트 디렉토리 생성

```
packages/ui/src/components/NewComponent/
├── NewComponent.tsx
├── NewComponent.css (선택사항)
└── index.ts (선택사항)
```

#### 1.2 컴포넌트 구현

```typescript
// packages/ui/src/components/NewComponent/NewComponent.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface NewComponentProps {
  title: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function NewComponent({
  title,
  description,
  variant = 'default',
  size = 'md',
  className,
  children,
}: NewComponentProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        {
          'bg-white border-gray-200': variant === 'default',
          'bg-blue-50 border-blue-200': variant === 'primary',
          'bg-gray-50 border-gray-300': variant === 'secondary',
          'p-2 text-sm': size === 'sm',
          'p-4 text-base': size === 'md',
          'p-6 text-lg': size === 'lg',
        },
        className
      )}
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      {children}
    </div>
  );
}
```

#### 1.3 컴포넌트 익스포트 추가

```typescript
// packages/ui/src/components/NewComponent/index.ts
export { NewComponent } from './NewComponent';
```

### 2. Storybook 스토리 추가

#### 2.1 스토리 파일 생성

```typescript
// packages/ui/src/stories/NewComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NewComponent } from '../components/NewComponent/NewComponent';

const meta: Meta<typeof NewComponent> = {
  title: 'Components/NewComponent',
  component: NewComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '기본 컴포넌트',
    description: '이것은 기본 컴포넌트입니다.',
  },
};

export const Primary: Story = {
  args: {
    title: 'Primary 컴포넌트',
    description: '이것은 Primary 스타일의 컴포넌트입니다.',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    title: 'Large 컴포넌트',
    description: '이것은 Large 크기의 컴포넌트입니다.',
    size: 'lg',
  },
};
```

### 3. 패키지 익스포트 업데이트

#### 3.1 메인 익스포트 추가

```typescript
// packages/ui/index.tsx
import './src/styles/globals.css';

export * from './src/components/Button/Button';
export * from './src/components/Header/Header';
export * from './src/components/Page/Page';
export * from './src/components/Alert/Alert';
export * from './src/components/AnimatedBox/AnimatedBox';
export * from './src/components/NewComponent/NewComponent'; // 새로 추가
```

#### 3.2 package.json exports 업데이트

```json
// packages/ui/package.json
{
  "exports": {
    ".": "./index.tsx",
    "./tokens.css": "./src/styles/tokens.css",
    "./globals.css": "./src/styles/globals.css",
    "./theme.css": "./src/styles/theme.css",
    "./Button": "./src/components/Button/Button.tsx",
    "./AnimatedBox": "./src/components/AnimatedBox/AnimatedBox.tsx",
    "./Header": "./src/components/Header/Header.tsx",
    "./Page": "./src/components/Page/Page.tsx",
    "./Alert": "./src/components/Alert/Alert.tsx",
    "./NewComponent": "./src/components/NewComponent/NewComponent.tsx"
  }
}
```

## 🧪 테스트 추가하기

### API 패키지 테스트

```typescript
// packages/api/src/hooks/__tests__/use-new-feature.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNewFeature } from '../use-new-feature';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useNewFeature', () => {
  it('should fetch new feature data', async () => {
    const { result } = renderHook(() => useNewFeature('test-id'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### UI 패키지 테스트

```typescript
// packages/ui/src/components/NewComponent/__tests__/NewComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('renders with title', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <NewComponent
        title="Test Title"
        description="Test Description"
      />
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
```

## 📝 개발 워크플로우

### 1. 개발 시작

```bash
# 프로젝트 의존성 설치
npm install

# Electron 개발 서버 시작
npm run dev
```

### 2. 새 기능 개발

1. **API 패키지**: 타입 정의 → API 클라이언트 → React Query 훅 → 익스포트
2. **UI 패키지**: 컴포넌트 구현 → Storybook 스토리 → 익스포트 → 테스트

### 3. 코드 품질 관리

```bash
# 타입 체크
npm run typecheck

# 린팅
npm run lint

# 포맷팅
npm run format

# 테스트
npm run test
```

## 🔄 패키지 간 의존성

### API 패키지 사용법

```typescript
// src/renderer/src/App.tsx
import { useHealth, useVersion, createAPIClient } from 'api';

function App() {
  const { data: health } = useHealth();
  const { data: version } = useVersion();

  return (
    <div>
      <p>Health: {health?.status}</p>
      <p>Version: {version?.version}</p>
    </div>
  );
}
```

### UI 패키지 사용법

```typescript
// src/renderer/src/App.tsx
import { Button, Header, Page, NewComponent } from 'ui';
import 'ui/globals.css';

function App() {
  return (
    <Page>
      <Header title="My App" />
      <NewComponent
        title="Welcome"
        description="This is a new component"
        variant="primary"
      />
      <Button>Click me</Button>
    </Page>
  );
}
```

## 🚀 배포 및 빌드

### 패키지 빌드

```bash
# 전체 프로젝트 빌드
npm run build

# 특정 패키지만 빌드
cd packages/api && npm run typecheck
cd packages/ui && npm run build-storybook
```

### Electron 앱 빌드

```bash
npm run build
```
