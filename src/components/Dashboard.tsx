/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { AlertTriangle, AlertCircle, CheckCircle2, TrendingDown, Users, GraduationCap, BrainCircuit } from "lucide-react";
import { RiskLevel, Student } from "../types";

const MOCK_RISK_DIST = [
  { name: "Aman", value: 45, color: "#8C9B76" },
  { name: "Sangat Rendah", value: 30, color: "#D6CEB5" },
  { name: "Siaga", value: 15, color: "#B8A487" },
  { name: "Resiko Tinggi", value: 10, color: "#9C5A40" },
];

const MOCK_TREND = [
  { month: "Jan", cases: 5 },
  { month: "Feb", cases: 8 },
  { month: "Mar", cases: 12 },
  { month: "Apr", cases: 7 },
  { month: "Mei", cases: 10 },
];

interface DashboardProps {
  students: Student[];
}

export default function Dashboard({ students }: DashboardProps) {
  const stats = {
    total: students.length,
    critical: students.filter(s => s.overallRisk === RiskLevel.CRITICAL).length,
    accuracy: "94.8%",
  };

  return (
    <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto overflow-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-12">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light">Dashboard Monitoring</h2>
          <p className="text-natural-muted font-sans text-sm md:text-base underline decoration-natural-tan/50 leading-relaxed">
            Sistem cerdas telah memproses aktivitas siswa secara real-time.
          </p>
        </div>
        <div className="flex gap-4 self-end sm:self-auto">
          <div className="hidden sm:flex bg-white px-6 py-3 rounded-full border border-natural-border items-center gap-3 shadow-sm">
            <span className="text-sm font-medium text-natural-accent">Tahun Ajaran 2023/2024</span>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-natural-tan border-2 border-white shadow-sm ring-1 ring-natural-border/20"></div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: "Total Risiko Terdeteksi", value: stats.total, icon: Users, color: "text-natural-accent", bg: "bg-white", border: "border-natural-border", sub: "-12% dari minggu lalu", subColor: "text-natural-accent-light" },
          { label: "Akurasi Prediksi AI", value: stats.accuracy, icon: BrainCircuit, color: "text-natural-accent", bg: "bg-white", border: "border-natural-border", sub: "Algoritma C4.5 & K-Means", subColor: "text-natural-accent" },
          { label: "Perlu Intervensi Segera", value: stats.critical.toString().padStart(2, '0'), icon: AlertTriangle, color: "text-white", bg: "bg-natural-accent", border: "border-natural-accent", sub: "Siswa Kategori Merah", subColor: "text-white/80" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-[32px] border shadow-sm ${stat.bg} ${stat.border} transition-all hover:translate-y-[-2px]`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
            <h3 className={`text-5xl font-serif mb-4 ${stat.color}`}>{stat.value}</h3>
            <div className={`mt-4 inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full ${stat.subColor} ${stat.color === 'text-white' ? 'bg-[#6B6B54]' : 'bg-[#EBEBE2]'}`}>
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Risk Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-natural-border shadow-sm flex flex-col h-full"
        >
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-serif text-natural-heading">Trend Kebutuhan Penanganan</h4>
            <span className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Minggu 3, September</span>
          </div>
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TREND}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#8C8C78', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8C8C78', fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="cases" stroke="#5A5A40" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Alerts Sidebar within Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          <h4 className="text-xs font-bold text-natural-heading uppercase tracking-widest">Alert Terbaru</h4>
          {[
            { level: "Krisis Tinggi", time: "10:12 AM", name: "Ananda Budi Santoso", effect: "Pola isolasi diri terdeteksi pada media sosial internal sekolah.", color: "text-natural-alert" },
            { level: "Risiko Sedang", time: "09:45 AM", name: "Citra Ayu Lestari", effect: "Penurunan performa akademik drastis (Cluster C2).", color: "text-natural-tan" },
          ].map((alert, i) => (
            <div key={i} className={`bg-[#FBFBFA] border border-natural-border p-6 rounded-[24px] space-y-2 transition-all hover:bg-white`}>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className={alert.color}>{alert.level}</span>
                <span className="opacity-40">{alert.time}</span>
              </div>
              <p className="text-base font-bold text-natural-heading">{alert.name}</p>
              <p className="text-[11px] text-natural-muted italic leading-relaxed">{alert.effect}</p>
            </div>
          ))}
          <button className="w-full py-4 bg-natural-sidebar text-natural-accent rounded-[24px] text-xs font-bold border border-natural-border hover:bg-[#E1E1D6] transition-colors uppercase tracking-widest">
            Lihat Semua Notifikasi
          </button>
        </div>
      </div>
    </div>
  );
}
