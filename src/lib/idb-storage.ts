import type { PersistStorage, StorageValue } from "zustand/middleware";

const DB_NAME = "budgetwise_db";
const DB_VERSION = 2;
const KV = "kv";
const LEGACY_LS = "idc-finance-v1";

const EXTRA_STORES = [
  "transactions",
  "categories",
  "budgets",
  "settings",
  "goals",
  "profiles",
  "paymentMethods",
  "recurringExpenses",
  "largePurchases",
  "assets",
  "debts",
  "financialTips",
  "calculatorPresets",
  "migrationHistory",
];

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
      for (const name of EXTRA_STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(key: string): Promise<string | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        if (!db) return resolve(null);
        const tx = db.transaction(KV, "readonly");
        const req = tx.objectStore(KV).get(key);
        req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
        req.onerror = () => reject(req.error);
      }),
  );
}

function idbSet(key: string, value: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        if (!db) return resolve();
        const tx = db.transaction(KV, "readwrite");
        tx.objectStore(KV).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

function idbDel(key: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        if (!db) return resolve();
        const tx = db.transaction(KV, "readwrite");
        tx.objectStore(KV).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function kvGet(key: string): Promise<string | null> {
  return idbGet(key);
}

export async function kvSet(key: string, value: string): Promise<void> {
  return idbSet(key, value);
}

export async function kvDel(key: string): Promise<void> {
  return idbDel(key);
}

export function createBudgetWiseStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      try {
        const raw = (await idbGet(name)) ?? (typeof localStorage !== "undefined" ? localStorage.getItem(name) : null);
        if (raw) return JSON.parse(raw) as StorageValue<T>;
        if (typeof localStorage !== "undefined") {
          const legacy = localStorage.getItem(LEGACY_LS);
          if (legacy) return JSON.parse(legacy) as StorageValue<T>;
        }
      } catch {
        return null;
      }
      return null;
    },
    setItem: async (name, value) => {
      const raw = JSON.stringify(value);
      try {
        await idbSet(name, raw);
      } catch {
        /* ignore */
      }
      try {
        localStorage.setItem(name, raw);
      } catch {
        /* ignore */
      }
    },
    removeItem: async (name) => {
      try {
        await idbDel(name);
      } catch {
        /* ignore */
      }
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}
