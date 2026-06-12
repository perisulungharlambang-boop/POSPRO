/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IndexedDB Service untuk Hutang & Piutang
 * Mencatat utang pelanggan dan piutang ke supplier
 */

export interface Debt {
  id: string;
  type: 'receivable' | 'payable';  // receivable = piutang (pelanggan utang ke kita), payable = hutang (kita utang ke supplier)
  customerId?: string;
  customerName: string;
  supplierId?: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  description: string;
  dueDate: number;
  status: 'unpaid' | 'partial' | 'paid';
  created_at: number;
  updated_at: number;
}

class IndexDBDebt {
  private dbName: string = "debtDB";
  private storeName: string = "debts";
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) { resolve(); return; }
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("dueDate", "dueDate", { unique: false });
        }
      };
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      request.onerror = (event) => {
        console.error("debtDB error:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) throw new Error("DB not init");
    return this.db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  async getAll(): Promise<Debt[]> {
    await this.initDb();
    return new Promise((resolve, reject) => {
      const req = this.getObjectStore("readonly").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async save(d: Debt): Promise<void> {
    await this.initDb();
    return new Promise((resolve, reject) => {
      const req = this.getObjectStore("readwrite").put({...d, updated_at: Date.now()});
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(id: string): Promise<void> {
    await this.initDb();
    return new Promise((resolve, reject) => {
      const req = this.getObjectStore("readwrite").delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async search(query: string): Promise<Debt[]> {
    const all = await this.getAll();
    const q = query.toLowerCase().trim();
    return all.filter(d =>
      d.customerName.toLowerCase().includes(q) ||
      d.supplierName.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  }

  async getByType(type: 'receivable' | 'payable'): Promise<Debt[]> {
    const all = await this.getAll();
    return all.filter(d => d.type === type).sort((a, b) => b.created_at - a.created_at);
  }

  async getTotalReceivable(): Promise<number> {
    const all = await this.getByType('receivable');
    return all.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  }

  async getTotalPayable(): Promise<number> {
    const all = await this.getByType('payable');
    return all.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  }

  generateId(): string { return `debt_${Date.now()}_${Math.random().toString(36).slice(2,6)}`; }
}

export const indexdbDebt = new IndexDBDebt();