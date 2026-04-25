import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineSync } from '../hooks/useOfflineSync';

export function OfflineBanner(): JSX.Element {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'offline' | 'online' | 'hidden'>(navigator.onLine ? 'hidden' : 'offline');
  useOfflineSync();

  useEffect(() => {
    const handleOffline = () => setStatus('offline');
    const handleOnline = () => {
      setStatus('online');
      window.setTimeout(() => setStatus('hidden'), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {status !== 'hidden' ? (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className={`sticky top-0 z-50 px-4 py-3 text-sm font-semibold text-white ${status === 'offline' ? 'bg-amber-500' : 'bg-success'}`}
        >
          <div className="mx-auto max-w-6xl">{status === 'offline' ? `⚡ ${t('offline.banner')}` : `✓ ${t('offline.back_online')}`}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
