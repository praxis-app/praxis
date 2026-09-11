import { SearchPanelLayout } from '@/components/search/search-panel-layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { AuthWrapper } from '../auth/auth-wrapper';
import { ThemeProvider } from '../theme/theme-provider';
import { Toaster } from '../ui/sonner';

const queryClient = new QueryClient();

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
