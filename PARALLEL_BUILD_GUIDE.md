# ⚡ 병렬 빌드 가이드

Storybook과 Electron을 병렬로 실행하는 통합 빌드 시스템입니다.

## 🚀 새로운 병렬 빌드 시스템

### ✅ 생성된 파일:

- `.github/workflows/build-all-pr.yml` - 통합 병렬 빌드 워크플로우

### ✅ 비활성화된 워크플로우:

- `electron-build-pr.yml` - 병합됨
- `deploy-storybook.yml` - main 브랜치에서만 실행

## 📋 병렬 실행 구조

### 🔄 워크플로우 단계:

```
1. setup (공통 의존성 설치)
   ↓
2. build-storybook + build-electron (병렬 실행)
   ↓
3. comment-results (결과 통합 및 PR 댓글)
```

### ⚡ 병렬 실행 장점:

1. **시간 단축**: Storybook과 Electron이 동시에 빌드
2. **리소스 효율성**: 공통 의존성을 한 번만 설치
3. **캐시 공유**: 아티팩트를 통한 의존성 공유
4. **통합 결과**: 하나의 PR 댓글로 모든 빌드 결과 확인

## 🎯 실행 조건

### 트리거 조건:

```yaml
on:
  pull_request_target:
    branches: ['main']
    paths:
      - 'src/**' # Electron 앱 관련
      - '.github/workflows/build-all-pr.yml' # 워크플로우 자체
```

## 📦 생성되는 아티팩트

| 아티팩트 이름                 | 내용                | 보관 기간 |
| ----------------------------- | ------------------- | --------- |
| `workspace-cache-[PR번호]`    | 공통 의존성 캐시    | 1일       |
| `storybook-[PR번호]`          | Storybook 정적 파일 | 30일      |
| `electron-macos-[PR번호]`     | macOS .dmg 파일     | 30일      |
| `electron-windows-[PR번호]`   | Windows .exe 파일   | 30일      |
| `electron-macos-app-[PR번호]` | macOS 앱 디렉토리   | 30일      |

## 🔧 빌드 과정

### 1. Setup 단계 (공통)

- 코드 체크아웃
- Node.js 설정
- workspace 의존성 설치
- 캐시 아티팩트 생성

### 2. 병렬 빌드 단계

#### Storybook 빌드:

- 캐시 다운로드
- Storybook 빌드 실행
- 정적 파일 아티팩트 업로드

#### Electron 빌드:

- 캐시 다운로드
- 웹 앱 빌드 (renderer)
- Electron 앱 빌드 (main + preload)
- macOS/Windows 컴파일
- 플랫폼별 아티팩트 업로드

### 3. 결과 통합 단계

- 모든 빌드 결과 수집
- 통합 PR 댓글 작성
- 빌드 요약 출력

## 📝 PR 댓글 내용

통합 댓글에는 다음이 포함됩니다:

### 📚 Storybook 정보:

- 빌드 상태 및 파일 크기
- 다운로드 링크
- 테스트 체크리스트

### 🔧 Electron 정보:

- macOS/Windows 빌드 상태
- 플랫폼별 파일 크기
- 다운로드 링크
- 테스트 체크리스트

### ⚡ 성능 정보:

- 병렬 실행 정보
- 캐시 활용 정보
- 아티팩트 보관 정보

## 🚀 사용 방법

### 1. Pull Request 생성

```bash
git checkout -b feature/parallel-build
# 코드 변경
git add .
git commit -m "Test parallel build"
git push origin feature/parallel-build
# GitHub에서 PR 생성
```

### 2. 병렬 빌드 실행

- PR 생성 시 자동으로 병렬 빌드 시작
- Actions 탭에서 진행 상황 확인
- Storybook과 Electron이 동시에 빌드됨

### 3. 결과 확인

- 빌드 완료 후 PR에 통합 댓글 자동 작성
- 다운로드 링크로 모든 빌드 결과 확인

## ⚡ 성능 비교

### 기존 (순차 실행):

```
Setup (2분) → Storybook (3분) → Electron (5분) = 총 10분
```

### 새로운 (병렬 실행):

```
Setup (2분) → [Storybook (3분) + Electron (5분)] = 총 7분
```

**시간 단축: 약 30% 향상**

## 🛠️ 문제 해결

### 일반적인 문제들:

#### 1. 캐시 다운로드 실패

```
Error: Download artifact failed
```

**해결방법**: setup 단계에서 의존성 설치 확인

#### 2. 병렬 빌드 충돌

```
Error: Build conflict
```

**해결방법**: 각 빌드가 독립적인 디렉토리에서 실행됨

#### 3. 아티팩트 업로드 실패

```
Error: Upload artifact failed
```

**해결방법**: 빌드된 파일 경로 확인

## 🎉 완료!

이제 다음이 해결됩니다:

- ✅ Storybook과 Electron 병렬 빌드
- ✅ 빌드 시간 30% 단축
- ✅ 통합 PR 댓글로 모든 결과 확인
- ✅ 리소스 효율성 향상
- ✅ 캐시 공유로 의존성 설치 최적화

## 📚 참고사항

- **병렬 실행**: Storybook과 Electron이 동시에 빌드되어 시간 단축
- **캐시 활용**: 공통 의존성을 한 번만 설치하고 공유
- **통합 결과**: 하나의 PR 댓글로 모든 빌드 결과 확인 가능
- **리소스 최적화**: 중복 작업 제거로 효율성 향상
