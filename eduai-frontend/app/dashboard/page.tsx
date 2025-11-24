"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  Image as ImageIcon,
  Camera,
  Settings,
  LogOut,
  Zap,
  UploadCloud,
  Languages,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";

// --- TYPES ---
type ToolTab = "profile" | "visual-notes" | "edulens" | "settings";

// --- COMPONENTS ---

// 1. Sidebar Component
const Sidebar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: ToolTab;
  setActiveTab: (t: ToolTab) => void;
}) => {
  const NavItem = ({
    id,
    icon: Icon,
    label,
  }: {
    id: ToolTab;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeTab === id
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1"
          : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          activeTab === id
            ? "text-white"
            : "text-slate-400 group-hover:text-indigo-600"
        }`}
      />
      <span className="font-medium text-sm">{label}</span>
      {activeTab === id && (
        <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
      )}
    </button>
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-50 border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <BookOpen className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            edu.ai
          </span>
        </div>

        <div className="space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace
          </p>
          <NavItem id="profile" icon={LayoutDashboard} label="Overview" />
          <NavItem id="visual-notes" icon={ImageIcon} label="Visual Notes" />
          <NavItem id="edulens" icon={Camera} label="EduLens" />
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Account
          </p>
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

// 2. Feature: Visual Notes
const VisualNotes = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      setGeneratedImage(
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000"
      );
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Input Section */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            Input Transcript
          </h2>
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
            GPT-4o
          </span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your lecture notes, book summary, or physics concept here..."
          className="flex-1 w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-slate-200"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isGenerating ? "Dreaming..." : "Generate Visuals"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center p-6 relative overflow-hidden group">
        {generatedImage ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-700">
            <img
              src={generatedImage}
              alt="Generated result"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button className="bg-white/90 backdrop-blur text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-white transition">
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 max-w-xs">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-500">No visuals yet</p>
            <p className="text-sm mt-1">
              Enter your notes on the left to transform them into diagrams.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Feature: EduLens
const EduLens = () => {
  const [step, setStep] = useState<"upload" | "scanning" | "result">("upload");
  const [targetLang, setTargetLang] = useState("Spanish");

  const handleUpload = () => {
    setStep("scanning");
    setTimeout(() => setStep("result"), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Smart Translation</h2>
            <p className="text-xs text-slate-500">
              Optical Character Recognition active
            </p>
          </div>
        </div>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="Spanish">English → Spanish</option>
          <option value="French">English → French</option>
          <option value="Japanese">English → Japanese</option>
        </select>
      </div>

      {/* Main Area */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {step === "upload" && (
          <div
            onClick={handleUpload}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 border border-indigo-100">
              <UploadCloud className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Upload Textbook Page
            </h3>
            <p className="text-slate-500 mt-2">JPG, PNG or PDF accepted</p>
          </div>
        )}

        {step === "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-6 animate-pulse">
              Extracting Text...
            </h3>
          </div>
        )}

        {step === "result" && (
          <div className="absolute inset-0 grid md:grid-cols-2">
            {/* Original Image */}
            <div className="relative border-r border-slate-100 bg-slate-900 flex items-center justify-center p-8">
              <img
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
                alt="Source"
                className="max-w-full max-h-full rounded shadow-2xl opacity-90"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded">
                Source
              </div>
            </div>

            {/* Translated Text */}
            <div className="p-8 overflow-y-auto bg-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-1 rounded">
                  {targetLang} Output
                </span>
                <button className="text-slate-400 hover:text-indigo-600 transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="font-serif text-lg leading-relaxed text-slate-800">
                "El principio de incertidumbre de Heisenberg establece un límite
                fundamental a la precisión con la que se pueden conocer
                simultáneamente ciertos pares de propiedades físicas..."
              </p>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <button
                  onClick={() => setStep("upload")}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Scan another page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Feature: Profile / Overview
const ProfileOverview = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5" />
            </div>
            <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
              Pro Plan
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">128</div>
          <div className="text-indigo-100 text-sm font-medium">
            Credits Remaining
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-800 mb-1">14</div>
          <div className="text-slate-500 text-sm font-medium">Day Streak</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-800 mb-1">452</div>
          <div className="text-slate-500 text-sm font-medium">
            Pages Processed
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <button className="text-sm text-indigo-600 font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  i === 2
                    ? "bg-purple-100 text-purple-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {i === 2 ? (
                  <Camera className="w-6 h-6" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                  {i === 2
                    ? 'Translated "Intro to Biology"'
                    : "Visualized Quantum Mechanics"}
                </h4>
                <p className="text-sm text-slate-500">
                  2 hours ago • {i === 2 ? "EduLens" : "Visual Notes"}
                </p>
              </div>
              <div className="text-slate-300 group-hover:text-indigo-600 transition">
                <MoreHorizontal />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE LAYOUT ---
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>("profile");

  // Title mapping
  const titles = {
    profile: "Welcome back, Alex.",
    "visual-notes": "Visual Notes Generator",
    edulens: "EduLens Translator",
    settings: "Account Settings",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-indigo-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {titles[activeTab]}
          </h1>
          <Link
            href="/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-slate-900">
                Alex Student
              </div>
              <div className="text-xs text-slate-500">Free Plan</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "profile" && <ProfileOverview />}
          {activeTab === "visual-notes" && <VisualNotes />}
          {activeTab === "edulens" && <EduLens />}
          {activeTab === "settings" && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Settings coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
