/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, ClipboardCheck, BrainCircuit, Users, Settings, LogOut, ShieldAlert, UserCircle, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";
import { UserRole } from "../types";

import { UserProfile } from "../services/userService";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.GURU_BK] },
  { id: "assessment", label: "Penilaian Sensus", icon: ClipboardCheck, roles: [UserRole.ADMIN, UserRole.GURU_BK] },
  { id: "questionnaire_config", label: "Kelola Kuesioner", icon: Settings, roles: [UserRole.ADMIN] },
  { id: "self_report", label: "Lapor Diri", icon: MessageSquare, roles: [UserRole.SISWA] },
  { id: "analytics", label: "Analisis AI", icon: BrainCircuit, roles: [UserRole.ADMIN, UserRole.GURU_BK] },
  { id: "students", label: "Database Siswa", icon: Users, roles: [UserRole.ADMIN] },
  { id: "settings", label: "Pengaturan", icon: Settings, roles: [UserRole.ADMIN] },
];

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isOpen, onClose }: SidebarProps) {
  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "w-64 h-screen bg-natural-sidebar border-r border-natural-border flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="p-8 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-natural-accent rounded-2xl flex items-center justify-center text-white shadow-sm">
          <ShieldAlert size={24} />
        </div>
        <h1 className="font-serif font-bold text-xl tracking-tight text-natural-accent italic">BroGuardAI</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto no-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
              activeTab === item.id 
                ? "bg-natural-accent text-white shadow-md shadow-natural-accent/10" 
                : "text-natural-muted hover:bg-[#E1E1D6] hover:text-natural-text"
            )}
          >
            <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-natural-muted"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-natural-border space-y-4 shrink-0">
        {/* User Info Section */}
        <div className="bg-[#E1E1D6] p-4 rounded-2xl border border-natural-border flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-xl bg-white border border-natural-border flex items-center justify-center text-natural-accent font-bold text-xs">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-natural-heading truncate">{user.name}</p>
            <p className="text-[9px] uppercase tracking-widest text-natural-muted font-bold truncate">{user.role.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="p-4 bg-[#E1E1D6] rounded-[24px] border border-natural-border">
          <p className="text-[10px] uppercase tracking-widest text-[#70705C] font-bold mb-2">Status AI Engine</p>
          <div className="flex items-center gap-2 text-xs font-medium text-natural-accent">
            <span className="w-2 h-2 bg-natural-accent-light rounded-full animate-pulse"></span>
            Mining Engine Active
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-natural-muted hover:bg-natural-alert/10 hover:text-natural-alert transition-all"
        >
          <LogOut size={20} />
          Keluar Sistem
        </button>
      </div>
    </div>
    </>
  );
}
