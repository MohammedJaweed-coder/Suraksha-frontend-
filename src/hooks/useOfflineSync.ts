import { useCallback, useEffect, useState } from 'react';
import i18n from '../i18n';
import { clearOfflineQueue, getOfflinePayloads, getOfflineQueueCount } from '../lib/offlineQueue';
import { syncOfflineQueue } from '../lib/sync.api';
import { useIncidentStore } from '../store/incident.store';

export function useOfflineSync(): {
  pendingCount: number;
  isSyncing: boolean;
  flushQueue: () => Promise<void>;
} {
  const [pendingCount, setPendingCount] = useState(0);
  const isSyncing = useIncidentStore((state) => state.isSyncing);
  const pushToast = useIncidentStore((state) => state.pushToast);
  const clearPendingSync = useIncidentStore((state) => state.clearPendingSync);
  const setSyncing = useIncidentStore((state) => state.setSyncing);

  const refreshPendingCount = useCallback(async () => {
    setPendingCount(await getOfflineQueueCount());
  }, []);

  const flushQueue = useCallback(async () => {
    const payloads = await getOfflinePayloads();
    if (payloads.length === 0) {
      setPendingCount(0);
      return;
    }

    try {
      setSyncing(true);
      const result = await syncOfflineQueue(payloads);
      await clearOfflineQueue();
      clearPendingSync(result.syncedIds);
      pushToast({
        id: crypto.randomUUID(),
        variant: 'success',
        message: i18n.t('offline.sync_success')
      });
      setPendingCount(0);
    } catch {
      pushToast({
        id: crypto.randomUUID(),
        variant: 'error',
        message: i18n.t('offline.sync_failed')
      });
      await refreshPendingCount();
    } finally {
      setSyncing(false);
    }
  }, [clearPendingSync, pushToast, refreshPendingCount, setSyncing]);

  useEffect(() => {
    void refreshPendingCount();

    const handleOnline = () => {
      void flushQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [flushQueue, refreshPendingCount]);

  return {
    pendingCount,
    isSyncing,
    flushQueue
  };
}
