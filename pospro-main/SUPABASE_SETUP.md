# 🚀 Setup & Koneksi Supabase - Panduan Lengkap

## 📋 Daftar Isi
1. [Registrasi Supabase](#registrasi-supabase)
2. [Setup Project](#setup-project)
3. [Konfigurasi Environment](#konfigurasi-environment)
4. [Membuat Tabel Database](#membuat-tabel-database)
5. [Setup Row Level Security (RLS)](#setup-row-level-security)
6. [Integrasi ke App](#integrasi-ke-app)

---

## 1️⃣ Registrasi Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Sign Up"** → Login dengan GitHub atau Email
3. Verifikasi email Anda

---

## 2️⃣ Setup Project

### A. Buat Project Baru
1. Di dashboard, klik **"New Project"**
2. Isi form:
   - **Name**: `POS Herman` (atau nama toko Anda)
   - **Database Password**: Buat password yang kuat (catat baik-baik!)
   - **Region**: Pilih `Southeast Asia (Singapore)` untuk latency rendah
3. Klik **"Create new project"**
4. Tunggu ~2 menit hingga project siap

### B. Ambil API Keys
1. Di sidebar kiri, cari **"Project Settings"** → **"API"**
2. Anda akan melihat:
   - **Project URL** (contoh: `https://xyz.supabase.co`)
   - **anon public** (public API key)
   - **service_role** (secret key - jangan bagikan!)

---

## 3️⃣ Konfigurasi Environment

### Step 1: Buat `.env.local`
Buat file `.env.local` di root project (copy dari `.env.example`):

```bash
cp .env.example .env.local
```

### Step 2: Edit `.env.local`
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key-here"
```

Ganti `your-project-id` dan `your-anon-public-key` dengan nilai dari Supabase API Settings.

---

## 4️⃣ Membuat Tabel Database

### Step 1: Buka SQL Editor di Supabase
1. Klik **"SQL Editor"** di sidebar
2. Klik **"New Query"**

### Step 2: Copy & Paste SQL Schema

Salin script SQL berikut ke SQL Editor dan jalankan:

```sql
-- ========== ENABLE UUID EXTENSION ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== CATEGORIES ==========
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== PRODUCTS ==========
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price_retail INTEGER DEFAULT 0,
  price_wholesale INTEGER DEFAULT 0,
  price_cost INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== CUSTOMERS ==========
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  customer_type TEXT DEFAULT 'retail', -- 'retail' atau 'wholesale'
  tax_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== SUPPLIERS ==========
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  contact_person TEXT,
  bank_account TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'cashier', -- 'admin', 'cashier', 'warehouse'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TRANSACTIONS ==========
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_amount INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'transfer', 'debit', 'credit'
  transaction_type TEXT DEFAULT 'sale', -- 'sale', 'return'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TRANSACTION ITEMS ==========
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== DISCOUNTS ==========
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value DECIMAL DEFAULT 0,
  min_purchase INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== DEBTS ==========
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  paid_amount INTEGER DEFAULT 0,
  remaining_amount INTEGER NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'partial'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== EXPENSES ==========
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- 'rent', 'salary', 'utilities', etc
  description TEXT,
  amount INTEGER NOT NULL,
  expense_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== RESTOCKS ==========
CREATE TABLE IF NOT EXISTS restocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restock_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_cost INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== RESTOCK ITEMS ==========
CREATE TABLE IF NOT EXISTS restock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restock_id UUID NOT NULL REFERENCES restocks(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_cost INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== RETURNS ==========
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT UNIQUE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount INTEGER DEFAULT 0,
  reason TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== RETURN ITEMS ==========
CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_id UUID NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== CREATE INDEXES ==========
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_debts_customer ON debts(customer_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_restocks_supplier ON restocks(supplier_id);
CREATE INDEX idx_returns_customer ON returns(customer_id);

-- ========== GRANT PERMISSIONS ==========
-- Anonymous users dapat membaca dan menulis (untuk public app)
-- Ganti dengan RLS policy sesuai kebutuhan
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
```

### Step 3: Jalankan Script
1. Klik **"Run"** (tombol di kanan bawah)
2. Tunggu hingga semua query berhasil (status hijau ✅)

---

## 5️⃣ Setup Row Level Security (RLS)

### Enable RLS pada Tabel

Jalankan SQL ini untuk mengaktifkan RLS:

```sql
-- Disable RLS untuk development (aman karena using ANON KEY)
-- Untuk production, enable dan buat policies per role

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE restocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users
CREATE POLICY "Allow all for authenticated users"
ON products FOR ALL
TO authenticated
USING (true) WITH CHECK (true);

-- Repeat untuk tabel lain sesuai kebutuhan
```

---

## 6️⃣ Integrasi ke App

### A. Import Service di Main App

Edit `src/main.tsx`:

```typescript
import { initSupabase } from '@/services/db/SupabaseService';

// Initialize Supabase saat app startup
initSupabase();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

### B. Switch Adapter di DatabaseService

Edit `src/services/db/DatabaseService.ts`:

```typescript
import { SupabaseAdapter } from './SupabaseAdapter';

const useSupabase = true; // Set to false untuk fallback ke IndexedDB

export class DatabaseService {
  private adapter: IDatabase;

  constructor() {
    if (useSupabase) {
      this.adapter = new SupabaseAdapter();
    } else {
      this.adapter = new MockWebAdapter(); // fallback
    }
  }

  // Delegate semua calls ke adapter
  async addBarang(data: any) {
    return this.adapter.addBarang(data);
  }
  // ... dst
}
```

### C. Gunakan dalam Komponen

```typescript
import { DatabaseService } from '@/services/db/DatabaseService';

const db = new DatabaseService();

// Tambah produk
const id = await db.addBarang({
  name: 'Laptop',
  sku: 'LT-001',
  barcode: '1234567890',
  price_retail: 10000000,
  stock: 5
});

// Ambil semua produk
const products = await db.getAllBarang();

// Update
await db.updateBarang(id, { stock: 10 });
```

---

## 🔄 Real-Time Sync

Adapter Supabase mendukung real-time updates:

```typescript
const db = new DatabaseService();

// Subscribe ke perubahan tabel products
const subscription = db.subscribeToTable('products', (payload) => {
  console.log('Product changed:', payload);
  // Update UI Anda di sini
});

// Unsubscribe saat component unmount
db.unsubscribeFromTable(subscription);
```

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Missing VITE_SUPABASE_URL` | Pastikan `.env.local` sudah dibuat dan di-load |
| `Connection timeout` | Periksa region Supabase, pastikan network terbuka |
| `401 Unauthorized` | Periksa ANON_KEY sudah benar |
| `RLS policy error` | Disable RLS di development, atau buat policy yang tepat |
| `CORS error` | Supabase auto-allow, tapi check Project Settings → API → CORS |

---

## ✅ Checklist Setup

- [ ] Daftar Supabase
- [ ] Buat project baru
- [ ] Copy API credentials ke `.env.local`
- [ ] Jalankan SQL schema
- [ ] Enable RLS policies
- [ ] Import SupabaseService di main.tsx
- [ ] Ganti adapter di DatabaseService
- [ ] Test koneksi dengan query sederhana
- [ ] Setup real-time subscriptions (optional)

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client Guide](https://supabase.com/docs/reference/javascript)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Status**: ✅ Setup Supabase selesai! Aplikasi Anda siap untuk cloud database.
