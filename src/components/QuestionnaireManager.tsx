/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Plus, Trash2, Save, HelpCircle, BrainCircuit, Loader2 } from "lucide-react";
import { Question } from "../types";
import { motion } from "motion/react";
import { generateQuestions } from "../services/aiService";

interface QuestionnaireManagerProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export default function QuestionnaireManager({ questions, setQuestions }: QuestionnaireManagerProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleAIDeploy = async () => {
    setGenerating(true);
    try {
      const aiQuestions = await generateQuestions();
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      }
    } catch (error: any) {
      console.error("Error generating questions:", error);
      alert(error.message || "Gagal menghasilkan kuesioner AI. Silakan periksa koneksi internet atau API Key Anda.");
    } finally {
      setGenerating(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    const q: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: newQuestion
    };
    setQuestions([...questions, q]);
    setNewQuestion("");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif text-natural-heading font-light">Kelola Kuesioner</h2>
          <p className="text-natural-muted mt-2 font-sans italic">Definisikan pertanyaan yang akan diajukan kepada siswa selama proses sensus.</p>
        </div>
        <button 
          onClick={handleAIDeploy}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 bg-natural-sidebar border border-natural-border text-natural-accent text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#E1E1D6] transition-all disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
          Generate 30 Pertanyaan AI
        </button>
      </header>

      <div className="bg-white p-10 rounded-[40px] border border-natural-border shadow-sm space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-natural-accent uppercase tracking-widest flex items-center gap-2 border-b border-natural-border pb-2">
            <Plus size={14} /> Tambah Pertanyaan Baru
          </label>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-[#FBFBFA] border border-natural-border rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-muted/50"
              placeholder="Tuliskan pertanyaan di sini..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
            />
            <button 
              onClick={addQuestion}
              className="bg-natural-accent text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-natural-accent/10 hover:bg-[#4A4A35] transition-all"
            >
              Tambah
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-natural-muted uppercase tracking-widest flex items-center gap-2 border-b border-natural-border pb-2">
            <HelpCircle size={14} /> Daftar Pertanyaan Saat Ini
          </label>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={q.id}
                className="flex items-center gap-4 p-5 bg-[#FBFBFA] border border-natural-border rounded-2xl group hover:border-natural-accent/30 transition-all"
              >
                <span className="text-[10px] font-bold text-natural-muted/40 w-6">#0{index + 1}</span>
                <p className="flex-1 text-sm text-natural-text font-serif italic">{q.text}</p>
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="text-natural-muted hover:text-natural-alert opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            {questions.length === 0 && (
              <p className="text-center py-10 text-natural-muted text-sm italic font-serif">Belum ada pertanyaan. Silakan tambahkan pertanyaan baru.</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-natural-border flex justify-between items-center">
          <p className="text-[10px] text-natural-muted italic">Perubahan akan langsung berpengaruh pada formulir penilaian dan portal siswa.</p>
          <div className="flex items-center gap-2 text-natural-accent-light font-bold text-[10px] uppercase tracking-widest">
            <Save size={14} /> Sistem Terintegrasi
          </div>
        </div>
      </div>
    </div>
  );
}
