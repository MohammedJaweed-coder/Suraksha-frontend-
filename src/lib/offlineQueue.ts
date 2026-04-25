import type { OfflinePayload } from '../types';

const DB_NAME = 'kaval-offline-db';
const STORE_NAME = 'offlineQueue';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, handler: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function enqueueOfflinePayload(payload: OfflinePayload): Promise<void> {
  await withStore('readwrite', (store) => store.put(payload));
}

export async function getOfflinePayloads(): Promise<OfflinePayload[]> {
  const result = await withStore<OfflinePayload[]>('readonly', (store) => store.getAll());
  return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function deleteOfflinePayload(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

export async function clearOfflineQueue(): Promise<void> {
  await withStore('readwrite', (store) => store.clear());
}

export async function getOfflineQueueCount(): Promise<number> {
  const payloads = await getOfflinePayloads();
  return payloads.length;
}
