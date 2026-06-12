/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, History, Wallet, BarChart3, Store, Bot, Truck, Users, TrendingDown, Percent, LogOut, User as UserIcon, PackagePlus, RotateCcw } from 'lucide-react';
import StockAlert from '@/components/pos/StockAlert';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { indexdbUser } from '@/lib/indexdbUser';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeName = useSettingsStore(state => state.storeInfo.name);
  const currentUser = indexdbUser.getCurrentUser();
  
  const rawMenuItems = [
    { path: '/', icon: <LayoutDashboard />, label: 'Beranda', roles: ['admin'], color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', activeColor: 'bg-indigo-600 text-white shadow-[#6366F1]/25' },
    { path: '/pos', icon: <ShoppingCart />, label: 'Kasir', roles: ['admin', 'kasir'], color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', activeColor: 'bg-emerald-600 text-white shadow-[#10B981]/25' },
    { path: '/restock', icon: <PackagePlus />, label: 'Masuk', roles: ['admin', 'gudang'], color: 'text-[#0EA5E9]', bg: 'bg-[#0EA5E9]/10', activeColor: 'bg-sky-600 text-white shadow-[#0EA5E9]/25' },
    { path: '/retur', icon: <RotateCcw />, label: 'Retur', roles: ['admin', 'gudang'], color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', activeColor: 'bg-rose-600 text-white shadow-[#EF4444]/25' },
    { path: '/inventory', icon: <Package />, label: 'Produk', roles: ['admin', 'gudang'], color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', activeColor: 'bg-amber-600 text-white shadow-[#F59E0B]/25' },
    { path: '/suppliers', icon: <Truck />, label: 'Supplier', roles: ['admin', 'gudang'], color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', activeColor: 'bg-purple-600 text-white shadow-[#8B5CF6]/25' },
    { path: '/expenses', icon: <TrendingDown />, label: 'Biaya', roles: ['admin'], color: 'text-[#D946EF]', bg: 'bg-[#D946EF]/10', activeColor: 'bg-fuchsia-600 text-white shadow-[#D946EF]/25' },
    { path: '/discounts', icon: <Percent />, label: 'Diskon', roles: ['admin'], color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', activeColor: 'bg-pink-600 text-white shadow-[#EC4899]/25' },
    { path: '/customers', icon: <Users />, label: 'Pelanggan', roles: ['admin', 'kasir'], color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', activeColor: 'bg-teal-600 text-white shadow-[#14B8A6]/25' },
    { path: '/history', icon: <History />, label: 'Riwayat', roles: ['admin', 'kasir'], color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', activeColor: 'bg-blue-600 text-white shadow-[#3B82F6]/25' },
    { path: '/reports', icon: <BarChart3 />, label: 'Laporan', roles: ['admin'], color: 'text-[#A855F7]', bg: 'bg-[#A855F7]/10', activeColor: 'bg-violet-600 text-white shadow-[#A855F7]/25' },
    { path: '/settings', icon: <Store />, label: 'Toko', roles: ['admin'], color: 'text-[#64748B]', bg: 'bg-[#64748B]/10', activeColor: 'bg-slate-600 text-white shadow-[#64748B]/25' },
  ];

  const menuItems = rawMenuItems.filter(item => {
    const role = currentUser?.role || 'admin';
    return item.roles.includes(role);
  });

  return (
    <div className="flex flex-row min-h-[calc(var(--vh,1vh)*100)] bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Sidebar Navigation - Desktop Only */}
      <aside className="hidden md:flex w-20 bg-slate-900 flex-col items-center py-6 gap-6 shrink-0 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 text-white font-extrabold text-lg shadow-md hover:scale-105 transition-transform select-none">
          PK
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-140px)] w-full px-2 scrollbar-none items-center">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  "p-3 rounded-xl flex items-center justify-center transition-all group relative w-12 h-12",
                  isActive 
                    ? cn(item.activeColor, "shadow-lg") 
                    : cn("hover:bg-slate-800", item.color)
                )}
              >
                <div className="[&>svg]:w-[18px] [&>svg]:h-[18px] transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-white text-[9px] uppercase tracking-wider font-extrabold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 shadow-md translate-x-2 group-hover:translate-x-0">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
              <Store size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight text-slate-900 tracking-tight">{storeName}</h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase md:block hidden">Sistem Kasir · Tema High Density</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase md:hidden block">Sistem Kasir</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-slate-800 leading-none">{currentUser.name || 'User'}</div>
                    <div className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{currentUser.role || 'kasir'}</div>
                  </div>
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center font-extrabold text-xs text-indigo-700 uppercase">
                    {(currentUser.name || 'User').slice(0, 2)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    indexdbUser.logout();
                    navigate('/login');
                  }}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Scrollable Content Panel */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <StockAlert />
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-1 z-50 overflow-x-auto scrollbar-none">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all flex-1 min-w-[50px] py-1",
                isActive ? item.color : 'text-slate-500'
              )}
            >
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300",
                isActive ? cn(item.bg, 'scale-115 shadow-sm border border-slate-50') : 'hover:bg-slate-50'
              )}>
                <div className={cn(
                  isActive ? cn('scale-110', item.color) : 'text-slate-500',
                  "[&>svg]:w-[16px] [&>svg]:h-[16px] [&>svg]:stroke-[2.5]"
                )}>
                  {item.icon}
                </div>
              </div>
              <span className={cn(
                "text-[8px] font-black tracking-tight leading-none truncate max-w-[55px] uppercase",
                isActive ? cn('opacity-100 font-extrabold', item.color) : 'text-slate-600'
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
