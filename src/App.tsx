/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssessmentForm from './components/AssessmentForm';
import { AnimatePresence, motion } from 'motion/react';
import { UserRole, Question, Student, RiskLevel } from './types';
import { BrainCircuit, BookOpen, HeartPulse, ShieldCheck, MessageSquare, Menu, X, LogOut } from 'lucide-react';
import QuestionnaireManager from './components/QuestionnaireManager';
import StudentDatabase from './components/StudentDatabase';
import AIAnalytics from './components/AIAnalytics';
import { generateQuestions } from './services/aiService';

import Login from './components/Login';
import { UserProfile } from './services/userService';
import { logout } from './lib/firebase';
import Settings from './components/Settings';

const DEFAULT_QUESTIONS: Question[] = [
  { id: '1', text: "Bagaimana perasaanmu di sekolah akhir-akhir ini?" },
  { id: '2', text: "Apakah kamu merasa nyaman bercerita dengan guru atau teman?" },
  { id: '3', text: "Apa tantangan terbesarmu saat ini?" }
];

const INITIAL_STUDENTS: Student[] = [
  { 
    id: 'S1', name: "Ananda Budi Santoso", nisn: "12345001", class: "XI-A", overallRisk: RiskLevel.CRITICAL,
    attendance: 65, gradesTrend: 'declining', socialScore: 3
  },
  { 
    id: 'S2', name: "Citra Ayu Lestari", nisn: "12345002", class: "XI-B", overallRisk: RiskLevel.MEDIUM,
    attendance: 92, gradesTrend: 'stable', socialScore: 7
  },
  { 
    id: 'S3', name: "Dedi Kurniawan", nisn: "12345003", class: "XI-A", overallRisk: RiskLevel.LOW,
    attendance: 98, gradesTrend: 'improving', socialScore: 9
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [isFillingQuestionnaire, setIsFillingQuestionnaire] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Reset questionnaire state when switching tabs and close sidebar on mobile
    setIsFillingQuestionnaire(false);
    setIsSidebarOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const loadQuestions = async () => {
      const aiQuestions = await generateQuestions();
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
      }
    };
    loadQuestions();
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    setUser(userProfile);
    if (userProfile.role === UserRole.SISWA) {
      setActiveTab('self_report');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col md:flex-row font-sans selection:bg-natural-tan selection:text-natural-accent overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-natural-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-natural-accent rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <h1 className="font-serif font-bold text-lg text-natural-accent italic">BroGuardAI</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="p-2 text-natural-alert/80"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-natural-accent"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <main className="flex-1 md:ml-64 min-h-screen w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${user.role}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {activeTab === 'dashboard' && <Dashboard students={students} />}
            {activeTab === 'assessment' && <AssessmentForm questions={questions} />}
            {activeTab === 'questionnaire_config' && <QuestionnaireManager questions={questions} setQuestions={setQuestions} />}
            {activeTab === 'students' && <StudentDatabase students={students} setStudents={setStudents} />}
            
            {activeTab === 'self_report' && (
              <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
                {!isFillingQuestionnaire ? (
                  <>
                    <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 text-natural-accent mb-2">
                          <HeartPulse size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Portal Siswa Aman</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-natural-heading font-light italic">Hai! Apa kabarmu hari ini?</h2>
                        <p className="text-natural-muted mt-2 text-sm">Ruang bincang mandiri untuk mendukung kesejahteraan psikologismu.</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-natural-alert border border-natural-alert/20 hover:bg-natural-alert/5 transition-all self-end sm:self-auto"
                      >
                        <LogOut size={14} />
                        Keluar
                      </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div 
                        onClick={() => setIsFillingQuestionnaire(true)}
                        className="bg-white p-8 rounded-[40px] border border-natural-border shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-natural-accent transition-all"
                      >
                        <div className="w-16 h-16 bg-natural-sidebar rounded-full flex items-center justify-center mb-6 group-hover:bg-natural-accent group-hover:text-white transition-all text-natural-accent">
                          <MessageSquare size={32} />
                        </div>
                        <h3 className="text-xl font-serif mb-2">Isi Kuesioner Harian</h3>
                        <p className="text-sm text-natural-muted">Bagikan perasaanmu saat ini kepada BroGuardAI.</p>
                      </div>

                      <div className="bg-white p-8 rounded-[40px] border border-natural-border shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-natural-accent transition-all opacity-60">
                        <div className="w-16 h-16 bg-natural-sidebar rounded-full flex items-center justify-center mb-6 text-natural-accent">
                          <BookOpen size={32} />
                        </div>
                        <h3 className="text-xl font-serif mb-2">Edukasi Mental</h3>
                        <p className="text-sm text-natural-muted">Tips praktis mengelola kecemasan & stres.</p>
                      </div>
                    </div>

                    <div className="bg-natural-accent text-white p-10 rounded-[40px] relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-serif mb-2 italic">Butuh bantuan segera?</h3>
                        <p className="opacity-80 mb-6 font-sans">Tombol SOS akan langsung menghubungkanmu dengan Guru BK secara anonim.</p>
                        <button className="bg-natural-alert hover:bg-red-800 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all">
                          Panggil Bantuan SOS
                        </button>
                      </div>
                      <ShieldCheck size={120} className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <button 
                      onClick={() => setIsFillingQuestionnaire(false)}
                      className="text-xs font-bold text-natural-accent uppercase tracking-widest flex items-center gap-2 hover:opacity-70"
                    >
                      ← Kembali ke Menu
                    </button>
                    <AssessmentForm questions={questions} isSelfReport />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && <AIAnalytics students={students} />}
            
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
