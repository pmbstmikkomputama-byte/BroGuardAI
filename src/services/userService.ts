/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserRole } from '../types';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  studentId?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null; // Will not reach here due to throw in handleFirestoreError
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, 'users', profile.uid);
  try {
    await setDoc(docRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const { updateDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { 
    role,
    updatedAt: serverTimestamp()
  });
}
