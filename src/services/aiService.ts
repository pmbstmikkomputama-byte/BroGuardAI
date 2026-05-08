/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, StudentAssessment, Question } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // In AI Studio / Vite environment, prioritize process.env.GEMINI_API_KEY
    // for standard builds, and fallback to import.meta.env for Vercel client-side
    const env = (import.meta as any).env;
    const key = env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process?.env?.GEMINI_API_KEY : '');
    
    if (!key) {
      console.error("Critical: GEMINI_API_KEY is missing from environment.");
      throw new Error("AI Engine Tidak Aktif: API Key tidak terdeteksi. Untuk penggunaan di Vercel, pastikan variabel VITE_GEMINI_API_KEY telah ditambahkan di dashboard Vercel.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

export async function analyzeStudentRisk(assessment: Partial<StudentAssessment>) {
  const prompt = `Anda adalah konselor sekolah profesional dan analis data psikologis. 
  Lakukan analisis mendalam untuk siswa berikut dalam Bahasa Indonesia:
  
  Nama Siswa: ${assessment.studentName}
  NISN/ID: ${assessment.studentId}
  
  METRIK PERILAKU (Data Mining):
  - Kehadiran: ${assessment.behavioralData?.attendance}%
  - Tren Akademik: ${assessment.behavioralData?.grades_trend}
  - Tingkat Interaksi Sosial: ${assessment.behavioralData?.social_interaction}/10
  
  RESPON KUESIONER SUBJEKTIF:
  ${assessment.responses?.map((r, i) => `${i + 1}. T: ${r.question}\n   J: ${r.answer}`).join('\n')}
  
  TUGAS:
  1. Evaluasi sinergi antara data kuantitatif (kehadiran/nilai) dan respon kualitatif.
  2. Identifikasi klaster risiko tertentu (Emosional, Sosial, Akademik, atau Keluarga).
  3. Berikan ringkasan singkat kondisi psikologis siswa saat ini.
  4. Hasilkan rekomendasi yang disesuaikan dan dapat ditindaklanjuti untuk Guru BK. Rekomendasi harus spesifik pada masalah yang diidentifikasi.
  5. Tuliskan faktor risiko utama yang terdeteksi.

  PENTING: 
  - Gunakan Bahasa Indonesia yang formal, empati, dan suportif.
  - Output WAJIB dalam format JSON murni sesuai skema.
  - Jangan sertakan teks penjelasan di luar blok JSON.`;

  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: ["low", "medium", "high", "critical"],
              description: "Tingkat risiko (low/medium/high/critical)"
            },
            summary: {
              type: Type.STRING,
              description: "Ringkasan temuan dalam Bahasa Indonesia"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar rekomendasi operasional dalam Bahasa Indonesia"
            },
            factors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar faktor risiko yang teridentifikasi dalam Bahasa Indonesia"
            }
          },
          required: ["riskLevel", "summary", "recommendations", "factors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI mengembalikan respon kosong.");
    
    try {
      const cleanJson = text.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      if (!parsed.riskLevel || !parsed.summary) {
        throw new Error("Struktur JSON tidak lengkap.");
      }

      return parsed as NonNullable<StudentAssessment['aiAnalysis']>;
    } catch (parseError) {
      console.error("Gagal melakukan parsing JSON dari AI:", text);
      return getFallbackAnalysis("Format data AI tidak dikenali (Parse Error).");
    }
  } catch (e: any) {
    console.error("Error pada analyzeStudentRisk:", e);
    const errorMsg = e?.message || String(e);
    
    let userMsg = "Terjadi gangguan koneksi pada mesin AI.";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      userMsg = "Batas penggunaan AI (Quota) tercapai. Silakan coba lagi sebentar lagi.";
    } else if (errorMsg.includes("API key")) {
      userMsg = "Kunci API AI (GEMINI_API_KEY) belum terpasang dengan benar.";
    }

    return getFallbackAnalysis(userMsg);
  }
}

function getFallbackAnalysis(message: string): NonNullable<StudentAssessment['aiAnalysis']> {
  return {
    riskLevel: RiskLevel.LOW,
    summary: `INFO: ${message} Tinjauan manual oleh Guru BK sangat disarankan untuk hasil yang akurat.`,
    recommendations: ["Lakukan wawancara langsung dengan siswa", "Pantau kehadiran secara berkala"],
    factors: ["Analisis AI tidak tersedia sementara"]
  };
}

export async function generateQuestions() {
  const prompt = `Generate 25 high-quality psychological screening questions for student risk assessment in Indonesian. 
  Cover: Emotional well-being, social interaction, home life, and academic stress. 
  Questions must be empathetic and suitable for middle/high school students.
  Output ONLY a JSON array of strings.`;

  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty response");
    
    try {
      // Clean potential markdown blocks
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      const texts = JSON.parse(jsonStr) as string[];
      
      if (!Array.isArray(texts)) throw new Error("Invalid format");

      return texts.map(t => ({
        id: Math.random().toString(36).substr(2, 9),
        text: t
      })) as Question[];
    } catch (parseErr) {
      console.error("AI Parse Error:", text);
      return DEFAULT_QUESTIONS;
    }
  } catch (e: any) {
    console.error("AI Generation Failed:", e);
    const errorMsg = e?.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      console.warn("Quota exceeded, using default questions.");
    }
    return DEFAULT_QUESTIONS; // Fallback to constants if key is missing or quota hit
  }
}

const DEFAULT_QUESTIONS: Question[] = [
  { id: '1', text: "Bagaimana perasaanmu di sekolah akhir-akhir ini?" },
  { id: '2', text: "Apakah kamu sering merasa cemas tanpa alasan yang jelas?" },
  { id: '3', text: "Bagaimana hubunganmu dengan teman-teman di kelas?" },
  { id: '4', text: "Apakah kamu merasa nyaman bercerita kepada guru jika ada masalah?" },
  { id: '5', text: "Apa tantangan terbesarmu dalam belajar saat ini?" }
];
