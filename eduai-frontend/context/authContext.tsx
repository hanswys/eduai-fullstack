'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// 2. Remove any trailing slash if it exists to prevent 'http://localhost:8000//users/me'
const API_URL = BASE_URL.replace(/\/$/, '');

export interface User extends FirebaseUser {
  tokensRemaining: number;
  streakCount: number;
  lastActivityDate: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. GET THE AUTH TOKEN
          // This token is required to authenticate with your FastAPI backend
          const token = await firebaseUser.getIdToken();

          // 2. FETCH REAL DATA FROM BACKEND
          const response = await fetch(`${API_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const dbData = await response.json();
            
            // 3. MERGE FIREBASE USER WITH DB DATA
            // Note: Mapping snake_case (Python) to camelCase (JS)
            const extendedUser = Object.assign(firebaseUser, {
              tokensRemaining: dbData.tokens_remaining, 
              streakCount: dbData.streak_count,     
              lastActivityDate: null, // You can add this to the API response later
            }) as User;
            
            setUser(extendedUser);
          } else {
            console.error("Failed to fetch user profile from backend");
            // Fallback to prevent crash, but user will have 0 tokens
            const fallbackUser = Object.assign(firebaseUser, {
                tokensRemaining: 0,
                streakCount: 0,
                lastActivityDate: null
            }) as User;
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);