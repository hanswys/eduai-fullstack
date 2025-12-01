'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Zap, 
  ChevronRight,
  UploadCloud, 
  Loader2, 
  Languages, 
  RefreshCw, 
  Download,
  PenTool,
  Sparkles
} from 'lucide-react';
import { useAuth } from "@/context/authContext";

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

type Mode = 'selection' | 'text-mode' | 'image-mode';

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>('selection');

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden">
      
      {/* Background Texture */}
      <GridPattern />

      {/* Header */}
      <header className="h-24 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="group flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-medium text-slate-900">
               {mode === 'selection' ? 'New Project' : mode === 'text-mode' ? 'Visual Notes' : 'EduLens'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
               {mode === 'selection' ? 'Select Tool' : 'Workspace'}
            </p>
          </div>
        </div>
        
        {/* Step Indicator */}
        {mode !== 'selection' && (
          <button 
             onClick={() => setMode('selection')}
             className="text-xs font-medium text-slate-500 hover:text-orange-600 transition"
          >
             Switch Tool
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* 1. SELECTION SCREEN */}
        {mode === 'selection' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
               <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-4">What are we studying?</h2>
               <p className="text-slate-500">Choose an engine to process your materials.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
              
              {/* Option A: Text Input */}
              <button 
                onClick={() => setMode('text-mode')}
                className="group relative flex flex-col items-start p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-100 hover:border-orange-200 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-700"></div>
                
                <div className="relative z-10 w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <PenTool className="w-8 h-8 text-orange-600" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-serif text-slate-900 mb-3">Visual Notes</h3>
                   <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
                     Paste your messy lecture notes or transcript. We'll structure them into a clear, visual diagram.
                   </p>
                   <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-900 pb-0.5 group-hover:text-orange-600 group-hover:border-orange-600 transition-colors">
                     Open Editor <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </button>

              {/* Option B: Image Input */}
              <button 
                onClick={() => setMode('image-mode')}
                className="group relative flex flex-col items-start p-10 bg-slate-900 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 text-left overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-700"></div>

                <div className="relative z-10 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition duration-500">
                  <Languages className="w-8 h-8 text-orange-300" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-serif text-white mb-3">EduLens</h3>
                   <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">
                     Upload a photo of a textbook or worksheet. We'll translate it while preserving the layout.
                   </p>
                   <div className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-white pb-0.5 group-hover:text-orange-300 group-hover:border-orange-300 transition-colors">
                     Open Translator <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* 2. TEXT MODE INTERFACE */}
        {mode === 'text-mode' && <TextToImageTool />}

        {/* 3. IMAGE MODE INTERFACE */}
        {mode === 'image-mode' && <EduLensTool />}

      </main>
    </div>
  );
}

