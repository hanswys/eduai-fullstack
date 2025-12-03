'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X,
  Globe,
  CheckCircle2, 
  Library,
  Languages,
  Clock,
  FileQuestion,
  AlertCircle
} from 'lucide-react';

// --- DECORATIVE COMPONENTS ---
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

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      
      {/* Background Texture - The "Graph Paper" Academic Look */}
      <GridPattern />
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FDFCF8] to-transparent z-40 pointer-events-none"></div>

      {/* Floating Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 shadow-sm shadow-slate-200/50 w-full max-w-4xl flex justify-between items-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white">
              <span className="font-serif font-bold italic text-lg lowercase">e</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">edufy</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#problem" className="hover:text-slate-900 transition-colors">The Problem</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Methodology</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900">Sign in</a>
            <a href="/login" className="bg-slate-900 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Try for free
            </a>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-1 text-slate-600">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-10">
          <div className="flex flex-col gap-6 text-2xl font-serif text-slate-900">
            <a href="#problem" onClick={() => setIsMenuOpen(false)}>The Problem</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Methodology</a>
            <a href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</a>
            <a href="/signup" className="text-orange-600" onClick={() => setIsMenuOpen(false)}>Try for free</a>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <main className="relative z-10 pt-48 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>New: AI Visual Generation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-medium text-slate-900 tracking-tight leading-[1] text-balance">
            Turn confusion into <br />
            <span className="italic text-slate-400">comprehension.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Edufy transforms complex lectures into clear visuals and translates textbooks instantly. The new standard for modern study.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
             <a href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Try for free <ArrowRight className="w-4 h-4" />
             </a>
             <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition flex items-center justify-center">
                See how it works
             </a>
          </div>
        </div>
      </main>

      {/* PROBLEM SECTION (Replaces Waitlist) */}
      <section id="problem" className="py-20 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">The Current State</h2>
               <h3 className="text-3xl md:text-4xl font-serif text-slate-900">Why studying feels impossible.</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {/* Pain Point 1 */}
               <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition duration-300">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                     <FileQuestion className="w-6 h-6 text-red-500" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Information Overload</h4>
                  <p className="text-slate-500 leading-relaxed">
                     You have 2 hours to digest 50 pages of dense text. Traditional note-taking is too slow to keep up with the volume of information.
                  </p>
               </div>

               {/* Pain Point 2 */}
               <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition duration-300">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                     <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Language Barriers</h4>
                  <p className="text-slate-500 leading-relaxed">
                     Textbooks are often written in complex academic language or foreign tongues, making simple concepts unnecessarily hard to decode.
                  </p>
               </div>

               {/* Pain Point 3 */}
               <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition duration-300">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                     <Clock className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Disorganized Chaos</h4>
                  <p className="text-slate-500 leading-relaxed">
                     Notes scattered across three notebooks and five apps. When exam time comes, you spend more time finding notes than actually studying.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-100">
        <div className="mb-12 pt-12">
          <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">The Solution</h2>
          <p className="text-slate-500">Your academic superpowers, unlocked.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[500px]">
          
          {/* Feature 1: Large Card (Visual Notes) */}
          <div className="md:col-span-2 group relative bg-[#F6F5F0] rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-slate-200/50 hover:border-orange-200 transition-colors duration-500 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                <Library className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-3xl font-serif text-slate-900 mb-3">Transcript to Diagram</h3>
              <p className="text-slate-600 max-w-md text-lg">
                Don't just read the lecture. See it. Our engine converts dense audio transcripts into structured, easy-to-study knowledge maps.
              </p>
            </div>
            
            {/* Visual Decoration */}
            <div className="absolute right-[-50px] bottom-[-50px] md:right-[-20px] md:bottom-[-20px] w-64 h-64 bg-white rounded-3xl border border-slate-200 shadow-xl transform rotate-[-10deg] group-hover:rotate-[-5deg] group-hover:translate-y-[-10px] transition duration-500 flex items-center justify-center p-6">
               <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-slate-200 w-20 h-20" />
               </div>
            </div>
          </div>

          {/* Feature 2: Tall Card (Translation) */}
          <div className="md:col-span-1 group relative bg-slate-900 rounded-[2.5rem] p-8 md:p-10 overflow-hidden text-white flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-orange-300" />
                </div>
                <h3 className="text-2xl font-serif mb-3">EduLens</h3>
                <p className="text-slate-400 leading-relaxed">
                  Snap a photo of any textbook. We extract the text and translate it into your native language instantly.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 space-y-3">
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" /> <span>99% OCR Accuracy</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Languages className="w-4 h-4 text-orange-400" /> <span>30+ Languages</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FINAL CTA STRIP */}
      <section className="py-24 px-4 text-center">
         <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900">
               Ready to upgrade your brain?
            </h2>
            <p className="text-lg text-slate-500">
               Join thousands of students saving 10+ hours a week.
            </p>
            <a href="/signup" className="inline-flex items-center gap-2 bg-slate-900 text-white font-medium px-10 py-4 rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
               Start for free <ArrowRight className="w-4 h-4" />
            </a>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition">
            <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-serif font-bold italic">e</div>
            <span className="font-semibold text-slate-900">edufy</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2025 Edufy Inc. Crafted for knowledge.
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}