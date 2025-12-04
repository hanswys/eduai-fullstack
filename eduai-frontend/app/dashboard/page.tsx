"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Camera,
  Settings,
  LogOut,
  Zap,
  Loader2,
  ChevronRight,
  Download,
  Plus,
  Grid,
  Clock,
  Sparkles
} from "lucide-react";

// --- DECORATIVE COMPONENT ---
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

// --- TYPES ---
type ToolTab = "profile" | "gallery" | "visual-notes" | "edulens" | "settings";

interface ActivityItem {
  id: string;
  title: string;
  type: "visual-notes" | "edulens";
  time: string;
  imageUrl: string;
}

interface UserData {
  tokens_remaining: number;
  streak_count: number;
  recentActivity: ActivityItem[];
}

// --- SHARED UTILS ---
const handleDownload = async (e: React.MouseEvent, url: string, title: string) => {
  e.stopPropagation();
  e.preventDefault();
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `edufy-${safeTitle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
    window.open(url, '_blank');
  }
};

// --- COMPONENTS ---

const Sidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
}: {
  activeTab: ToolTab;
  setActiveTab: (t: ToolTab) => void;
  onLogout: () => void;
}) => {
  const NavItem = ({ id, icon: Icon, label }: { id: ToolTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        activeTab === id
          ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
          : "text-slate-500 hover:bg-orange-50 hover:text-orange-700"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? "text-orange-300" : "text-slate-400 group-hover:text-orange-500"}`} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 border-r border-slate-200/60 bg-[#FDFCF8]/50 backdrop-blur-xl">
      <div className="p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 pl-2">
          <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md">
            <span className="font-serif font-bold italic text-lg lowercase">e</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">edufy</span>
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Workspace</p>
          <NavItem id="profile" icon={LayoutDashboard} label="Overview" />
          <NavItem id="gallery" icon={Grid} label="My Library" />
        </div>
        
        <div className="mt-8 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Account</p>
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </div>

      <div className="mt-auto p-8 border-t border-slate-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

// Feature: Profile / Overview
const ProfileOverview = ({ 
  userData, 
  loading, 
  setActiveTab,
  userDisplayName
}: { 
  userData: UserData | null, 
  loading: boolean, 
  setActiveTab: (t: ToolTab) => void,
  userDisplayName: string
}) => {
  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Banner */}
      <div className="mb-8">
         <h2 className="text-4xl font-serif text-slate-900 mb-2">Welcome back, {userDisplayName}.</h2>
         <p className="text-slate-500">Here is what's happening with your learning today.</p>
      </div>

      {/* Stats Row - Clean Academic Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credits Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
               <div className="p-2 bg-orange-50 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-500" />
               </div>
               <span className="text-sm font-semibold uppercase tracking-wider">Credits</span>
            </div>
            <div>
               <div className="text-5xl font-serif text-slate-900 mb-1">{userData?.tokens_remaining ?? 0}</div>
               <div className="text-slate-400 text-sm">Generations remaining this month</div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg shadow-slate-200 group">
          <div className="absolute -bottom-4 -right-4 text-white/5">
             <Clock className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-3 mb-4 text-slate-300">
               <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-orange-300" />
               </div>
               <span className="text-sm font-semibold uppercase tracking-wider">Study Streak</span>
            </div>
            <div>
               <div className="text-5xl font-serif text-white mb-1">{userData?.streak_count ?? 0}</div>
               <div className="text-slate-400 text-sm">Consecutive days learned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-serif text-slate-900">Recent Notes</h3>
          <button 
            onClick={() => setActiveTab('gallery')} 
            className="text-sm text-slate-500 font-medium hover:text-slate-900 transition flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {userData?.recentActivity?.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center p-3 rounded-2xl hover:bg-slate-50 transition group cursor-pointer border border-transparent hover:border-slate-100">
              {/* Thumbnail */}
              <div className="relative w-16 h-16 mr-5 flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl shadow-sm" />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                  {item.type === 'edulens' ? <Camera className="w-3 h-3 text-slate-900" /> : <ImageIcon className="w-3 h-3 text-orange-500" />}
                </div>
              </div>
              
              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-lg group-hover:text-orange-600 transition truncate pr-4 font-serif">{item.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                   {item.time} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {item.type === 'edulens' ? "Translation" : "Diagram"}
                </p>
              </div>

              {/* Action */}
              <button 
                onClick={(e) => handleDownload(e, item.imageUrl, item.title)}
                className="opacity-0 group-hover:opacity-100 p-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
          {(!userData?.recentActivity || userData.recentActivity.length === 0) && (
            <div className="text-center py-12">
               <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="text-slate-300 w-6 h-6" />
               </div>
               <p className="text-slate-400">No notes created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature: Image Gallery
const ImageGallery = ({ items, loading }: { items: ActivityItem[] | undefined, loading: boolean }) => {
  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] mb-6 shadow-sm">
          <ImageIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-serif text-slate-900 mb-2">Your library is empty</h3>
        <p className="text-slate-500 max-w-sm">Create your first visual summary to start building your knowledge base.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-200 transition-all duration-300 overflow-hidden flex flex-col">
            
            {/* Image Area */}
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
              
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <button 
                  onClick={(e) => handleDownload(e, item.imageUrl, item.title)}
                  className="bg-white text-slate-900 p-2 rounded-lg hover:scale-110 transition-transform shadow-lg"
                 >
                   <Download className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.type === 'edulens' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                     {item.type === 'edulens' ? "EduLens" : "Visual Note"}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">{item.time}</span>
              </div>
              <h4 className="font-serif font-medium text-slate-900 line-clamp-1" title={item.title}>{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE LAYOUT ---
export default function DashboardPage() {
  const { user, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState<ToolTab>("profile");
  
  // State for Real DB Data
  const [dbUser, setDbUser] = useState<UserData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // FETCH REAL DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      // --- FIX STARTS HERE ---
      // 1. Get the URL from env, default to localhost for dev, and remove trailing slashes
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const API_URL = BASE_URL.replace(/\/$/, '');

      try {
        const token = await user.getIdToken();
        
        // 2. Use the dynamic API_URL
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      // --- FIX ENDS HERE ---
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user && dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><Loader2 className="w-8 h-8 animate-spin text-slate-900" /></div>;
  }

  const getUserDisplayName = () => {
     if (user?.displayName) return user.displayName.split(' ')[0];
     return "Scholar";
  }

  const getHeaderTitle = () => {
    if (activeTab === "profile") return "Overview";
    const titles = {
      "gallery": "My Library",
      "visual-notes": "Visual Notes Generator",
      edulens: "EduLens Translator",
      settings: "Account Settings",
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex font-sans selection:bg-orange-100 selection:text-orange-900 overflow-hidden">
      
      {/* Background Texture */}
      <GridPattern />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-8 md:px-12 sticky top-0 z-10 bg-[#FDFCF8]/80 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-serif text-slate-900">{getHeaderTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <a href="/create" className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition shadow-lg shadow-slate-900/20 text-sm group">
               <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
               <span>Create New</span>
             </a>
             
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
               <div className="text-right hidden lg:block">
                  <div className="text-sm font-bold text-slate-900">{user?.displayName || "Guest"}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Free Plan</div>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden">
                  <img src={user?.photoURL || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"} alt="Avatar" className="w-full h-full object-cover rounded-full" />
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {activeTab === "profile" && (
            <ProfileOverview 
              userData={dbUser} 
              loading={dataLoading} 
              setActiveTab={setActiveTab}
              userDisplayName={getUserDisplayName()} 
            />
          )}
          
          {activeTab === "gallery" && (
            <ImageGallery items={dbUser?.recentActivity} loading={dataLoading} />
          )}

          {activeTab === "settings" && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-slate-300" />
               </div>
              <h3 className="font-serif text-xl text-slate-900 mb-2">Settings</h3>
              <p>Account preferences are coming in the next update.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}