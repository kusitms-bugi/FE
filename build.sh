#!/bin/bash

# Web 앱 빌드 스크립트
echo "🚀 Starting web app build process..."

# output 디렉토리 생성
mkdir -p output

# 웹 앱 빌드
echo "📦 Building web app..."
cd apps/web
npm ci
npm run build

# 빌드 결과를 output으로 복사
echo "📋 Copying build artifacts..."
cp -r dist/* ../../output/

# Electron 앱 빌드는 제외 (web 앱만 빌드)

# 빌드 정보 생성
echo "📝 Creating build info..."
cd ../..
cat > output/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "commit": "$(git rev-parse HEAD)",
  "branch": "$(git rev-parse --abbrev-ref HEAD)",
  "version": "$(node -p "require('./package.json').version")",
  "app": "web"
}
EOF

echo "✅ Web app build completed successfully!"
echo "📁 Output directory contents:"
ls -la output/
