/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ✅ IndexedDB Service untuk Data Supplier
 * Menyimpan data pemasok barang secara offline
 */

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  contactPerson: string;
  npwp: string;           // ✅ Nomor Pokok Wajib Pajak
  notes: string;
  productCount: number;
  totalPurchases: number;
  created_at: number;
  updated_at: number;
}

class IndexDBSupplier {
  private dbName: string = "supplierDB";
  private storeName: string = "suppliers";
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("phone", "phone", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error("IndexedDB supplierDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database supplier not initialized.");
    }
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async getAll(): Promise<Supplier[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      try {
        const store = this.getObjectStore("readonly");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  async getById(id: string): Promise<Supplier | undefined> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save(supplier: Supplier): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      if (!supplier.id) {
        reject(new Error("Supplier id is required"));
        return;
      }
      const store = this.getObjectStore("readwrite");
      const request = store.put({
        ...supplier,
        updated_at: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readwrite");
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async search(query: string): Promise<Supplier[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.getAll();
      request.onsuccess = () => {
        const q = query.toLowerCase().trim();
        const results = (request.result || []).filter(
          (s: Supplier) =>
            s.name?.toLowerCase().includes(q) ||
            s.phone?.includes(query) ||
            s.npwp?.includes(query) ||
            s.contactPerson?.toLowerCase().includes(q) ||
            s.address?.toLowerCase().includes(q)
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readwrite");
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexdbSupplier = new IndexDBSupplier();