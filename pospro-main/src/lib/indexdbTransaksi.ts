class IndexDBTransaksi {
  private dbName: string = "transaksiDB";
  private storeName: string = "transaksi";
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
          store.createIndex("created_at", "created_at", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("IndexedDB 'transaksiDB' initialized successfully.");
        resolve();
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async create(total: number, items: any[]): Promise<string> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      
      const id = `TRX-${Date.now()}`;
      const transaksi = {
        id,
        total,
        items,
        created_at: new Date().toISOString(),
        is_synced: false
      };

      const store = this.getObjectStore("readwrite");
      const request = store.add(transaksi);
      
      request.onsuccess = () => {
        resolve(id);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAll(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Urutkan terbaru di atas
        const sorted = request.result.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        resolve(sorted);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getById(id: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async count(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.count();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readwrite");
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
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

  async createRaw(transaksi: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readwrite");
      const request = store.put(transaksi);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexdbTransaksi = new IndexDBTransaksi();