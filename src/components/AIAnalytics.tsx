/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { BrainCircuit, TrendingUp, AlertTriangle, ShieldCheck, Users, Search, Filter, ArrowRight, BarChart2, MessageSquare } from "lucide-react";
import { Student, RiskLevel } from "../types";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface AIAnalyticsProps {
  students: Student[];
}

export default function AIAnalytics({ students }: AIAnalyticsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = useMemo(() => {
    const total = students.length;
    const critical = students.filter(s => s.overallRisk === "critical").length;
    const high = students.filter(s => s.overallRisk === "high").length;
    const medium = students.filter(s => s.overallRisk === "medium").length;
    const low = students.filter(s => s.overallRisk === "low").length;

    const riskDistribution = [
      { name: "Kritis", value: critical, color: "#9C5A40" },
      { name: "Tinggi", value: high, color: "#B8A487" },
      { name: "Sedang", value: medium, color: "#D1C7B7" },
      { name: "Rendah", value: low, color: "#8C9B76" },
    ].filter(d => d.value > 0);

    const attendanceAvg = students.reduce((acc, s) => acc + (s.attendance || 100), 0) / (total || 1);
    const socialAvg = students.reduce((acc, s) => acc + (s.socialScore || 5), 0) / (total || 1);

    return { total, critical, high, medium, low, riskDistribution, attendanceAvg, socialAvg };
  }, [students]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (s.overallRisk === 'critical' || s.overallRisk === 'high')
  );

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10">
      <header>
        <div className="flex items-center gap-3 text-natural-accent mb-2">
          <BrainCircuit size={20} className="md:w-6 md:h-6" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Mesin Intelijen BroGuard</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light">Analisis AI & Prediksi Risiko</h2>
        <p className="text-natural-muted mt-2 font-sans italic text-sm md:text-base leading-relaxed">Deteksi dini pola perilaku anomali dan klaster kerentanan psikologis.</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Populasi", value: stats.total, icon: Users, color: "text-natural-accent" },
          { label: "Risiko Kritis", value: stats.critical, icon: AlertTriangle, color: "text-rose-600" },
          { label: "Rerata Hadir", value: `${stats.attendanceAvg.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Indeks Sosial", value: stats.socialAvg.toFixed(1), icon: MessageSquare, color: "text-natural-tan" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-natural-border shadow-sm">
            <stat.icon className={cn("mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6", stat.color)} />
            <p className="text-[10px] font-bold text-natural-muted uppercase tracking-widest truncate">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-serif text-natural-heading mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-1 bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm flex flex-col items-center">
          <h3 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-6 md:mb-8 text-center w-full border-b border-natural-border pb-4">Distribusi Tingkat Risiko</h3>
          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-[200px] mx-auto">
            {stats.riskDistribution.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] font-bold text-natural-muted uppercase tracking-widest truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Monitoring */}
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm space-y-6 md:space-y-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-natural-border pb-4 w-full">
            <h3 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} /> Prioritas Intervensi BK
            </h3>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-muted" size={14} />
              <input 
                className="w-full sm:w-auto bg-[#FBFBFA] border border-natural-border rounded-xl pl-9 pr-4 py-2 text-[10px] focus:ring-1 focus:ring-natural-accent outline-none"
                placeholder="Cari nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
            {filteredStudents.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 p-4 md:p-6 bg-[#FBFBFA] border border-natural-border rounded-2xl md:rounded-3xl group hover:border-natural-accent transition-all cursor-pointer">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-natural-border flex items-center justify-center text-xs font-bold text-natural-accent shrink-0 uppercase">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-natural-heading truncate">{s.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-natural-muted uppercase tracking-widest font-bold">Kelas {s.class}</span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block",
                        s.overallRisk === 'critical' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {s.overallRisk === 'critical' ? 'Kritis' : 'Tinggi'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between sm:justify-end gap-6 sm:gap-8 text-center w-full sm:w-auto sm:ml-auto">
                  <div>
                    <p className="text-[9px] text-natural-muted uppercase font-bold tracking-widest">Hadir</p>
                    <p className={cn("text-xs font-bold", (s.attendance || 0) < 80 ? "text-rose-600" : "text-natural-text")}>{s.attendance}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-natural-muted uppercase font-bold tracking-widest">Sosial</p>
                    <p className="text-xs font-bold">{s.socialScore}/10</p>
                  </div>
                  <button className="hidden sm:block p-3 bg-white border border-natural-border rounded-xl text-natural-muted group-hover:text-natural-accent group-hover:border-natural-accent transition-all">
                    <ArrowRight size={16} />
                  </button>
                  <button className="sm:hidden flex items-center gap-2 px-3 py-2 bg-white border border-natural-border rounded-lg text-xs font-bold text-natural-muted">
                    Detail <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="text-center py-16 bg-natural-sidebar rounded-2xl md:rounded-3xl border border-dashed border-natural-border">
                <ShieldCheck size={32} className="mx-auto mb-4 text-emerald-500 opacity-40" />
                <p className="text-sm font-serif italic text-natural-muted">Tidak ada data ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <div className="bg-natural-accent text-white p-8 md:p-12 rounded-[32px] md:rounded-[50px] shadow-2xl shadow-natural-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="relative z-10 flex flex-col items-start gap-6 md:gap-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center w-full">
            <div className="shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                <BrainCircuit size={32} className="md:w-10 md:h-10" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-xl md:text-2xl font-serif font-light tracking-tight">Rekomendasi Strategis AI</h3>
              <p className="text-white/70 text-xs md:text-sm leading-relaxed max-w-2xl font-light">
                Berdasarkan analisis klaster terbaru, terdapat tren penurunan interaksi sosial sebesar 12% di Kelas XI-A. 
                Sistem menyarankan penyelenggaraan <span className="text-white font-bold italic underline decoration-white/30 underline-offset-4">Sociometric Workshop</span> dalam 2 minggu ke depan untuk memperkuat ikatan antar siswa dan mengurangi risiko isolasi.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto bg-white text-natural-accent px-8 py-4 rounded-xl md:rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#FBFBFA] transition-all shadow-xl self-end">
            Terapkan Intervensi
          </button>
        </div>
      </div>
    </div>
  );
}
