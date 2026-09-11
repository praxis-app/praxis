export const subscribeToBrowserResume = (callback: () => void) => {
  let callbackTimeout: number | undefined;
  const runWhenActive = () => {
    if (document.visibilityState !== 'visible' || !navigator.onLine) {
      return;
    }
    window.clearTimeout(callbackTimeout);
    callbackTimeout = window.setTimeout(callback, 0);
  };

  document.addEventListener('visibilitychange', runWhenActive);
  window.addEventListener('online', runWhenActive);
  window.addEventListener('focus', runWhenActive);
  return () => {
    window.clearTimeout(callbackTimeout);
    document.removeEventListener('visibilitychange', runWhenActive);
    window.removeEventListener('online', runWhenActive);
    window.removeEventListener('focus', runWhenActive);
  };
};
