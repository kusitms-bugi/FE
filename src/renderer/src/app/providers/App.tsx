import { router } from '@shared/config/router';
import { initGA4, trackPageView } from '@shared/lib/analytics/ga4';
import { LoadingSpinner } from '@shared/ui/loading';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router-dom';

function App() {
  const queryClient = new QueryClient();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    const enabled =
      import.meta.env.PROD || import.meta.env.VITE_GA_ENABLE_IN_DEV === 'true';
    if (!enabled) return;

    initGA4(measurementId, { debug_mode: !import.meta.env.PROD });

    const toPath = (loc: { pathname?: string; search?: string; hash?: string }) =>
      `${loc.pathname ?? ''}${loc.search ?? ''}${loc.hash ?? ''}` || '/';

    const send = (loc: { pathname: string; search: string; hash: string }) => {
      const path = toPath(loc);
      if (lastPathRef.current === path) return;
      lastPathRef.current = path;

      trackPageView({
        page_path: path,
        page_title: document.title,
      });
    };

    // initial
    send(router.state.location);

    // navigation changes
    return router.subscribe((state) => {
      send(state.location);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="flex h-screen w-screen items-center justify-center bg-grey-25">
            <LoadingSpinner size="lg" text="로딩 중..." />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
