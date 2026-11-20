import { SearchPanelLayout } from '@/components/search/search-panel-layout';
import { queryClient } from '@/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { AuthWrapper } from '../auth/auth-wrapper';
import { ThemeProvider } from '../theme/theme-provider';
import { Toaster } from '../ui/sonner';

export const Layout = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthWrapper>
        <main>
          <SearchPanelLayout pageLayout>{children}</SearchPanelLayout>
        </main>
      </AuthWrapper>
      <Toaster />
    </ThemeProvider>
  </QueryClientProvider>
);
