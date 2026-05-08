/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Users, 
  ShieldCheck, 
  Bell, 
  Cpu, 
  Database, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ShieldAlert
} from "lucide-react";
import { UserRole } from "../types";
import { UserProfile, getAllUsers, updateUserRole } from "../services/userService";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function Settings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'system'>('users');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Gagal memuat user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingId(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Gagal update role:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10">
      <header>
        <div className="flex items-center gap-3 text-natural-accent mb-2">
          <SettingsIcon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Pusat Kendali BroGuard</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light">Konfigurasi Sistem</h2>
        <p className="text-natural-muted mt-2 font-sans italic text-sm">Manajemen hak akses pengguna dan parameter operasional AI.</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 md:gap-4 border-b border-natural-border pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Manajemen User', icon: Users },
          { id: 'system', label: 'Parameter AI', icon: Cpu },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
              activeSubTab === tab.id 
                ? "text-natural-accent border-b-2 border-natural-accent" 
                : "text-natural-muted hover:text-natural-heading"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'users' ? (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-natural-border shadow-sm">
              <div className="flex items-center gap-4 text-natural-muted italic text-xs md:text-sm">
                <ShieldAlert size={18} className="shrink-0" />
                <span>Hanya Administrator yang dapat mengubah peran pengguna.</span>
              </div>
              <button 
                onClick={loadUsers}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-natural-accent hover:opacity-70 whitespace-nowrap"
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>

            <div className="bg-white rounded-[24px] md:rounded-[40px] border border-natural-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-natural-sidebar/30 border-b border-natural-border">
                      <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Pengguna</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Email</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Hak Akses</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Status</th>
                      <th className="px-6 md:px-8 py-5 text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-border">
                    {users.map((u) => (
                      <tr key={u.uid} className="hover:bg-[#FBFBFA] transition-all group">
                        <td className="px-6 md:px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-natural-sidebar flex items-center justify-center text-natural-accent font-bold text-xs uppercase">
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-natural-heading">{u.name}</p>
                              <p className="text-[10px] text-natural-muted uppercase tracking-widest truncate max-w-[100px]">{u.uid.startsWith('demo-') ? 'Akun Demo' : 'Akun Riil'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-6">
                          <span className="text-xs text-natural-muted font-sans italic">{u.email}</span>
                        </td>
                        <td className="px-6 md:px-8 py-6">
                          <div className="flex items-center gap-3">
                            {u.email === 'pmbstmikkomputama@gmail.com' ? (
                              <div className="bg-natural-accent text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm border border-natural-accent">
                                Master Administrator
                              </div>
                            ) : (
                              <select 
                                value={u.role}
                                disabled={updatingId === u.uid}
                                onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                className={cn(
                                  "bg-[#FBFBFA] border border-natural-border rounded-xl px-3 md:px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-natural-accent cursor-pointer",
                                  u.role === UserRole.ADMIN ? "text-natural-tan" : u.role === UserRole.GURU_BK ? "text-natural-accent" : "text-emerald-600"
                                )}
                              >
                                <option value={UserRole.ADMIN}>Admin</option>
                                <option value={UserRole.GURU_BK}>Guru BK</option>
                                <option value={UserRole.SISWA}>Siswa</option>
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Aktif</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-6 text-right">
                          <button className="p-2 md:p-3 text-natural-muted hover:text-natural-accent hover:bg-natural-sidebar rounded-xl transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm space-y-6 md:space-y-8">
              <header className="flex items-center gap-3 border-b border-natural-border pb-4">
                <Cpu className="text-natural-accent" size={20} />
                <h3 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Intelijen Buatan (AI)</h3>
              </header>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-natural-heading">Auto-Analysis Realtime</h4>
                    <p className="text-xs text-natural-muted mt-1 max-w-[240px]">Jalankan analisis risiko secara otomatis setiap kali kuesioner diterima.</p>
                  </div>
                  <div className="w-12 h-6 bg-natural-accent rounded-full relative cursor-pointer shadow-inner shrink-0">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-natural-heading">Enhanced Privacy Masking</h4>
                    <p className="text-xs text-natural-muted mt-1 max-w-[240px]">Semua data siswa dianonimkan sebelum dikirim ke engine AI.</p>
                  </div>
                  <div className="w-12 h-6 bg-natural-sidebar border border-natural-border rounded-full relative cursor-pointer shrink-0">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm space-y-6 md:space-y-8">
              <header className="flex items-center gap-3 border-b border-natural-border pb-4">
                <Bell className="text-natural-accent" size={20} />
                <h3 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Notifikasi & Alert</h3>
              </header>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-natural-heading">Email Alert (Risiko Kritis)</h4>
                    <p className="text-xs text-natural-muted mt-1 max-w-[240px]">Kirim notifikasi email instan ke koordinator BK jika terdeteksi risiko kritis.</p>
                  </div>
                  <div className="w-12 h-6 bg-natural-accent rounded-full relative cursor-pointer shadow-inner shrink-0">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-natural-heading">Laporan Mingguan Otomatis</h4>
                    <p className="text-xs text-natural-muted mt-1 max-w-[240px]">Generate PDF summary statistik kesehatan mental sekolah setiap Senin pagi.</p>
                  </div>
                  <div className="w-12 h-6 bg-natural-accent rounded-full relative cursor-pointer shadow-inner shrink-0">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-natural-tan text-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                  <Database size={28} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-serif">Kapasitas Database</h4>
                  <p className="text-white/70 text-xs md:text-sm">Penggunaan penyimpanan Firestore: 1.2 MB / 1 GB (Spark Plan)</p>
                </div>
              </div>
              <button className="w-full sm:w-auto bg-white text-natural-tan px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-natural-sidebar transition-all shadow-xl">
                Cek Kuota Lengkap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
