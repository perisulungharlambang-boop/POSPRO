# 🚀 Quick Start - Supabase Integration

## 📦 Dependency Terinstall

```bash
npm install @supabase/supabase-js
```

✅ Status: **DONE**

---

## 📁 Files Created

| File | Tujuan |
|------|--------|
| [src/services/db/SupabaseService.ts](../src/services/db/SupabaseService.ts) | Client initialization & Auth helpers |
| [src/services/db/SupabaseAdapter.ts](../src/services/db/SupabaseAdapter.ts) | Database adapter (implements IDatabase) |
| [src/hooks/useSupabase.ts](../src/hooks/useSupabase.ts) | React hooks untuk Supabase |
| [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) | Panduan setup lengkap |
| [.env.local.example](%20../.env.local.example) | Template environment variables |
| [.env.example](../.env.example) | Updated dengan Supabase config |

---

## ⚡ Setup Dalam 3 Langkah

### 1. Registrasi & Buat Project
- Buka https://supabase.com
- Sign up → Create new project
- Catat **Project URL** dan **Anon Key**

### 2. Konfigurasi Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Setup Database Schema
- Buka Supabase → SQL Editor
- Copy script dari [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) section **"Step 2: Copy & Paste SQL Schema"**
- Jalankan

---

## 💻 Cara Pakai

### Initialize di Main App
```typescript
// src/main.tsx
import { initSupabase } from '@/services/db/SupabaseService';

initSupabase();
// ... rest of app
```

### Gunakan dalam Component

#### Opsi 1: Hook (Recommended)
```typescript
import { useSupabase } from '@/hooks/useSupabase';

function ProductList() {
  const { db, isLoading, error } = useSupabase();

  const loadProducts = async () => {
    const products = await db.getAllBarang();
    console.log(products);
  };

  return <button onClick={loadProducts}>Load Products</button>;
}
```

#### Opsi 2: Direct Service
```typescript
import { SupabaseAdapter } from '@/services/db/SupabaseAdapter';

const db = new SupabaseAdapter();
const products = await db.getAllBarang();
```

#### Opsi 3: Auth
```typescript
import { useSupabaseAuth } from '@/hooks/useSupabase';

function UserProfile() {
  const { user, isLoading } = useSupabaseAuth();
  
  if (isLoading) return <div>Loading...</div>;
  return <h1>Welcome, {user?.email}</h1>;
}
```

---

## 🔄 Real-Time Updates (Optional)

```typescript
import { useRealtimeSubscription } from '@/hooks/useSupabase';

function ProductsWithRealtime() {
  const { data: products } = useRealtimeSubscription('products');
  
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

Setiap ada perubahan di database, UI otomatis update tanpa refresh!

---

## 🔐 Authentication

```typescript
import { signInWithEmail, signOut, getCurrentUser } from '@/services/db/SupabaseService';

// Login
await signInWithEmail('user@example.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Logout
await signOut();
```

---

## 📊 Common Operations

```typescript
const db = new SupabaseAdapter();

// 📝 CREATE
const id = await db.addBarang({ name: 'Produk A', stock: 10 });

// 📖 READ
const product = await db.getBarang(id);
const products = await db.getAllBarang();

// ✏️ UPDATE
await db.updateBarang(id, { stock: 15 });

// 🗑️ DELETE
await db.deleteBarang(id);
```

---

## 🐛 Troubleshooting

```typescript
// Jika error: Missing VITE_SUPABASE_URL
// → Check .env.local ada dan tidak typo

// Jika error: Connection timeout
// → Check internet connection & Supabase project status

// Jika error: 401 Unauthorized
// → Periksa ANON_KEY sudah benar (copy lagi dari Supabase)

// Jika data tidak sync real-time
// → Check RLS policies & subscription config

// Lihat detail error di browser console
console.error(error);
```

---

## 📚 Next Steps

1. **Setup Database**: Ikuti [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
2. **Integrate Auth**: Update LoginPage.tsx untuk gunakan Supabase Auth
3. **Replace Adapters**: Ganti MockWebAdapter dengan SupabaseAdapter di DatabaseService
4. **Test Real-time**: Buka app di 2 tab, edit di satu tab, lihat update di tab lain
5. **Setup Row Level Security**: untuk production, define RLS policies per role

---

## 🚀 Production Checklist

- [ ] Setup Supabase project dengan region yang tepat
- [ ] Configure RLS policies untuk keamanan
- [ ] Backup service_role_key dengan aman (use environment secret)
- [ ] Setup webhook untuk syncing ke external services
- [ ] Monitor quota & performance di Supabase dashboard
- [ ] Setup auto-backup di Supabase
- [ ] Test real-time sync dengan multiple users
- [ ] Configure CORS jika needed

---

**Status**: ✅ Supabase setup selesai dan siap dipakai!

Untuk pertanyaan, lihat dokumentasi resmi: https://supabase.com/docs
