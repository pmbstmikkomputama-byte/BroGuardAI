/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum UserRole {
  ADMIN = "admin",
  GURU_BK = "guru_bk",
  SISWA = "siswa"
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  class: string;
  lastAssessmentDate?: string;
  overallRisk?: RiskLevel;
  attendance?: number;
  gradesTrend?: 'improving' | 'stable' | 'declining';
  socialScore?: number;
}

export interface Question {
  id: string;
  text: string;
}

export interface StudentAssessment {
  id: string;
  studentName: string;
  studentId: string;
  timestamp: string;
  responses: {
    question: string;
    answer: string | number;
  }[];
  behavioralData: {
    attendance: number; // percentage
    grades_trend: 'improving' | 'stable' | 'declining';
    social_interaction: number; // 1-10
  };
  aiAnalysis?: {
    riskLevel: RiskLevel;
    summary: string;
    recommendations: string[];
    factors: string[];
  };
}

export interface DashboardStats {
  totalStudents: number;
  riskDistribution: {
    level: RiskLevel;
    count: number;
  }[];
  trendData: {
    month: string;
    cases: number;
  }[];
}
