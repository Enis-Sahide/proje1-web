"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, DollarSign, Store, CheckCircle, XCircle, ArrowLeft, Star, Search, Filter, RefreshCw, Award, UserCheck } from 'lucide-react';
import { VENDORS } from '@/data/marketplaceData';
import { supabase } from '@/lib/supabase';

// Mock mapping of users who own stores based on their Supabase IDs or names
const MOCK_USER_STORES: Record<string, { id: string; name: string }> = {
  // baha (ID) -> Şifa Taşı Dükkanı
  "1dde7856-c331-4277-a43f-fb975808c3c0": { id: "sifa-tasi", name: "Şifa Taşı Dükkanı" }
};

// Helper function to dynamically check store relationship by user ID or user metadata (name/email)
const getUserStore = (profile: any) => {
  if (MOCK_USER_STORES[profile.id]) {
    return MOCK_USER_STORES[profile.id];
  }
  
  const name = (profile.full_name || '').toLowerCase();
  
  // enis@gmail.com için Kadim Kokular mağazası (isimde enis barındıran veya enis@gmail.com olan)
  if (name.includes('enis') || name.includes('enis@')) {
    return { id: "kadim-kokular", name: "Kadim Kokular" };
  }
  
  // lalezar_28@hotmail.com için Mistik Yol mağazası (isimde lalezar barındıran veya lalezar_28 olan)
  if (name.includes('lalezar') || name.includes('lalezar_28')) {
    return { id: "mistik-yol", name: "Mistik Yol" };
  }
  
  return null;
};

const ROLE_LABELS: Record<string, { label: string; style: string }> = {
  free: { label: 'Ücretsiz Üyelik', style: 'border-white/10 text-mystic-text-muted bg-white/5' },
  apprentice: { label: 'Çıraklık (Seviye 1)', style: 'border-amber-700/50 text-amber-500 bg-amber-500/10 shadow-[0_0_8px_rgba(180,83,9,0.1)]' },
  journeyman: { label: 'Kalfalık (Seviye 2)', style: 'border-blue-500/50 text-blue-400 bg-blue-400/10 shadow-[0_0_8px_rgba(59,130,246,0.1)]' },
  master: { label: 'Ustalık (Seviye 3)', style: 'border-mystic-primary/50 text-mystic-primary bg-mystic-primary/10 shadow-[0_0_8px_rgba(212,175,55,0.15)]' },
  admin: { label: 'Yönetici', style: 'border-red-500/50 text-red-400 bg-red-400/10 shadow-[0_0_8px_rgba(239,68,68,0.15)]' }
};

