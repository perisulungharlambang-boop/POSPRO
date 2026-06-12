/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ✅ SUPABASE ADAPTER - Implementasi IDatabase dengan Supabase PostgreSQL
 * ✅ Cocok untuk: Multi-user, Real-time sync, Cloud backup
 */

import { IDatabase } from './IDatabase';
import { getSupabaseClient } from './SupabaseService';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseAdapter implements IDatabase {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseClient();
  }

  /**
   * Inisialisasi tabel-tabel di Supabase jika belum ada
   * NOTE: Buat tabel ini melalui Supabase SQL Editor untuk production
   */
  async init(): Promise<void> {
    console.log('✅ Supabase adapter initialized');
  }

  // ====== PRODUCTS ======

  async addBarang(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('products')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add product: ${error.message}`);
    return result?.id || '';
  }

  async getBarang(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Get product:', error);
      return null;
    }
    return data;
  }

  async getAllBarang(): Promise<any[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('name');

    if (error) throw new Error(`❌ Get all products: ${error.message}`);
    return data || [];
  }

  async updateBarang(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update product: ${error.message}`);
  }

  async deleteBarang(id: string): Promise<void> {
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete product: ${error.message}`);
  }

  // ====== TRANSACTIONS ======

  async addTransaksi(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('transactions')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add transaction: ${error.message}`);
    return result?.id || '';
  }

  async getTransaksi(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Get transaction:', error);
      return null;
    }
    return data;
  }

  async getAllTransaksi(): Promise<any[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all transactions: ${error.message}`);
    return data || [];
  }

  async updateTransaksi(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update transaction: ${error.message}`);
  }

  async deleteTransaksi(id: string): Promise<void> {
    const { error } = await this.client
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete transaction: ${error.message}`);
  }

  // ====== CUSTOMERS ======

  async addCustomer(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('customers')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add customer: ${error.message}`);
    return result?.id || '';
  }

  async getCustomer(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Get customer:', error);
      return null;
    }
    return data;
  }

  async getAllCustomer(): Promise<any[]> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .order('name');

    if (error) throw new Error(`❌ Get all customers: ${error.message}`);
    return data || [];
  }

  async updateCustomer(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('customers')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update customer: ${error.message}`);
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await this.client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete customer: ${error.message}`);
  }

  // ====== SUPPLIERS ======

  async addSupplier(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('suppliers')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add supplier: ${error.message}`);
    return result?.id || '';
  }

  async getSupplier(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Get supplier:', error);
      return null;
    }
    return data;
  }

  async getAllSupplier(): Promise<any[]> {
    const { data, error } = await this.client
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw new Error(`❌ Get all suppliers: ${error.message}`);
    return data || [];
  }

  async updateSupplier(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('suppliers')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update supplier: ${error.message}`);
  }

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await this.client
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete supplier: ${error.message}`);
  }

  // ====== CATEGORIES ======

  async addCategory(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('categories')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add category: ${error.message}`);
    return result?.id || '';
  }

  async getCategory(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Get category:', error);
      return null;
    }
    return data;
  }

  async getAllCategory(): Promise<any[]> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw new Error(`❌ Get all categories: ${error.message}`);
    return data || [];
  }

  async updateCategory(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update category: ${error.message}`);
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.client
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete category: ${error.message}`);
  }

  // ====== DISCOUNTS ======

  async addDiscount(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('discounts')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add discount: ${error.message}`);
    return result?.id || '';
  }

  async getAllDiscount(): Promise<any[]> {
    const { data, error } = await this.client
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all discounts: ${error.message}`);
    return data || [];
  }

  async updateDiscount(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('discounts')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update discount: ${error.message}`);
  }

  async deleteDiscount(id: string): Promise<void> {
    const { error } = await this.client
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete discount: ${error.message}`);
  }

  // ====== DEBTS ======

  async addDebt(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('debts')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add debt: ${error.message}`);
    return result?.id || '';
  }

  async getAllDebt(): Promise<any[]> {
    const { data, error } = await this.client
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all debts: ${error.message}`);
    return data || [];
  }

  async updateDebt(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('debts')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update debt: ${error.message}`);
  }

  async deleteDebt(id: string): Promise<void> {
    const { error } = await this.client
      .from('debts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete debt: ${error.message}`);
  }

  // ====== EXPENSES ======

  async addExpense(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('expenses')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add expense: ${error.message}`);
    return result?.id || '';
  }

  async getAllExpense(): Promise<any[]> {
    const { data, error } = await this.client
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all expenses: ${error.message}`);
    return data || [];
  }

  async updateExpense(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('expenses')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update expense: ${error.message}`);
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.client
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete expense: ${error.message}`);
  }

  // ====== RESTOCKS ======

  async addRestock(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('restocks')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add restock: ${error.message}`);
    return result?.id || '';
  }

  async getAllRestock(): Promise<any[]> {
    const { data, error } = await this.client
      .from('restocks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all restocks: ${error.message}`);
    return data || [];
  }

  async updateRestock(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('restocks')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update restock: ${error.message}`);
  }

  async deleteRestock(id: string): Promise<void> {
    const { error } = await this.client
      .from('restocks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete restock: ${error.message}`);
  }

  // ====== RETURNS ======

  async addRetur(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('returns')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add return: ${error.message}`);
    return result?.id || '';
  }

  async getAllRetur(): Promise<any[]> {
    const { data, error } = await this.client
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`❌ Get all returns: ${error.message}`);
    return data || [];
  }

  async updateRetur(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('returns')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update return: ${error.message}`);
  }

  async deleteRetur(id: string): Promise<void> {
    const { error } = await this.client
      .from('returns')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete return: ${error.message}`);
  }

  // ====== USERS ======

  async addUser(data: any): Promise<string> {
    const { data: result, error } = await this.client
      .from('users')
      .insert([data])
      .select('id')
      .single();

    if (error) throw new Error(`❌ Add user: ${error.message}`);
    return result?.id || '';
  }

  async getAllUser(): Promise<any[]> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .order('name');

    if (error) throw new Error(`❌ Get all users: ${error.message}`);
    return data || [];
  }

  async updateUser(id: string, updates: any): Promise<void> {
    const { error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`❌ Update user: ${error.message}`);
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.client
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`❌ Delete user: ${error.message}`);
  }

  // ====== REAL-TIME SUBSCRIPTIONS ======

  /**
   * Subscribe ke perubahan real-time pada tabel
   */
  subscribeToTable(tableName: string, callback: (payload: any) => void) {
    return this.client
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`✅ Real-time update from ${tableName}:`, payload);
          callback(payload);
        }
      )
      .subscribe();
  }

  /**
   * Unsubscribe dari real-time updates
   */
  async unsubscribeFromTable(subscription: any) {
    if (subscription) {
      await this.client.removeChannel(subscription);
    }
  }
}
