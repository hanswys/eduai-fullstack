'use client';

import React, { useState } from 'react';
import { useAuth } from "@/context/authContext"; // 1. Import the AuthProvider

import { 
  BookOpen, 
  ArrowRight, 
  Mail, 
  Lock, 
  Loader2, 
  Github,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// // --- MOCK AUTH HOOK (DELETE IN PRODUCTION) ---
// // This mimics the behavior of your AuthContext for this preview.
// const useAuth = () => {
//   return {
//     signInWithGoogle: async () => {
//       console.log("Simulating Google Sign In...");
//       await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
//       // In a real app, the Context would update 'user' state here
//       return true;
//     }
//   };
// };
// // ---------------------------------------------

export default function LoginPage() {
  const { signInWithGoogle } = useAuth(); // Destructure the function
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- OAUTH HANDLER ---
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // On success, redirect to dashboard (Simulated)
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google. Please check your connection.');
      setIsLoading(false);
    }
  };

  // --- EMAIL HANDLER (Placeholder for now) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email/Password login is currently disabled for this beta. Please use Google.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100">
      
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">edu.ai</span>
          </a>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back
          </h2>
          <p className="text-slate-500 mt-2">
            Sign in to access your workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Auth Button */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-medium text-slate-700 bg-white disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  className="w-5 h-5" 
                  alt="Google" 
                />
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-xs text-center text-slate-400 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>

          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <a href="/" className="text-sm text-slate-400 hover:text-slate-600 transition">
            &larr; Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}