// --- SUB-COMPONENT: TEXT TOOL ---
const TextToImageTool = () => {
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
  
    useEffect(() => {
      return () => { if (resultUrl) URL.revokeObjectURL(resultUrl); };
    }, [resultUrl]);
  
    const handleGenerate = async () => {
      if (!text) return;
      if (!user) { setError("You must be logged in."); return; }
      
      setLoading(true);
      setError(null);
      if (resultUrl) { URL.revokeObjectURL(resultUrl); setResultUrl(null); }
  
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/visual-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || 'Generation failed');
        }
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setResultUrl(imageUrl);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
  
    const handleDownload = () => {
      if (!resultUrl) return;
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `edufy-notes-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    return (
      <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-180px)] animate-in fade-in slide-in-from-right-8 duration-700">
        
        {/* Input Side */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <label className="text-sm font-bold uppercase tracking-wider text-slate-400">Input Transcript</label>
             <span className="text-xs text-slate-300 font-mono">{text.length}/5000</span>
          </div>
          
          <textarea 
            className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-xl p-6 resize-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 focus:border-slate-300 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed transition-all"
            placeholder="Paste your lecture notes here. For example: 'Photosynthesis is the process used by plants to convert light energy into chemical energy...'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          
          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> {error}
            </div>
          )}
  
          <div className="mt-6">
             <button 
               onClick={handleGenerate}
               disabled={loading || !text}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 group"
             >
               {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5 text-orange-300" />}
               {loading ? 'Synthesizing...' : 'Generate Notes'}
             </button>
          </div>
        </div>
  
        {/* Output Side */}
        <div className="bg-[#F1F0EB] rounded-[2rem] border border-slate-200 flex items-center justify-center relative overflow-hidden group h-full">
           {/* Decorative corner lines to look like paper holders */}
           <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-slate-300 rounded-tl-lg"></div>
           <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-slate-300 rounded-tr-lg"></div>
           <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-slate-300 rounded-bl-lg"></div>
           <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-slate-300 rounded-br-lg"></div>

          {resultUrl ? (
            <div className="w-full h-full relative flex items-center justify-center p-8">
               <img 
                 src={resultUrl} 
                 className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                 alt="Generated Educational Diagram" 
               />
               <div className="absolute bottom-8 right-8">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-5 py-3 rounded-xl shadow-xl font-bold hover:scale-105 transition flex items-center gap-2 border border-slate-100"
                  >
                    <Download className="w-4 h-4" />
                    Save Note
                  </button>
               </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">
               {loading ? (
                 <div className="flex flex-col items-center animate-pulse">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                     <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
                   </div>
                   <h4 className="text-slate-900 font-serif text-xl mb-1">Processing</h4>
                   <p className="text-sm text-slate-500">Converting concepts to visuals...</p>
                 </div>
               ) : (
                 <>
                   <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                   <p className="font-serif text-lg text-slate-500">Your generated diagram will appear here.</p>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };


// --- SUB-COMPONENT: EDULENS TOOL ---
export const EduLensTool = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleTranslate = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setResultImage(null);
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('target_lang', targetLang);

    try {
      const response = await fetch('/api/visual-translation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         // Error handling omitted for brevity, keeping existing logic
         throw new Error('Translation failed');
      }
      const imageBlob = await response.blob();
      setResultImage(URL.createObjectURL(imageBlob));
    } catch (error) {
      console.error(error);
      alert("Failed to translate.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `edufy-translated-${targetLang}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col gap-8 h-full">
      
      {/* 1. Control Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-900 p-3 rounded-xl"><Languages className="w-5 h-5 text-white"/></div>
          <div>
            <h3 className="font-serif text-lg text-slate-900">Translation Settings</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Language</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
             <select 
               value={targetLang}
               onChange={(e) => setTargetLang(e.target.value)}
               className="appearance-none w-full md:w-56 bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
             >
               <option value="Spanish">Spanish</option>
               <option value="French">French</option>
               <option value="German">German</option>
               <option value="Japanese">Japanese</option>
               <option value="Chinese">Chinese (Simplified)</option>
             </select>
             <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>

          <button
            onClick={handleTranslate}
            disabled={!imageFile || isProcessing}
            className="flex-1 md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isProcessing ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>

      {/* 2. Workspace (Split View) */}
      <div className="grid md:grid-cols-2 gap-6 h-[550px]">
        
        {/* Left: Input */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden relative group">
          <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur border border-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
            Original Source
          </div>
          
          {previewUrl ? (
            <div className="relative w-full h-full bg-[#F1F0EB] flex items-center justify-center p-8">
              <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain shadow-xl rounded-lg" />
              <label className="absolute bottom-6 cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-xl shadow-xl font-bold hover:scale-105 transition text-sm flex items-center gap-2">
                <UploadCloud className="w-4 h-4" /> Change Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition border-2 border-dashed border-slate-100 hover:border-slate-300 m-4 rounded-[2rem]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-slate-900" />
              </div>
              <h3 className="text-xl font-serif text-slate-900">Upload Textbook Page</h3>
              <p className="text-slate-400 text-sm mt-2">Supports JPG, PNG, WEBP</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Right: Output */}
        <div className="bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden text-white">
          
          {resultImage ? (
             <div className="w-full h-full flex items-center justify-center relative animate-in fade-in duration-700 p-8">
               <div className="absolute top-6 left-6 z-10 bg-white/10 backdrop-blur border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                 {targetLang} Result
               </div>
               <img src={resultImage} alt="Translated" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
               <div className="absolute bottom-6">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-6 py-3 rounded-xl shadow-lg font-bold hover:bg-orange-50 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4"/> Save Translation
                  </button>
               </div>
             </div>
          ) : (
            <div className="text-center p-8 max-w-xs relative z-10">
              {isProcessing ? (
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 flex items-center justify-center">
                     <Loader2 className="w-8 h-8 text-white animate-spin" />
                   </div>
                   <p className="text-white font-serif text-xl">Translating...</p>
                   <p className="text-sm text-slate-400 mt-2">Detecting text and replacing layout.</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Languages className="w-8 h-8 text-slate-500" />
                  </div>
                  <h4 className="font-serif text-xl text-slate-300">Ready to Translate</h4>
                  <p className="text-sm text-slate-500 mt-2">Upload an image on the left to begin the EduLens process.</p>
                </>
              )}
            </div>
          )}
          
          {/* Background decoration for the empty state */}
          {!resultImage && (
             <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-orange-500 rounded-full blur-[100px]"></div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};