import { useEffect } from 'react';

export function usePush() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub),
      });
    });
  }, []);
}

function urlBase64ToUint8Array(base64: string) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const data = atob(base64.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from([...data].map((c) => c.charCodeAt(0)));
}
