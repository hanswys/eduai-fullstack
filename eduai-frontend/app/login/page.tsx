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

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">edu.ai</span>
          </a>
          <h2 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isLogin 
              ? 'Enter your credentials to access your workspace.' 
              : 'Join thousands of students learning smarter.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            
            {/* Social Auth */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-700 bg-white disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />}
                Google
              </button>
              <button 
                type="button"
                disabled // Disabled for now
                className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-700 bg-white opacity-60 cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-900"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-900"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
          
          {/* Footer Switcher */}
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-1 text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
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