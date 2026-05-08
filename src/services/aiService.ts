/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, StudentAssessment, Question } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // Mencoba mengambil dari env variabel (mendukung Vite/Vite-based platforms seperti Vercel)
    const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!key) {
      throw new Error("GEMINI_API_KEY tidak ditemukan. Jika deploy di Vercel, pastikan sudah menambahkan VITE_GEMINI_API_KEY di Environment Variables.");
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

  PENTING: Gunakan Bahasa Indonesia yang formal dan suportif.
  
  Output harus dalam format JSON sesuai skema yang diberikan.`;

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
              description: "Tingkat risiko yang dinilai"
            },
            summary: {
              type: Type.STRING,
              description: "Ringkasan temuan dalam Bahasa Indonesia"
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Langkah-langkah yang direkomendasikan dalam Bahasa Indonesia"
            },
            factors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Faktor risiko yang ditemukan dalam Bahasa Indonesia"
            }
          },
          required: ["riskLevel", "summary", "recommendations", "factors"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Kosongnya respon dari AI");
    
    // Robust JSON extraction
    const jsonStr = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(jsonStr) as NonNullable<StudentAssessment['aiAnalysis']>;
  } catch (e) {
    console.error("Gagal memproses analisis AI:", e);
    return {
      riskLevel: RiskLevel.LOW,
      summary: e instanceof Error && e.message.includes("GEMINI_API_KEY") 
        ? "Konfigurasi AI tidak ditemukan. Silakan periksa API Key."
        : "Analisis gagal karena kesalahan teknis saat memproses tanggapan.",
      recommendations: ["Coba analisis lagi nanti"],
      factors: ["Kesalahan teknis atau konfigurasi"]
    };
  }
}

export async function generateQuestions() {
  const prompt = `Hasilkan 30 pertanyaan yang relevan secara psikologis untuk penilaian risiko siswa dalam Bahasa Indonesia.
  Pertanyaan harus mencakup berbagai domain: Kesejahteraan emosional, interaksi sosial, dinamika keluarga, dan tekanan akademik.
  Pastikan nadanya mendukung, empati, dan sesuai untuk siswa (tingkat SMP/SMA).
  Berikan output sebagai array string JSON.`;

  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Daftar 30 pertanyaan penilaian dalam Bahasa Indonesia"
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Respon kosong");
    const jsonStr = text.replace(/```json\n?|```/g, "").trim();
    const texts = JSON.parse(jsonStr) as string[];
    return texts.map(text => ({
      id: Math.random().toString(36).substr(2, 9),
      text
    })) as Question[];
  } catch (e) {
    console.error("Gagal menghasilkan kuesioner AI:", e);
    return [];
  }
}
