import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './providers/App'
import '../index.css'
import '../shared/lib/i18n/i18n'
import { syncLocaleWithOS } from '../shared/lib/i18n/i18n'

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)

// OS 언어 감지 (localStorage에 사용자 선택값이 없을 때만)
syncLocaleWithOS()
