"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Replaced with <a> for preview compatibility
import { useAuth } from "@/context/authContext"; // Replaced with mock for preview
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
  Loader2,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";

// --- MOCK AUTH HOOK (DELETE IN PRODUCTION) ---
// This allows the dashboard to render here without the external Context file.
// const useAuth = () => {
//   const [loading, setLoading] = useState(true);
  
//   // Simulate a short loading delay for realism
//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 500);
//     return () => clearTimeout(timer);
//   }, []);

//   return {
//     user: {
//       displayName: "Alex Student",
//       email: "alex@edu.ai",
//       photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
//       tokensRemaining: 128,
//       streakCount: 14
//     },
//     logout: () => console.log("Simulating Logout..."),
//     loading
//   };
// };
// ---------------------------------------------

// --- TYPES ---
type ToolTab = "profile" | "visual-notes" | "edulens" | "settings";

// --- COMPONENTS ---

// 1. Sidebar Component
const Sidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
}: {
  activeTab: ToolTab;
  setActiveTab: (t: ToolTab) => void;
  onLogout: () => void;
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
          {/* <NavItem id="visual-notes" icon={ImageIcon} label="Visual Notes" /> */}
          {/* <NavItem id="edulens" icon={Camera} label="EduLens" /> */}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Account
          </p>
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};


// 4. Feature: Profile / Overview
const ProfileOverview = () => {
  // Use the Auth Context to get real user data
  const { user } = useAuth();

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
          {/* Dynamic Tokens */}
          <div className="text-4xl font-bold mb-1">
            {user?.tokensRemaining ?? 0}
          </div>
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
          {/* Dynamic Streak */}
          <div className="text-4xl font-bold text-slate-800 mb-1">
            {user?.streakCount ?? 0}
          </div>
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
  const { user, logout, loading } = useAuth(); // Hook into the mocked auth context
  const [activeTab, setActiveTab] = useState<ToolTab>("profile");

  // Show a simple loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Dynamic Title Logic
  const getHeaderTitle = () => {
    if (activeTab === "profile") {
      // If user exists, show their email or name, otherwise fallback
      const identifier = user?.displayName || user?.email || "User";
      return `Welcome back, ${identifier}.`;
    }
    const titles = {
      "visual-notes": "Visual Notes Generator",
      edulens: "EduLens Translator",
      settings: "Account Settings",
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-indigo-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout} 
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {getHeaderTitle()}
          </h1>
          <a
            href="/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-slate-900">
                {user?.displayName || user?.email || "Guest User"}
              </div>
              <div className="text-xs text-slate-500">Free Plan</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img
                src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "profile" && <ProfileOverview />}
          {/* {activeTab === "visual-notes" && <VisualNotes />} */}
          {/* {activeTab === "edulens" && <EduLens />} */}
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