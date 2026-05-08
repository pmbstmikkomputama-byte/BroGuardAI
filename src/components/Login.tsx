/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { LogIn, ShieldCheck, GraduationCap, Users, BrainCircuit, HeartPulse } from "lucide-react";
import { UserRole } from "../types";
import { signInWithGoogle } from "../lib/firebase";
import { getUserProfile, createUserProfile, UserProfile } from "../services/userService";
import { cn } from "../lib/utils";

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    const demoUser: UserProfile = {
      uid: `demo-${role}`,
      email: `${role}@demo.broguard.ai`,
      role: role,
      name: `Demo ${role === UserRole.ADMIN ? 'Administrator' : role === UserRole.GURU_BK ? 'Guru BK' : 'Siswa'}`,
      studentId: role === UserRole.SISWA ? 'S1' : undefined
    };
    onLogin(demoUser);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      let profile = await getUserProfile(user.uid);
      
      if (!profile) {
        // Super Admin enforcement
        const isAdmin = user.email === 'pmbstmikkomputama@gmail.com';
        
        profile = {
          uid: user.uid,
          email: user.email || "",
          role: isAdmin ? UserRole.ADMIN : UserRole.GURU_BK,
          name: user.displayName || "User"
        };
        await createUserProfile(profile);
      } else if (user.email === 'pmbstmikkomputama@gmail.com' && profile.role !== UserRole.ADMIN) {
        // Ensure super admin always has admin role even if it changed in DB
        profile.role = UserRole.ADMIN;
      }
      
      onLogin(profile);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      
      let msg = "Gagal login. Pastikan domain 'broguardai.vercel.app' sudah didaftarkan di Firebase Console.";
      
      if (err.code === "auth/popup-blocked") {
        msg = "Popup login diblokir! Izinkan popup di pengaturan browser Anda (cek ikon gembok di address bar).";
      } else if (err.code === "auth/unauthorized-domain") {
        msg = "DOMAIN BELUM TERDAFTAR: Anda HARUS menambahkan 'broguardai.vercel.app' ke 'Authorized Domains' di Firebase Console (Authentication > Settings).";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "GOOGLE LOGIN NONAKTIF: Aktifkan metode login Google di Firebase Console (Authentication > Sign-in method).";
      } else if (err.message) {
        msg = `Gagal: ${err.message}`;
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-4 md:p-6 selection:bg-natural-tan selection:text-natural-accent">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px] md:rounded-[64px] border border-natural-border shadow-2xl shadow-natural-accent/5 overflow-hidden">
        
        {/* Left Side: Branding */}
        <div className="bg-natural-accent p-8 md:p-16 text-white flex flex-col justify-between relative overflow-hidden min-h-[300px] md:min-h-0">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-natural-tan/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8 md:mb-12">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <BrainCircuit className="md:w-7 md:h-7" size={24} />
              </div>
              <h1 className="text-xl md:text-2xl font-serif tracking-tight">BroGuardAI</h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight">
                Melindungi Masa Depan <br />
                <span className="italic">Melalui Empati Digital.</span>
              </h2>
              <p className="mt-4 md:mt-8 text-white/70 text-sm md:text-lg font-light max-w-md leading-relaxed">
                Sistem monitoring risiko psikologis siswa berbasis AI untuk deteksi dini dan intervensi yang lebih cerdas.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 hidden md:flex items-center gap-4 py-8 border-t border-white/10 mt-12 bg-white/5 backdrop-blur-sm -mx-16 px-16">
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-natural-accent bg-natural-tan overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="Avatar" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/80">740+ Siswa Terpantau Hari Ini</p>
          </div>
        </div>

        {/* Right Side: Login Options */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8 md:space-y-10">
            <header>
              <h3 className="text-2xl md:text-3xl font-serif text-natural-heading italic mb-2">Selamat Datang</h3>
              <p className="text-natural-muted font-sans text-xs md:text-sm">Pilih akun demo untuk eksplorasi atau masuk dengan Google.</p>
            </header>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-natural-muted uppercase tracking-[0.2em]">Akun Demo (Akses Instan)</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { role: UserRole.GURU_BK, label: "Guru BK (Konselor)", icon: HeartPulse, color: "hover:border-natural-accent" },
                  { role: UserRole.ADMIN, label: "Administrator", icon: ShieldCheck, color: "hover:border-natural-tan" },
                  { role: UserRole.SISWA, label: "Siswa (Mandiri)", icon: GraduationCap, color: "hover:border-emerald-500" },
                ].map((demo) => (
                  <button
                    key={demo.role}
                    onClick={() => handleDemoLogin(demo.role)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-3xl border border-natural-border bg-white transition-all text-left group",
                      demo.color
                    )}
                  >
                    <div className="w-12 h-12 bg-natural-sidebar rounded-2xl flex items-center justify-center text-natural-muted group-hover:bg-natural-accent group-hover:text-white transition-all">
                      <demo.icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-natural-heading">{demo.label}</p>
                      <p className="text-[10px] text-natural-muted uppercase tracking-widest">Klik untuk Masuk</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-natural-border"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-natural-muted">Atau Gunakan Akun Riil</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 p-5 rounded-3xl border border-natural-border bg-white hover:bg-natural-sidebar transition-all group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-natural-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                  <span className="text-sm font-bold text-natural-heading">Masuk dengan Google</span>
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-rose-600 font-bold text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                {error}
              </p>
            )}
            
            <footer className="text-center">
              <p className="text-[10px] text-natural-muted uppercase tracking-widest">
                &copy; 2026 BroGuardAI • Integrated Mental Health System
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
