/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, StudentAssessment, Question, RiskLevel } from '../types';

// Students
export async function getStudents(): Promise<Student[]> {
  const path = 'students';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export function subscribeToStudents(callback: (students: Student[]) => void) {
  const path = 'students';
  const q = query(collection(db, path), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    callback(students);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function saveStudent(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), {
      ...student,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Assessments
export async function saveAssessment(assessment: StudentAssessment): Promise<string> {
  const path = 'assessments';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...assessment,
      timestamp: Timestamp.now()
    });
    
    // Update student's last assessment (only if guru_bk or if we allow limited student update)
    try {
      await setDoc(doc(db, 'students', assessment.studentId), {
        lastAssessmentDate: new Date().toISOString(),
        overallRisk: assessment.aiAnalysis?.riskLevel || RiskLevel.LOW,
        attendance: assessment.behavioralData.attendance,
        gradesTrend: assessment.behavioralData.grades_trend,
        socialScore: assessment.behavioralData.social_interaction
      }, { merge: true });
    } catch (studentUpdateError) {
      console.warn("Could not update student dashboard record directly. This is expected for student accounts.", studentUpdateError);
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return "";
  }
}

export async function getAssessments(studentId?: string): Promise<StudentAssessment[]> {
  const path = 'assessments';
  try {
    let q = query(collection(db, path), orderBy('timestamp', 'desc'));
    if (studentId) {
      q = query(q, where('studentId', '==', studentId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        ...data, 
        id: doc.id,
        timestamp: (data.timestamp as Timestamp).toDate().toISOString()
      } as StudentAssessment;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// Questions
export async function getStoredQuestions(): Promise<Question[]> {
  const path = 'questions';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveQuestions(questions: Question[]): Promise<void> {
  const path = 'questions';
  try {
    // This is simple for now, we could do a batch update
    for (const q of questions) {
      await setDoc(doc(db, 'questions', q.id), q);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
