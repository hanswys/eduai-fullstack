"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import {
  BookOpen,
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
  Grid, // NEW IMPORT
} from "lucide-react";

// --- TYPES ---
// Updated to include 'gallery'
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
    const response = await fetch(url, {
      mode: 'cors',
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `edu-ai-${safeTitle}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);

  } catch (err) {
    console.error("Download failed:", err);
    alert("Could not download image. Opening in new tab instead.");
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeTab === id
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1"
          : "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
      <span className="font-medium text-sm">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-slate-50 border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <BookOpen className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">edu.ai</span>
        </div>
        <div className="space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
          <NavItem id="profile" icon={LayoutDashboard} label="Overview" />
          {/* NEW: Gallery Tab */}
          <NavItem id="gallery" icon={Grid} label="Gallery" />
        </div>
        <div className="mt-8 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</p>
          <NavItem id="settings" icon={Settings} label="Settings" />
        </div>
      </div>
      <div className="mt-auto p-6 border-t border-slate-200">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

// Feature: Profile / Overview
const ProfileOverview = ({ userData, loading }: { userData: UserData | null, loading: boolean }) => {
  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5" />
            </div>
            <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Pro Plan</span>
          </div>
          <div className="text-4xl font-bold mb-1">{userData?.tokens_remaining ?? 0}</div>
          <div className="text-indigo-100 text-sm font-medium">Credits Remaining</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-800 mb-1">{userData?.streak_count ?? 0}</div>
          <div className="text-slate-500 text-sm font-medium">Day Streak</div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          {/* Note: In a real app, this View All could link to setActiveTab('gallery') */}
          <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {userData?.recentActivity?.map((item) => (
            <div key={item.id} className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group">
              
              {/* Thumbnail */}
              <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-100" />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-slate-100">
                  {item.type === 'edulens' ? <Camera className="w-3 h-3 text-purple-600" /> : <ImageIcon className="w-3 h-3 text-indigo-600" />}
                </div>
              </div>
              
              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate pr-4">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.time} • {item.type === 'edulens' ? "EduLens" : "Visual Notes"}</p>
              </div>

              {/* Download Button */}
              <button 
                onClick={(e) => handleDownload(e, item.imageUrl, item.title)}
                className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
          {(!userData?.recentActivity || userData.recentActivity.length === 0) && (
            <p className="text-slate-400 text-center py-4">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW FEATURE: Image Gallery
const ImageGallery = ({ items, loading }: { items: ActivityItem[] | undefined, loading: boolean }) => {
  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No images yet</h3>
        <p className="text-slate-500 max-w-sm mt-2">Start creating visual notes or using EduLens to populate your gallery.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
            
            {/* Image Area */}
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              {/* Type Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 text-slate-700">
                 {item.type === 'edulens' ? <Camera className="w-3 h-3 text-purple-600" /> : <ImageIcon className="w-3 h-3 text-indigo-600" />}
                 {item.type === 'edulens' ? "EduLens" : "Notes"}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button 
                  onClick={(e) => handleDownload(e, item.imageUrl, item.title)}
                  className="bg-white text-slate-800 p-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-200 shadow-lg"
                  title="Download"
                 >
                   <Download className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 line-clamp-1 mb-1" title={item.title}>{item.title}</h4>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
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

  // FETCH REAL DATA FROM FASTAPI
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        const res = await fetch('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  const getHeaderTitle = () => {
    if (activeTab === "profile") {
      const identifier = user?.displayName || user?.email || "User";
      return `Welcome back, ${identifier}.`;
    }
    const titles = {
      "gallery": "My Gallery", // Title for new tab
      "visual-notes": "Visual Notes Generator",
      edulens: "EduLens Translator",
      settings: "Account Settings",
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-indigo-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{getHeaderTitle()}</h1>
          <a href="/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4" /><span>Create New</span>
          </a>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-slate-900">{user?.displayName || user?.email || "Guest User"}</div>
              <div className="text-xs text-slate-500">Free Plan</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "profile" && <ProfileOverview userData={dbUser} loading={dataLoading} />}
          
          {/* Render Gallery */}
          {activeTab === "gallery" && (
            <ImageGallery items={dbUser?.recentActivity} loading={dataLoading} />
          )}

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