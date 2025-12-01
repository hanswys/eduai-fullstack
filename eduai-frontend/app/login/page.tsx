'use client';

import React, { useState } from 'react';
import { useAuth } from "@/context/authContext"; 

import { 
  ArrowLeft,
  Loader2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

// --- DECORATIVE COMPONENT (Matches Landing Page) ---
const GridPattern = () => (
  <svg className="absolute inset-0 -z-10 h-full w-full stroke-slate-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
    <defs>
      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M.5 40V.5H40" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
  </svg>
);

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- OAUTH HANDLER ---
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // On success, redirect is usually handled by the provider or a protected route wrapper
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden">
      
      {/* Background Texture */}
      <GridPattern />
      
      {/* Ambient Gradient */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition group">
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-200 group-hover:scale-110 transition duration-300">
              <span className="font-serif font-bold italic text-xl lowercase">e</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">edufy</span>
          </a>
          
          <h2 className="text-3xl font-serif text-slate-900">
            Welcome back
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Resume your learning journey.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden relative">
          
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-slate-900 to-orange-400 opacity-20"></div>

          <div className="p-8 pt-10">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-sm text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Auth Button */}
            <div className="space-y-4">
               <button 
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  type="button"
                  className="group relative w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-300 font-medium text-slate-700 bg-white disabled:opacity-50 shadow-sm hover:shadow-md hover:border-slate-300"
               >
                  {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
                  ) : (
                  <img 
                     src="https://www.svgrepo.com/show/475656/google-color.svg" 
                     className="w-5 h-5 group-hover:scale-110 transition-transform" 
                     alt="Google" 
                  />
                  )}
                  {isLoading ? 'Connecting...' : 'Continue with Google'}
               </button>

               <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-slate-400 uppercase tracking-widest">Secure Login</span>
                  <div className="flex-grow border-t border-slate-100"></div>
               </div>

               <div className="text-center">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-semibold tracking-wide uppercase">
                     <Sparkles className="w-3 h-3" />
                     <span>Private Beta Access</span>
                   </div>
               </div>
            </div>

            <p className="text-xs text-center text-slate-400 mt-8 leading-relaxed">
              By continuing, you agree to Edufy's <br/>
              <a href="#" className="underline decoration-slate-300 hover:text-slate-600">Terms</a> and <a href="#" className="underline decoration-slate-300 hover:text-slate-600">Privacy Policy</a>.
            </p>

          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors duration-300 font-medium group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}