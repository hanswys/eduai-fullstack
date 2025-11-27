'use client';

import React, { useState } from 'react';
// import { addToWaitlist } from './actions'; // UNCOMMENT THIS IN PRODUCTION
import { 
  BookOpen, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowRight, 
  Menu, 
  X,
  Globe,
  Zap,
  Check,
  CheckCircle2, 
  Mail,
  Loader2,
  FileText,
  Share2,
  Wand2,
  BrainCircuit,
  Camera
} from 'lucide-react';

// --- SIMULATION FOR PREVIEW (DELETE IN PRODUCTION) ---
const addToWaitlist = async (formData: FormData) => {
  console.log("Simulating server submission for:", formData.get('email'));
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true };
}
// -----------------------------------------------------

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for Waitlist Form
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // --- FORM HANDLER ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      await addToWaitlist(formData);
      
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Dynamic Background Decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[100px] opacity-60 mix-blend-multiply animate-pulse"></div>
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[100px] opacity-60 mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-blue-200/40 blur-[100px] opacity-50 mix-blend-multiply"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-lg z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <BookOpen className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">edu.ai</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Capabilities</a>
              <a href="#waitlist" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Pricing</a>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
               <a href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                  Sign In
               </a>
               <a href="/login" className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-6 font-medium text-white transition duration-300 hover:bg-slate-800 shadow-lg shadow-slate-200">
                  <span className="mr-2">Get Started</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
               </a>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
            <a href="#features" className="text-slate-600 font-medium">Capabilities</a>
            <a href="/login" className="text-slate-600 font-medium">Log in</a>
            <a href="/login" className="bg-indigo-600 text-white py-3 px-4 rounded-xl text-center font-medium">Get Started</a>
          </div>
        )}
      </nav>

      {/* --- SIMPLIFIED HERO SECTION --- */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Intelligent Study Companion</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            From messy thoughts to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient bg-300% bg-left">
              perfect clarity.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop drowning in unstructured notes. Our AI visual engine instantly organizes your scattered inputs—images, voice, or text—into beautiful, structured knowledge maps.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="/login" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Get Early Access <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          
          {/* Social Proof */}
          <div className="pt-8 flex flex-col items-center justify-center gap-4 text-sm text-slate-500 font-medium">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+20}`} alt="User" />
                  </div>
               ))}
            </div>
            <p>Used by students at MIT, Stanford & Oxford</p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Your academic superpowers.</h2>
            <p className="mt-4 text-slate-600">Two core engines designed to accelerate comprehension.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative p-8 bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-700">
                <ImageIcon className="w-64 h-64 text-indigo-600" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <ImageIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Visual Notes</h3>
                <p className="text-slate-600 leading-relaxed mb-8">
                  Struggling to visualize Physics or History? Paste your transcript, and our LLM generates context-aware diagrams.
                </p>
                <ul className="space-y-3">
                  {['Summarize long lectures', 'Generate memory aids', 'Export to PDF'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="group relative p-8 bg-slate-900 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-purple-200 transition duration-500">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-700">
                <Globe className="w-64 h-64 text-purple-400" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-6">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">EduLens Translation</h3>
                <p className="text-slate-300 leading-relaxed mb-8">
                  Snap a photo of any textbook page. We extract the text using OCR and translate it into your native language instantly.
                </p>
                <ul className="space-y-3">
                  {['98% OCR Accuracy', 'Supports 30+ Languages', 'Save to Digital Notebook'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
         </div>
      </section>

      {/* Waitlist Section with Server Action */}
      <section id="waitlist" className="relative z-10 py-24 bg-slate-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {status === 'success' ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/20">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">You're on the list!</h2>
                <p className="text-slate-300 text-lg mb-8">
                  We've saved your spot. Watch your inbox for updates.
                </p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="text-sm font-medium text-indigo-300 hover:text-white transition"
                >
                  Register another email
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-6">
                  <Sparkles className="w-3 h-3" />
                  <span>Limited Early Access</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                  Ready to upgrade your brain?
                </h2>
                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  We are currently in private beta. Join the waitlist to secure your spot when we launch.
                </p>

                {/* FORM USING SUBMIT HANDLER TO CALL SERVER ACTION */}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="enter.your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                     {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5"/> : <>Join Waitlist <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                {status === 'error' && (
                  <p className="mt-4 text-sm text-red-400 animate-pulse">
                    {errorMessage}
                  </p>
                )}

                <p className="mt-4 text-sm text-slate-500">
                  Join 2,000+ students waiting for access. No spam, ever.
                </p>
              </>
            )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <BookOpen className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-slate-900">edu.ai</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2025 Edu.ai Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-900 transition">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-slate-900 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}