export default function AdminDashboard() {
  const router = useRouter();

  // Active tab state: 'stores' | 'members'
  const [activeTab, setActiveTab] = useState<'stores' | 'members'>('stores');

  // Global platform statistics (mocked)
  const totalPlatformSales = 45000;
  const platformCommission = totalPlatformSales * 0.10; // 10%
  const activeStores = VENDORS.length;

  // Vendors state
  const [vendors, setVendors] = useState(VENDORS.map(v => ({...v, status: 'approved'})));

  // Profiles (members) state
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  
  // Role updating loader state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch profiles from Supabase profiles table
  const fetchProfiles = async () => {
    setIsLoadingProfiles(true);
    setProfilesError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err: any) {
      console.error("Profiles fetch error:", err);
      setProfilesError(err.message || 'Üyeler yüklenirken hata oluştu.');
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleStatus = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    if (!vendor) return;

    if (vendor.status === 'approved') {
      const confirmClose = window.confirm(`"${vendor.name}" isimli mağazayı kapatmak istediğinize emin misiniz?`);
      if (!confirmClose) return;
    }

    setVendors(vendors.map(v => {
      if (v.id === id) {
        return { ...v, status: v.status === 'approved' ? 'banned' : 'approved' };
      }
      return v;
    }));
  };

  // Change user role directly in Supabase profiles database
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const profile = profiles.find(p => p.id === userId);
    const userName = profile?.full_name || 'İsimsiz Üye';
    
    const roleLabels: Record<string, string> = {
      free: 'Ücretsiz Üye',
      apprentice: 'Çırak (Seviye 1)',
      journeyman: 'Kalfa (Seviye 2)',
      master: 'Usta (Seviye 3)',
      admin: 'Yönetici (Admin)'
    };
    
    const targetRoleLabel = roleLabels[newRole] || newRole;
    
    const confirmChange = window.confirm(`"${userName}" isimli üyenin yetki seviyesini "${targetRoleLabel}" olarak değiştirmek istediğinize emin misiniz?`);
    if (!confirmChange) return;

    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local profiles state
      setProfiles(profiles.map(p => {
        if (p.id === userId) {
          return { ...p, role: newRole };
        }
        return p;
      }));
    } catch (err: any) {
      alert("Rol güncellenirken bir hata oluştu: " + err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter members list based on current filters
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;

    const userStore = getUserStore(p);
    const hasStore = !!userStore;
    const matchesStore = 
      storeFilter === 'all' || 
      (storeFilter === 'has_store' && hasStore) || 
      (storeFilter === 'no_store' && !hasStore);

    return matchesSearch && matchesRole && matchesStore;
  });

  return (
    <div className="min-h-screen bg-mystic-dark pb-24">
      {/* Header */}
      <header className="bg-black/50 border-b border-mystic-primary/20 p-6 pt-28 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-3 text-mystic-primary">
              <Shield size={32} />
              <div>
                <h1 className="text-xl font-bold text-white">Sistem Yöneticisi</h1>
                <p className="text-xs">Genel Yönetim ve Yetkilendirme Paneli</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        
        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium text-sm">Toplam Ciro</h3>
              <div className="bg-white/5 p-2 rounded-lg text-white"><DollarSign size={18} /></div>
            </div>
            <p className="text-2xl font-bold text-white">{totalPlatformSales.toLocaleString('tr-TR')} ₺</p>
            <p className="text-[11px] text-mystic-text-muted mt-2">Mağazaların toplam cirosu</p>
          </div>

          <div className="bg-mystic-primary/10 border border-mystic-primary/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-mystic-primary/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-mystic-primary font-bold text-sm">Net Gelir (%10)</h3>
              <div className="bg-mystic-primary/20 p-2 rounded-lg text-mystic-primary"><Shield size={18} /></div>
            </div>
            <p className="text-2xl font-bold text-white relative z-10">{platformCommission.toLocaleString('tr-TR')} ₺</p>
            <p className="text-[11px] text-mystic-primary/80 mt-2 relative z-10">Platform komisyon geliri</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium text-sm">Aktif Mağazalar</h3>
              <div className="bg-blue-500/15 p-2 rounded-lg text-blue-400"><Store size={18} /></div>
            </div>
            <p className="text-2xl font-bold text-white">{activeStores}</p>
            <p className="text-[11px] text-mystic-text-muted mt-2">Pazaryerindeki dükkanlar</p>
          </div>

          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-mystic-text-muted font-medium text-sm">Toplam Üye</h3>
              <div className="bg-purple-500/15 p-2 rounded-lg text-purple-400"><Users size={18} /></div>
            </div>
            <p className="text-2xl font-bold text-white">
              {isLoadingProfiles ? (
                <span className="inline-block w-8 h-6 bg-white/10 animate-pulse rounded"></span>
              ) : (
                profiles.length
              )}
            </p>
            <p className="text-[11px] text-mystic-text-muted mt-2">Platforma kayıtlı ruhlar</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/10 mb-8 gap-2">
          <button 
            onClick={() => setActiveTab('stores')}
            className={`px-6 py-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${
              activeTab === 'stores' ? 'text-mystic-primary border-b-2 border-mystic-primary' : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            <Store size={16} />
            Mağaza Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${
              activeTab === 'members' ? 'text-mystic-primary border-b-2 border-mystic-primary' : 'text-mystic-text-muted hover:text-white'
            }`}
          >
            <Users size={16} />
            Üye Yönetimi
            {!isLoadingProfiles && (
              <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full ml-1 font-normal">
                {profiles.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content 1: Stores */}
        {activeTab === 'stores' && (
          <div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Store className="text-mystic-primary" size={20} /> Kayıtlı Mağazalar ({vendors.length})
            </h2>
            
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-mystic-text-muted text-xs uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 font-semibold">Mağaza Adı</th>
                      <th className="p-4 font-semibold">Puan</th>
                      <th className="p-4 font-semibold">Durum</th>
                      <th className="p-4 font-semibold text-right">İşlem (Kapat/Aç)</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-sm divide-y divide-white/5">
                    {vendors.map(v => (
                      <tr key={v.id} className={`transition-colors ${v.status === 'banned' ? 'opacity-50 bg-red-900/10' : 'hover:bg-white/5'}`}>
                        <td className="p-4 flex items-center gap-3">
                          <img src={v.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          <div>
                            <span className="font-bold block">{v.name}</span>
                            <span className="text-xs text-mystic-text-muted">ID: {v.id}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center text-yellow-500 font-bold"><Star size={14} className="mr-1" fill="currentColor"/> {v.rating}</span>
                        </td>
                        <td className="p-4">
                          {v.status === 'approved' ? (
                            <span className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded-full w-max text-xs"><CheckCircle size={14} className="mr-1"/> Aktif</span>
                          ) : (
                            <span className="flex items-center text-red-400 bg-red-400/10 px-2 py-1 rounded-full w-max text-xs"><XCircle size={14} className="mr-1"/> Engellendi</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleToggleStatus(v.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              v.status === 'approved' 
                              ? 'border-red-500/50 text-red-400 hover:bg-red-500/20' 
                              : 'border-green-500/50 text-green-400 hover:bg-green-500/20'
                            }`}
                          >
                            {v.status === 'approved' ? 'Mağazayı Kapat' : 'Geri Aç'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Members */}
        {activeTab === 'members' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-mystic-primary" size={20} /> Kayıtlı Üyeler ({filteredProfiles.length})
              </h2>
              <button 
                onClick={fetchProfiles} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-mystic-text-muted hover:text-white transition-colors flex items-center gap-2 text-xs"
                title="Yenile"
              >
                <RefreshCw size={14} className={isLoadingProfiles ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="İsim veya ID ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-mystic-text-muted focus:outline-none focus:border-mystic-primary/50 transition-colors"
                />
              </div>

              {/* Role filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                  <Filter size={16} />
                </div>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mystic-primary/50 transition-colors appearance-none"
                >
                  <option value="all" className="bg-mystic-dark">Tüm Seviyeler</option>
                  <option value="free" className="bg-mystic-dark">Ücretsiz Üyelik</option>
                  <option value="apprentice" className="bg-mystic-dark">Çıraklık (Seviye 1)</option>
                  <option value="journeyman" className="bg-mystic-dark">Kalfalık (Seviye 2)</option>
                  <option value="master" className="bg-mystic-dark">Ustalık (Seviye 3)</option>
                  <option value="admin" className="bg-mystic-dark">Yönetici (Admin)</option>
                </select>
              </div>

              {/* Store ownership filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mystic-text-muted">
                  <Store size={16} />
                </div>
                <select 
                  value={storeFilter}
                  onChange={(e) => setStoreFilter(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-mystic-primary/50 transition-colors appearance-none"
                >
                  <option value="all" className="bg-mystic-dark">Mağaza Durumu (Tümü)</option>
                  <option value="has_store" className="bg-mystic-dark">Mağazası Olanlar</option>
                  <option value="no_store" className="bg-mystic-dark">Mağazası Olmayanlar</option>
                </select>
              </div>
            </div>

            {/* Profiles table */}
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
              {isLoadingProfiles ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-mystic-text-muted">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-mystic-primary/10"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-t-mystic-primary border-r-mystic-accent animate-spin"></div>
                  </div>
                  <p className="text-xs">Canlı üye verileri yükleniyor...</p>
                </div>
              ) : profilesError ? (
                <div className="py-16 text-center text-red-400 text-sm">
                  {profilesError}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="py-20 text-center text-mystic-text-muted text-sm">
                  Kriterlere uygun üye bulunamadı.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-mystic-text-muted text-xs uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="p-4 font-semibold">Üye Bilgileri</th>
                        <th className="p-4 font-semibold">Kayıt Tarihi</th>
                        <th className="p-4 font-semibold">Seviye (Mühür)</th>
                        <th className="p-4 font-semibold">Mağaza İlişkisi</th>
                        <th className="p-4 font-semibold text-right">Rol Yetkilendirme</th>
                      </tr>
                    </thead>
                    <tbody className="text-white text-sm divide-y divide-white/5">
                      {filteredProfiles.map(p => {
                        const userStore = getUserStore(p);
                        const userRole = p.role || 'free';
                        const roleMeta = ROLE_LABELS[userRole] || ROLE_LABELS.free;

                        return (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            {/* Member Info */}
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-mystic-primary/20 to-mystic-accent/20 border border-white/10 flex items-center justify-center font-bold text-mystic-primary uppercase text-sm">
                                {p.full_name ? p.full_name.slice(0, 2) : 'ÜY'}
                              </div>
                              <div>
                                <span className="font-bold block">{p.full_name || 'İsimsiz Üye'}</span>
                                <span className="text-[10px] text-mystic-text-muted block font-mono">ID: {p.id}</span>
                              </div>
                            </td>
                            
                            {/* Registration Date */}
                            <td className="p-4 text-mystic-text-muted text-xs">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Bilinmiyor'}
                            </td>

                            {/* Level Badge */}
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full border text-[11px] font-bold block w-max uppercase ${roleMeta.style}`}>
                                {roleMeta.label}
                              </span>
                            </td>

                            {/* Store Relationship */}
                            <td className="p-4">
                              {userStore ? (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                                    <Store size={12} className="mr-1" />
                                    Mağazalı
                                  </span>
                                  <span className="text-xs text-white/80 font-medium max-w-[120px] truncate" title={userStore.name}>
                                    {userStore.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-mystic-text-muted text-xs">Yok</span>
                              )}
                            </td>

                            {/* Actions / Role select */}
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {updatingUserId === p.id && (
                                  <div className="w-4 h-4 rounded-full border border-mystic-primary/20 border-t-mystic-primary animate-spin"></div>
                                )}
                                <select 
                                  value={p.role || 'free'}
                                  disabled={updatingUserId === p.id}
                                  onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                                  className="bg-black/60 border border-white/10 rounded-xl px-2 py-1 text-xs text-white focus:outline-none focus:border-mystic-primary/50 transition-colors"
                                >
                                  <option value="free">Ücretsiz Üye</option>
                                  <option value="apprentice">Çırak (Seviye 1)</option>
                                  <option value="journeyman">Kalfa (Seviye 2)</option>
                                  <option value="master">Usta (Seviye 3)</option>
                                  <option value="admin">Yönetici (Admin)</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
