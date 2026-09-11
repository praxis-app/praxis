import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from './layout';

const useDevServerDisconnected = () => {
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    if (!import.meta.env.DEV || !import.meta.hot) {
      return;
    }

    const handleDisconnect = () => setIsDisconnected(true);
    const handleConnect = () => setIsDisconnected(false);

    import.meta.hot.on('vite:ws:disconnect', handleDisconnect);
    import.meta.hot.on('vite:ws:connect', handleConnect);

    return () => {
      import.meta.hot?.off('vite:ws:disconnect', handleDisconnect);
      import.meta.hot?.off('vite:ws:connect', handleConnect);
    };
  }, []);

  return isDisconnected;
};

export const App = () => {
  const isDevServerDisconnected = useDevServerDisconnected();

  if (isDevServerDisconnected) {
    return (
      <div className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <p className="text-xl font-semibold">Dev server disconnected</p>
          <p className="text-muted-foreground">
            Restart it and this tab will refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
