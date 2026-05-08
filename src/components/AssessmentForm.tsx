/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Loader2, CheckCircle2, ChevronRight, AlertTriangle, MessageSquare, Users, BarChart, ShieldAlert } from "lucide-react";
import { analyzeStudentRisk } from "../services/aiService";
import { saveAssessment } from "../services/dbService";
import { StudentAssessment, RiskLevel, Question } from "../types";
import { cn } from "../lib/utils";

interface AssessmentFormProps {
  questions: Question[];
  isSelfReport?: boolean;
}

export default function AssessmentForm({ questions, isSelfReport = false }: AssessmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudentAssessment | null>(null);
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    attendance: 100,
    grades: "stable" as 'improving' | 'stable' | 'declining',
    social: 5,
  });
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Initialize answers when questions change
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    questions.forEach(q => {
      initialAnswers[q.id] = "";
    });
    setAnswers(initialAnswers);
  }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare assessment data
      const assessmentData: Partial<StudentAssessment> = {
        studentName: formData.studentName,
        studentId: formData.studentId,
        timestamp: new Date().toISOString(),
        behavioralData: isSelfReport ? {
          attendance: 100, // Default for self-report
          grades_trend: 'stable',
          social_interaction: 5
        } : {
          attendance: formData.attendance,
          grades_trend: formData.grades,
          social_interaction: formData.social
        },
        responses: questions.map(q => ({
          question: q.text,
          answer: answers[q.id] || ""
        }))
      };
      
      const analysis = await analyzeStudentRisk(assessmentData);
      
      if (analysis.summary.includes("Gagal menganalisis")) {
        throw new Error(analysis.summary);
      }
      
      const fullAssessment: StudentAssessment = {
        ...assessmentData,
        id: "", // Will be assigned by Firestore
        aiAnalysis: analysis
      } as StudentAssessment;

      // Save to Firestore
      await saveAssessment(fullAssessment);
      
      if (isSelfReport) {
        setSubmitted(true);
      } else {
        setResult(fullAssessment);
      }
    } catch (error: any) {
      console.error("Gagal menyimpan asesmen:", error);
      
      let errorMessage = "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.";
      
      try {
        // Try to parse detailed error info from dbService
        const errorInfo = JSON.parse(error.message);
        if (errorInfo.operationType === 'write') {
          if (errorInfo.error.includes("permission-denied") || errorInfo.error.includes("insufficient permissions")) {
            errorMessage = "Gagal menyimpan: Izin ditolak. Pastikan data siswa (ID) sudah terdaftar di database atau Anda memiliki akses Guru BK.";
          } else {
            errorMessage = `Gagal menyimpan data ke Firestore: ${errorInfo.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error message, or different format
        if (error.message) errorMessage = `Kesalahan: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "text-[#8C9B76] bg-[#F0F5E8] border-[#8C9B76]/20";
      case "medium": return "text-[#B8A487] bg-[#F9F6F0] border-[#B8A487]/20";
      case "high": return "text-[#9C5A40] bg-[#FDF5F2] border-[#9C5A40]/20";
      case "critical": return "text-red-700 bg-red-50 border-red-200";
      default: return "text-natural-muted bg-natural-sidebar";
    }
  };

  if (submitted && isSelfReport) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[40px] border border-natural-border shadow-sm text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-3xl font-serif text-natural-heading mb-4 italic">Terima Kasih, {formData.studentName}!</h3>
        <p className="text-natural-muted leading-relaxed mb-10">
          Suaramu sangat berharga. Data ini akan membantu kami memahamimu lebih baik.
          Guru BK akan meninjau ceritamu dan menghubungimu jika diperlukan.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setFormData({ studentName: "", studentId: "", attendance: 100, grades: "stable", social: 5 });
            setAnswers({});
          }}
          className="px-10 py-4 bg-natural-accent text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]"
        >
          Isi Ulang Kuesioner
        </button>
      </motion.div>
    );
  }

  return (
    <div className={cn("p-6 md:p-10", isSelfReport ? "max-w-3xl mx-auto" : "max-w-5xl mx-auto")}>
      <header className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light">
          {isSelfReport ? "Bercerita pada BroGuardAI" : "Sensus & Penilaian Risiko"}
        </h2>
        <p className="text-natural-muted mt-2 italic font-sans text-sm md:text-base">
          {isSelfReport 
            ? "Bagikan kondisimu dengan jujur. Ruang ini aman dan didukung oleh kecerdasan buatan."
            : "Masukkan data perilaku dan kuesioner siswa untuk dianalisis oleh BroGuardAI."}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
        {/* Form Container */}
        <div className={cn("space-y-6", isSelfReport ? "lg:col-span-12" : "lg:col-span-3")}>
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-natural-border shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest flex items-center gap-2 border-b border-natural-border pb-2">
                <Users size={14} /> Data Diri Siswa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Nama Lengkap</label>
                  <input 
                    required
                    className="w-full bg-[#FBFBFA] border border-natural-border rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-muted/50"
                    placeholder="Masukkan nama Anda..."
                    value={formData.studentName}
                    onChange={e => setFormData({...formData, studentName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">NISN / ID Siswa</label>
                  <input 
                    required
                    className="w-full bg-[#FBFBFA] border border-natural-border rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-muted/50"
                    placeholder="00XXXXXX"
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {!isSelfReport && (
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest flex items-center gap-2 border-b border-natural-border pb-2">
                  <BarChart size={14} /> Data Mining Perilaku
                </h3>
                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest text-wrap">Persentase Kehadiran ({formData.attendance}%)</label>
                    </div>
                    <input 
                      type="range"
                      className="w-full accent-natural-accent"
                      min="0" max="100"
                      value={formData.attendance}
                      onChange={e => setFormData({...formData, attendance: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Tren Nilai</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['improving', 'stable', 'declining'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({...formData, grades: t as any})}
                          className={cn(
                            "px-4 py-3 text-[10px] md:text-xs rounded-xl border transition-all font-bold uppercase tracking-wider whitespace-nowrap",
                            formData.grades === t 
                              ? "bg-natural-accent text-white border-natural-accent shadow-md shadow-natural-accent/20" 
                              : "bg-[#FBFBFA] border-natural-border text-natural-muted hover:border-natural-accent/40"
                          )}
                        >
                          {t === 'improving' ? 'Meningkat' : t === 'stable' ? 'Stabil' : 'Menurun'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Interaksi Sosial (Skala 1-10)</label>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({...formData, social: n})}
                          className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-xl text-xs font-bold transition-all border shrink-0",
                            formData.social === n 
                              ? "bg-natural-accent text-white border-natural-accent shadow-md" 
                              : "bg-[#FBFBFA] border-natural-border text-natural-muted hover:bg-white"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest flex items-center gap-2 border-b border-natural-border pb-2">
                <MessageSquare size={14} /> Pertanyaan Kuesioner
              </h3>
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="text-xs font-bold text-natural-heading">{q.text}</label>
                  <textarea 
                    required={isSelfReport}
                    className="w-full bg-[#FBFBFA] border border-natural-border rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-natural-accent outline-none transition-all resize-none h-24 font-sans text-natural-text placeholder:italic"
                    placeholder="Tuliskan jawaban atau ceritamu di sini..."
                    value={answers[q.id] || ""}
                    onChange={e => {
                      setAnswers(prev => ({
                        ...prev,
                        [q.id]: e.target.value
                      }));
                    }}
                  />
                </div>
              ))}
              {questions.length === 0 && (
                <p className="text-sm italic text-natural-muted font-serif">Tidak ada kuesioner tambahan saat ini.</p>
              )}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-natural-accent hover:bg-[#4A4A35] text-white py-5 rounded-[24px] font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-natural-accent/10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Mengirimkan Jawaban...
                </>
              ) : (
                <>
                  {isSelfReport ? <ShieldAlert size={18} /> : <BrainCircuit size={18} />}
                  {isSelfReport ? "Kirimkan Kondisi Saya" : "Jalankan Analisis AI"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Insight Container (Counselor Only) */}
        {!isSelfReport && (
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full border border-natural-border rounded-[40px] flex flex-col items-center justify-center p-12 text-center text-natural-muted bg-[#FBFBFA]"
                >
                  <div className="w-16 h-16 bg-natural-sidebar rounded-full flex items-center justify-center mb-6">
                    <BrainCircuit size={32} className="opacity-40" />
                  </div>
                  <h4 className="text-lg font-serif mb-2">Sistem Siap</h4>
                  <p className="text-xs font-sans max-w-[200px] leading-relaxed">Gunakan formulir disamping untuk memproses data psikologis siswa.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key={result.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-natural-border rounded-[32px] md:rounded-[40px] overflow-hidden shadow-xl shadow-natural-accent/5 h-fit sticky top-10"
                >
                  <div className={`p-6 md:p-10 border-b flex items-center justify-between ${getRiskColor(result.aiAnalysis?.riskLevel || "")}`}>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-70">Tingkat Risiko</label>
                      <h3 className="text-2xl md:text-3xl font-serif tracking-tight mt-1">{result.aiAnalysis?.riskLevel}</h3>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/50 flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <ShieldAlert className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>

                  <div className="p-6 md:p-10 space-y-8 md:space-y-10">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Kesimpulan AI</h4>
                      <p className="text-sm md:text-base text-natural-heading leading-relaxed font-serif font-light">{result.aiAnalysis?.summary}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Faktor Pemicu</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.aiAnalysis?.factors.map((f, i) => (
                          <span key={i} className="text-[10px] font-bold px-3 py-1.5 bg-natural-sidebar text-natural-accent rounded-lg border border-natural-border/30 uppercase tracking-wider">{f}</span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Rekomendasi Tindakan</h4>
                      <ul className="space-y-3">
                        {result.aiAnalysis?.recommendations.map((r, i) => (
                          <li key={i} className="flex gap-4 text-xs md:text-sm text-natural-heading/80 font-sans leading-relaxed group">
                            <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-natural-accent transition-transform group-hover:scale-150" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8 md:pt-10 border-t border-natural-border flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-natural-tan flex items-center justify-center text-white text-[10px] md:text-sm font-bold shadow-sm shrink-0">BK</div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-natural-muted uppercase font-bold tracking-widest truncate">Status Penanganan</p>
                        <p className="text-xs md:text-sm font-bold text-natural-heading truncate">Menunggu Review Konselor</p>
                      </div>
                      <button className="ml-auto w-8 h-8 md:w-10 md:h-10 bg-natural-sidebar rounded-full flex items-center justify-center text-natural-muted hover:text-natural-accent hover:bg-natural-accent/10 transition-all border border-natural-border shrink-0">
                        <CheckCircle2 size={16} className="md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
