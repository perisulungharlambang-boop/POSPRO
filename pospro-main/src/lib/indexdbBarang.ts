import defaultData from "../services/db/DefaultData.json";

class IndexDBBarang {
  private dbName: string = "barangDB";
  private storeName: string = "barang";
  private db: IDBDatabase | null = null;

  private initPromise: Promise<void> | null = null;
  private seedPromise: Promise<void> | null = null;

  constructor() {
    // ✅ Tidak blocking di constructor — init & seed dilakukan lazy saat dibutuhkan
  }

  private initDb(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("IndexedDB 'barangDB' initialized successfully.");
        resolve();
        
        // ✅ Seed data secara non-blocking setelah koneksi berhasil
        // Hanya akan jalan jika database kosong (via count() check di dalam)
        this.seedData();
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
    
    return this.initPromise;
  }

  private async seedData(): Promise<void> {
    if (this.seedPromise) return this.seedPromise;
    
    this.seedPromise = (async () => {
      try {
        // ✅ Gunakan count() bukan getAllBarang() — jauh lebih cepat
        const total = await this.count();
        if (total > 0 || !defaultData.data.products) {
          return;
        }
        
        console.log("Seeding initial data for barang...");
        
        // ✅ INSERT MASSAL dengan satu transaction (bulk add)
        await this.initDb();
        if (!this.db) return;
        
        const products = defaultData.data.products;
        
        // Batch: 500 produk per transaksi agar tidak memblokir terlalu lama
        const BATCH_SIZE = 500;
        for (let i = 0; i < products.length; i += BATCH_SIZE) {
          const batch = products.slice(i, i + BATCH_SIZE);
          
          await new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            
            for (const product of batch) {
              const p = product as any;
              const sku = (p.sku || p.barcode || '').toString().trim();
              const uniqueSuffix = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
              const id = p.id || (sku ? `prod_${sku.toLowerCase().replace(/[^a-z0-9\-_]/g, ".")}` : `prod_no_sku_${uniqueSuffix}`);
              
              const mappedProduct = {
                id,
                name: p.name || '',
                sku,
                barcode: p.barcode || sku,
                category: p.category || 'Umum',
                priceRetail: p.priceRetail || p.price || 0,
                priceWholesale: p.priceWholesale || p.wholesale_price || 0,
                priceCost: p.priceCost || p.cost_price || p.capitalPrice || 0,
                stock: p.stock || 0,
                min_stock: p.min_stock || 0,
                supplierId: p.supplierId || '',
                supplierName: p.supplierName || '',
                created_at: p.created_at || Date.now(),
                updated_at: p.updated_at || Date.now()
              };
              store.add(mappedProduct);
            }
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
          });
          
          // ✅ Yield ke event loop agar UI tidak freeze
          await new Promise(r => setTimeout(r, 0));
        }
        
        console.log(`✅ Seed ${products.length} produk selesai dalam batch`);
      } catch (error) {
        console.error("Error seeding data:", error);
        this.seedPromise = null; // Reset agar bisa dicoba ulang
      }
    })();
    
    return this.seedPromise;
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error("Database not initialized.");
    }
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async addBarang(barang: any): Promise<number> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readwrite");
      const request = store.add(barang);
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getBarang(id: string | number): Promise<any> {
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

  async getAllBarang(): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateBarang(barang: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();

      // ✅ Validasi: id wajib ada dan tidak boleh kosong
      if (!barang.id && barang.id !== 0) {
        reject(new Error(`updateBarang: id tidak boleh kosong. Data: ${JSON.stringify(barang)}`));
        return;
      }

      const store = this.getObjectStore("readwrite");
      
      // Pastikan ada timestamp updated_at
      const dataToSave = {
        ...barang,
        updated_at: barang.updated_at || Date.now()
      };
      
      const request = store.put(dataToSave);
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteBarang(id: string | number): Promise<void> {
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

  async getPaged(offset: number, limit: number): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const all = request.result;
        resolve(all.slice(offset, offset + limit));
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async search(query: string): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      await this.initDb();
      const store = this.getObjectStore("readonly");
      const request = store.getAll();
      
      request.onsuccess = () => {
        const q = query.toLowerCase().trim();
        const results = request.result.filter(p => 
          p.name?.toLowerCase().includes(q) || 
          p.barcode?.includes(query) || 
          p.sku?.includes(query)
        );
        resolve(results);
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

  /**
   * ✅ Migrasi ID lama (Date.now, sku-xxx, bc-xxx, import-xxx) ke format prod_<sku>.
   * Jalankan sekali setelah update untuk membersihkan data lama.
   * Kembalikan jumlah record yang ID-nya diperbarui.
   */
  async migrateIds(): Promise<{ migrated: number; skipped: number }> {
    await this.initDb();
    const all = await this.getAllBarang();
    let migrated = 0;
    let skipped = 0;

    for (const p of all) {
      const sku = (p.sku || p.barcode || '').toString().trim();
      // Sudah format baru → skip
      if (typeof p.id === 'string' && p.id.startsWith('prod_')) {
        skipped++;
        continue;
      }
      let newId: string;

      if (!sku) {
        // Generate a unique ID for products without SKU/barcode
        newId = `prod_no_sku_${crypto.randomUUID()}`;
      } else {
        newId = `prod_${sku.toLowerCase().replace(/[^a-z0-9\-_]/g, ".")}`;
      }

      // Jika ID baru sudah ada (produk lain dengan SKU sama), hapus yang lama
      const existing = await this.getBarang(newId);
      if (existing) {
        // Sudah ada produk dengan ID baru → hapus duplikat lama ini
        await this.deleteBarang(p.id);
      } else {
        // Tulis ulang dengan ID baru, hapus yang lama
        await this.updateBarang({ ...p, id: newId });
        await this.deleteBarang(p.id);
      }
      migrated++;
    }

    return { migrated, skipped };
  }

  /**
   * ✅ Hapus data duplikat berdasarkan SKU/barcode.
   * Jika ada beberapa produk dengan SKU yang sama, simpan yang paling baru (updated_at terbesar).
   * Kembalikan jumlah duplikat yang dihapus.
   */
  async deduplicateBySku(): Promise<{ removed: number; kept: number }> {
    await this.initDb();
    const all = await this.getAllBarang();

    // Kelompokkan by SKU (gunakan sku || barcode sebagai key)
    const byKey = new Map<string, any[]>();
    const noKeyItems: any[] = []; // produk tanpa sku/barcode — tidak bisa deduplikasi

    for (const p of all) {
      const key = (p.sku || p.barcode || '').toString().trim();
      if (!key) {
        noKeyItems.push(p);
        continue;
      }
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(p);
    }

    const toDelete: string[] = [];

    for (const [, group] of byKey) {
      if (group.length <= 1) continue;
      // Sort: updated_at terbesar di depan (yang paling baru)
      group.sort((a, b) => {
        const aT = typeof a.updated_at === 'number' ? a.updated_at : new Date(a.updated_at || 0).getTime();
        const bT = typeof b.updated_at === 'number' ? b.updated_at : new Date(b.updated_at || 0).getTime();
        return bT - aT;
      });
      // Hapus semua kecuali yang pertama (terbaru)
      for (let i = 1; i < group.length; i++) {
        toDelete.push(group[i].id);
      }
    }

    // Hapus satu per satu
    for (const id of toDelete) {
      await this.deleteBarang(id);
    }

    return { removed: toDelete.length, kept: all.length - toDelete.length };
  }
}

export const indexdbBarang = new IndexDBBarang();
