/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RiskLevel, StudentAssessment, Question } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // Ambil dari import.meta.env (Vite)
    const env = (import.meta as any).env;
    const key = env?.VITE_GEMINI_API_KEY || env?.GEMINI_API_KEY;
    
    if (!key) {
      console.error("VITE_GEMINI_API_KEY is missing!");
      throw new Error("KONFIGURASI DIBUTUHKAN: 1. Tambahkan VITE_GEMINI_API_KEY di Vercel. 2. PUSH kode ini ke GitHub. 3. REDEPLOY manual di Vercel Dashboard.");
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
      throw new Error("Format data AI tidak valid.");
    }
  } catch (e) {
    console.error("Error pada analyzeStudentRisk:", e);
    
    return {
      riskLevel: RiskLevel.LOW,
      summary: e instanceof Error && e.message.includes("GEMINI_API_KEY") 
        ? "Konfigurasi AI tidak ditemukan. Silakan periksa API Key."
        : `Gagal menganalisis: ${e instanceof Error ? e.message : "Kesalahan teknis"}. Silakan coba lagi.`,
      recommendations: ["Coba analisis ulang dalam beberapa saat"],
      factors: ["Kesalahan pemrosesan data AI"]
    };
  }
}

export async function generateQuestions() {
  const prompt = `Hasilkan 25 pertanyaan yang relevan secara psikologis untuk penilaian risiko siswa dalam Bahasa Indonesia.
  Pertanyaan harus mencakup berbagai domain: Kesejahteraan emosional, interaksi sosial, dinamika keluarga, dan tekanan akademik.
  Pastikan nadanya mendukung, empati, dan sesuai untuk siswa (tingkat SMP/SMA).
  Berikan output sebagai array string JSON. Contoh: ["Pertanyaan 1", "Pertanyaan 2"]`;

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
          description: "Daftar 25 pertanyaan penilaian dalam Bahasa Indonesia"
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI mengembalikan respon kosong");
    
    try {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      const texts = JSON.parse(jsonStr) as string[];
      return texts.map(text => ({
        id: Math.random().toString(36).substr(2, 9),
        text
      })) as Question[];
    } catch (parseErr) {
      console.error("Gagal parse kuesioner JSON:", text);
      throw new Error("Format data kuesioner AI tidak valid.");
    }
  } catch (e) {
    console.error("Gagal menghasilkan kuesioner AI:", e);
    throw e; // Rethrow to be caught by UI
  }
}
