/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ✅ IndexedDB Service untuk Manajemen Kategori Produk
 * User bisa menambah kategori baru, dan dropdown kategori
 * akan menggunakan data dari sini (bukan hardcoded).
 */

class IndexDBCategory {
  private dbName: string = "categoryDB";
  private storeName: string = "categories";
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
          const store = db.createObjectStore(this.storeName, { keyPath: "name" });
          store.createIndex("name", "name", { unique: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error("IndexedDB categoryDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database kategori belum diinisialisasi.");
    }
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  /**
   * Ambil semua kategori, diurutkan secara alfabetis.
   */
  async getAll(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      try {
        const store = this.getObjectStore("readonly");
        const request = store.getAll();
        request.onsuccess = () => {
          const data: { name: string }[] = request.result || [];
          // ✅ Default categories selalu disertakan
          const defaults = ['Makanan', 'Minuman', 'Elektronik', 'Alat Tulis', 'Umum'];
          const customNames = data.map((c: any) => c.name || c);
          const merged = [...new Set([...defaults, ...customNames])].sort();
          resolve(merged);
        };
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Tambah kategori baru (jika belum ada).
   */
  async add(name: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const trimmed = name.trim();
      if (!trimmed) {
        resolve(false);
        return;
      }
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.put({ name: trimmed });
        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          // Jika duplicate key, anggap gagal
          if (request.error?.name === 'ConstraintError') {
            resolve(false);
          } else {
            reject(request.error);
          }
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Hapus kategori (hanya custom, tidak bisa hapus default).
   */
  async delete(name: string): Promise<boolean> {
    const defaults = ['Makanan', 'Minuman', 'Elektronik', 'Alat Tulis', 'Umum'];
    if (defaults.includes(name)) {
      return false; // Tidak bisa hapus default
    }
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      try {
        const store = this.getObjectStore("readwrite");
        const request = store.delete(name);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export const indexdbCategory = new IndexDBCategory();