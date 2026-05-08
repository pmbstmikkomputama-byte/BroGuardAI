/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo } from "react";
import { Upload, Download, Search, Trash2, UserPlus, Table, CheckCircle2, AlertTriangle, FileText, Users, ArrowUpDown, ChevronUp, ChevronDown, BarChart2 } from "lucide-react";
import { Student, RiskLevel } from "../types";
import Papa from "papaparse";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface StudentDatabaseProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

type SortConfig = {
  key: keyof Student;
  direction: 'asc' | 'desc';
} | null;

export default function StudentDatabase({ students, setStudents }: StudentDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'basic' | 'behavioral'>('basic');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{success: number, total: number} | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newData = results.data as any[];
        const processedStudents: Student[] = newData.map((row, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: row.Nama || row.name || `Siswa ${students.length + i + 1}`,
          nisn: row.NISN || row.nisn || row.id || "0000000",
          class: row.Kelas || row.class || "N/A",
          overallRisk: RiskLevel.LOW,
          attendance: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
          socialScore: Math.floor(Math.random() * 10) + 1,
          gradesTrend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any
        }));

        setStudents([...students, ...processedStudents]);
        setImportStatus({ success: processedStudents.length, total: processedStudents.length });
        setTimeout(() => setImportStatus(null), 5000);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSort = (key: keyof Student) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let items = [...students];
    if (sortConfig !== null) {
      items.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [students, sortConfig]);

  const filteredStudents = sortedStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm)
  );

  const SortIcon = ({ column }: { column: keyof Student }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="ml-1 text-natural-accent" /> : <ChevronDown size={12} className="ml-1 text-natural-accent" />;
  };

  const downloadTemplate = () => {
    const csv = "Nama,NISN,Kelas\nBudi Santoso,12345678,XI-A\nSiti Aminah,87654321,XI-B";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_broguard_siswa.csv';
    a.click();
  };

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return "bg-red-100 text-red-600";
      case RiskLevel.MEDIUM: return "bg-amber-100 text-amber-600";
      case RiskLevel.LOW: return "bg-emerald-100 text-emerald-600";
      case RiskLevel.CRITICAL: return "bg-rose-100 text-rose-600 font-bold";
      default: return "bg-slate-100 text-slate-400";
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light">Basis Data Siswa</h2>
          <p className="text-natural-muted mt-2 font-sans italic text-sm md:text-base leading-relaxed">Kumpulan data terpusat untuk monitoring risiko psikologis massal.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="bg-natural-sidebar p-1 rounded-xl md:rounded-2xl flex gap-1 w-fit">
            <button 
              onClick={() => setViewMode('basic')}
              className={cn(
                "px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'basic' ? "bg-white text-natural-accent shadow-sm" : "text-natural-muted hover:text-natural-accent"
              )}
            >
              Info Dasar
            </button>
            <button 
              onClick={() => setViewMode('behavioral')}
              className={cn(
                "px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === 'behavioral' ? "bg-white text-natural-accent shadow-sm" : "text-natural-muted hover:text-natural-accent"
              )}
            >
              Analisis Perilaku
            </button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={downloadTemplate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-natural-border text-natural-muted text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-natural-sidebar transition-all"
            >
              <Download size={14} className="md:w-4 md:h-4" /> Template
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-natural-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl shadow-lg shadow-natural-accent/10 hover:bg-[#4A4A35] transition-all"
            >
              <Upload size={14} className="md:w-4 md:h-4" /> Impor
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
        </div>
      </header>

      <AnimatePresence>
        {importStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700"
          >
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">Berhasil mengimpor {importStatus.success} data siswa baru.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-natural-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-6">
          <div className="w-full sm:flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-muted" size={18} />
            <input 
              className="w-full bg-[#FBFBFA] border border-natural-border rounded-xl md:rounded-2xl pl-12 pr-6 py-3 md:py-4 text-sm focus:ring-1 focus:ring-natural-accent outline-none transition-all"
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] md:text-xs font-bold text-natural-muted uppercase tracking-widest whitespace-nowrap">
            {viewMode === 'basic' ? <Users size={16} /> : <BarChart2 size={16} />}
            {filteredStudents.length} Siswa Terdaftar
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#FBFBFA] border-b border-natural-border">
                <th className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest w-12">No</th>
                <th 
                  className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Nama Lengkap <SortIcon column="name" /></div>
                </th>
                <th 
                  className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                  onClick={() => handleSort('nisn')}
                >
                  <div className="flex items-center">NISN <SortIcon column="nisn" /></div>
                </th>
                
                {viewMode === 'basic' ? (
                  <>
                    <th 
                      className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                      onClick={() => handleSort('class')}
                    >
                      <div className="flex items-center">Kelas <SortIcon column="class" /></div>
                    </th>
                    <th 
                      className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                      onClick={() => handleSort('overallRisk')}
                    >
                      <div className="flex items-center">Status Terakhir <SortIcon column="overallRisk" /></div>
                    </th>
                  </>
                ) : (
                  <>
                    <th 
                      className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                      onClick={() => handleSort('attendance')}
                    >
                      <div className="flex items-center">Kehadiran (%) <SortIcon column="attendance" /></div>
                    </th>
                    <th 
                      className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                      onClick={() => handleSort('gradesTrend')}
                    >
                      <div className="flex items-center">Tren Nilai <SortIcon column="gradesTrend" /></div>
                    </th>
                    <th 
                      className="px-6 md:px-8 py-5 text-left text-[10px] font-bold text-natural-muted uppercase tracking-widest cursor-pointer hover:text-natural-accent transition-colors"
                      onClick={() => handleSort('socialScore')}
                    >
                      <div className="flex items-center">Interaksi Sosial <SortIcon column="socialScore" /></div>
                    </th>
                  </>
                )}
                
                <th className="px-6 md:px-8 py-5 text-center text-[10px] font-bold text-natural-muted uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-natural-border">
              {filteredStudents.map((s, i) => (
                <tr key={s.id} className="hover:bg-[#FBFBFA] transition-colors group">
                  <td className="px-6 md:px-8 py-5 text-xs text-natural-muted font-bold">#0{i + 1}</td>
                  <td className="px-6 md:px-8 py-5">
                    <p className="text-sm font-bold text-natural-heading">{s.name}</p>
                  </td>
                  <td className="px-6 md:px-8 py-5 text-sm text-natural-text font-mono tracking-tighter opacity-70 italic">{s.nisn}</td>
                  
                  {viewMode === 'basic' ? (
                    <>
                      <td className="px-6 md:px-8 py-5 text-sm text-natural-text font-medium">{s.class}</td>
                      <td className="px-6 md:px-8 py-5 text-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          getRiskColor(s.overallRisk)
                        )}>
                          {s.overallRisk || "Belum Dinilai"}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 md:px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-natural-sidebar rounded-full overflow-hidden w-16">
                            <div 
                              className={cn("h-full transition-all", (s.attendance || 0) < 80 ? "bg-natural-alert" : "bg-natural-accent")} 
                              style={{ width: `${s.attendance || 0}%` }} 
                            />
                          </div>
                          <span className="text-xs font-bold text-natural-text">{s.attendance || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                          s.gradesTrend === 'improving' ? "text-emerald-600 bg-emerald-50" : 
                          s.gradesTrend === 'declining' ? "text-rose-600 bg-rose-50" : 
                          "text-amber-600 bg-amber-50"
                        )}>
                          {s.gradesTrend || 'Stable'}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "w-1.5 h-3 rounded-sm",
                                i < (s.socialScore || 0) ? "bg-natural-accent" : "bg-natural-sidebar"
                              )} 
                            />
                          ))}
                        </div>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 md:px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2 group-hover:opacity-100 sm:opacity-0 transition-all">
                      <button className="p-2 text-natural-muted hover:text-natural-accent hover:bg-natural-sidebar rounded-lg transition-all" title="Detail Siswa">
                        <FileText size={16} />
                      </button>
                      <button className="p-2 text-natural-muted hover:text-natural-alert hover:bg-natural-alert/10 rounded-lg transition-all" title="Hapus Data">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={viewMode === 'basic' ? 6 : 7} className="px-8 py-20 text-center text-natural-muted">
                    <div className="flex flex-col items-center gap-4">
                      <Table size={40} className="opacity-10" />
                      <p className="text-sm italic font-serif">Tidak ada data siswa ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 md:p-8 bg-[#FBFBFA] border-t border-natural-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-[10px] text-natural-muted italic">Record tersinkronisasi otomatis dengan AI Engine BroGuard.</p>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-natural-sidebar border border-natural-border text-natural-accent text-[10px] font-bold uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-[#E1E1D6] transition-all">
            <UserPlus size={14} /> Tambah Manual
          </button>
        </div>
      </div>
    </div>
  );
}
