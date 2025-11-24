'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X,
  Globe,
  Zap,
  Check
} from 'lucide-react';

type PricingCardProps = {
  tier: string;
  price: string;
  description: string;
  features: Array<string | React.ReactNode>;
  highlighted?: boolean;
  buttonLabel?: string;
};

// --- NEW COMPONENT: Pricing Card ---
const PricingCard = ({ 
  tier, 
  price, 
  description, 
  features, 
  highlighted = false, 
  buttonLabel = "Get Started" 
}: PricingCardProps) => (
  <div className={`relative flex flex-col p-8 rounded-3xl bg-white transition duration-300 ${
    highlighted 
      ? 'border-2 border-indigo-600 shadow-2xl shadow-indigo-100 scale-105 z-10' 
      : 'border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200'
  }`}>
    {highlighted && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
        Most Popular
      </div>
    )}
    <div className="mb-6">
      <h3 className={`text-lg font-bold ${highlighted ? 'text-indigo-600' : 'text-slate-900'}`}>{tier}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-extrabold text-slate-900">${price}</span>
        <span className="ml-1 text-slate-500 text-sm">/month</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
    
    <div className="flex-1 space-y-4 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlighted ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            <Check className="w-3 h-3" />
          </div>
          <span className="text-sm text-slate-700">{feature}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-3 rounded-xl font-semibold transition ${
      highlighted 
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
        : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
    }`}>
      {buttonLabel}
    </button>
  </div>
);

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-purple-100/50 blur-3xl opacity-60 mix-blend-multiply"></div>
      </div>

      {/* --- NAVBAR --- */}
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
              <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Capabilities</Link>
              <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Pricing</Link>
              <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">About</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Log in</Link>
              <Link href="/dashboard" className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-slate-900 px-6 font-medium text-white transition duration-300 hover:bg-slate-800 shadow-lg shadow-slate-200">
                <span className="mr-2">Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase animate-fade-in-up">
            <Sparkles className="w-3 h-3" />
            <span>Powered by GPT-4o & DeepL</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Study smarter, not <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient">
              harder with AI.
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Edu.ai transforms your messy notes into beautiful diagrams and instantly translates textbook photos into your native language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Try Dashboard Free <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> See Workflow
            </button>
          </div>
          <div className="pt-12 flex flex-col items-center gap-4">
            <p className="text-sm text-slate-500 font-medium">Trusted by students at</p>
            <div className="flex gap-8 opacity-50 grayscale hover:grayscale-0 transition duration-500">
              <span className="font-serif font-bold text-xl">Harvard</span>
              <span className="font-mono font-bold text-xl">MIT</span>
              <span className="font-sans font-bold text-xl tracking-tighter">Stanford</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- BENTO GRID FEATURES --- */}
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

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="relative z-10 py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing.</h2>
            <p className="mt-4 text-slate-600">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* 1. Free Plan */}
            <PricingCard 
              tier="Starter"
              price="0"
              description="For the curious student."
              features={[
                <span key="1"><strong>1 generation</strong> per day</span>,
                "Standard speed",
                "Basic translation (3 languages)",
                "Web access only"
              ]}
            />

            {/* 2. Pro Plan */}
            <PricingCard 
              tier="Pro"
              price="9"
              description="For the dedicated learner."
              highlighted={true}
              features={[
                <span key="1"><strong>5 generations</strong> per day</span>,
                "Fast generation speed",
                "Unlimited translation (All languages)",
                "Priority email support",
                "Remove watermarks"
              ]}
              buttonLabel="Start 14-Day Trial"
            />

            {/* 3. Pro+ Plan */}
            <PricingCard 
              tier="Pro+"
              price="19"
              description="For the power user."
              features={[
                <span key="1"><strong>10 generations</strong> per day</span>,
                "Turbo speed (GPT-4o)",
                "Bulk image upload",
                "Export to Notion & PDF",
                "Early access to new features"
              ]}
            />
            
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <BookOpen className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-slate-900">edu.ai</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2024 Edu.ai Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-slate-900 transition">Twitter</Link>
            <Link href="#" className="text-slate-400 hover:text-slate-900 transition">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}