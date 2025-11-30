'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Zap, 
  Check, 
  ChevronRight,
  UploadCloud, 
  Loader2, 
  Languages, 
  RefreshCw, 
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

type Mode = 'selection' | 'text-mode' | 'image-mode';

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>('selection');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100">
      
      {/* Header */}
      <header className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Project</h1>
            <p className="text-xs text-slate-500">Select a workflow to begin</p>
          </div>
        </div>
        
        {/* Step Indicator (Visual only) */}
        {mode !== 'selection' && (
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <span className="text-slate-400">Select Type</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {mode === 'text-mode' ? 'Visual Notes' : 'EduLens Translate'}
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full flex flex-col">
        
        {/* 1. SELECTION SCREEN */}
        {mode === 'selection' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">What would you like to create?</h2>
            
            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
              
              {/* Option A: Text Input */}
              <button 
                onClick={() => setMode('text-mode')}
                className="group relative flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 text-left"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                  <Zap className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Visual Notes</h3>
                <p className="text-slate-500 mb-6">
                  Input transcript or lecture notes. Our AI will summarize the concepts and generate an explanatory diagram.
                </p>
                <div className="mt-auto flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  Start Generating <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              {/* Option B: Image Input */}
              <button 
                onClick={() => setMode('image-mode')}
                className="group relative flex flex-col items-start p-8 bg-white rounded-3xl border border-slate-200 hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 text-left"
              >
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                  <Languages className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">EduLens Translate</h3>
                <p className="text-slate-500 mb-6">
                  Upload an image of a textbook or worksheet. Select a target language and view the translated result.
                </p>
                <div className="mt-auto flex items-center text-sm font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  Start Translating <ChevronRight className="w-4 h-4 ml-1" />
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

// --- SUB-COMPONENT: TEXT TOOL (REFACTORED) ---
const TextToImageTool = () => {
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
  
    // Clean up object URL to prevent memory leaks when component unmounts
    React.useEffect(() => {
      return () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
      };
    }, [resultUrl]);
  
    const handleGenerate = async () => {
      if (!text) return;
      
      setLoading(true);
      setError(null);
      
      // Clear previous result
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }
  
      try {
        const response = await fetch('/api/visual-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
  
        if (!response.ok) {
          // Try to parse error message if backend sends JSON error details
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || 'Failed to generate visual notes');
        }
        // 1. Get the raw bytes (Blob) from the backend StreamingResponse
        const imageBlob = await response.blob();
        
        // 2. Create a local URL for this binary data
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log(response)
        console.log(imageBlob)
        

        setResultUrl(imageUrl);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    const handleDownload = () => {
      if (!resultUrl) return;
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `edu-ai-notes-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    return (
      <div className="grid lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <label className="text-sm font-bold text-slate-700 mb-2">Transcript / Notes</label>
          <textarea 
            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="Paste your lecture notes, summary, or concept explanation here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000} // Backend slices at 1000, but good to limit frontend slightly higher
          />
          
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              Error: {error}
            </div>
          )}
  
          <button 
            onClick={handleGenerate}
            disabled={loading || !text}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap className="w-5 h-5" />}
            {loading ? 'Analyzing & Generating...' : 'Generate Visual Notes'}
          </button>
        </div>
  
        <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group">
          {resultUrl ? (
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
               {/* Display the Object URL directly */}
               <img 
                 src={resultUrl} 
                 className="max-w-full max-h-full object-contain" 
                 alt="Generated Educational Diagram" 
               />
               <div className="absolute bottom-6 right-6">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4 rotate-180" /> {/* Using rotate for download icon feel */}
                    Download PNG
                  </button>
               </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">
               {loading ? (
                 <div className="flex flex-col items-center animate-pulse">
                   <ImageIcon className="w-16 h-16 mb-4 text-indigo-300" />
                   <p className="text-indigo-600 font-medium">Creating diagram...</p>
                   <p className="text-sm">This may take 10-20 seconds</p>
                 </div>
               ) : (
                 <>
                   <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                   <p className="font-medium">Visual output will appear here</p>
                   <p className="text-sm mt-1">Enter text on the left to begin</p>
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };


export const EduLensTool = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null); // Reset result on new upload
    }
  };

  // Handle "Translate" Action
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
        // Try to get error message from response
        let errorMessage = 'Translation failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData?.detail || errorData?.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        console.error('Translation error:', errorMessage, 'Status:', response.status);
        alert(`Translation failed: ${errorMessage}`);
        return;
      }

      // Important: Backend returns a raw image, not JSON.
      // We convert the response blob into a URL the <img> tag can read.
      const imageBlob = await response.blob();
      
      // Verify it's actually an image
      if (!imageBlob.type.startsWith('image/')) {
        throw new Error('Server returned non-image data');
      }
      
      const imageObjectUrl = URL.createObjectURL(imageBlob);
      setResultImage(imageObjectUrl);

    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to translate image. Please try again.";
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to download the generated image
  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `edulens-translated-${targetLang}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col gap-6">
      
      {/* 1. Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-purple-100 p-2 rounded-lg"><Languages className="w-5 h-5 text-purple-600"/></div>
          <div>
            <h3 className="font-bold text-slate-800">Target Language</h3>
            <p className="text-xs text-slate-500">Select language for image text</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Chinese">Chinese (Simplified)</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={!imageFile || isProcessing}
            className="flex-1 md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isProcessing ? 'Translating...' : 'Translate Image'}
          </button>
        </div>
      </div>

      {/* 2. Workspace (Split View) */}
      <div className="grid md:grid-cols-2 gap-6 h-[500px]">
        
        {/* Left: Input */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative group">
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
            Original Input
          </div>
          
          {previewUrl ? (
            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
              <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain opacity-90" />
              <label className="absolute bottom-4 right-4 cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-slate-100 transition text-sm">
                Change Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition border-2 border-dashed border-transparent hover:border-purple-200 m-2 rounded-2xl">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <UploadCloud className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Upload Image</h3>
              <p className="text-slate-400 text-sm mt-1">PNG, JPG, or WEBP</p>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Right: Output */}
        <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {targetLang} Output
          </div>

          {resultImage ? (
             <div className="w-full h-full bg-slate-900 flex items-center justify-center relative animate-in fade-in duration-700">
               <img src={resultImage} alt="Translated" className="max-w-full max-h-full object-contain" />
               <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={handleDownload}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-purple-50 hover:text-purple-600 transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4"/> Save Image
                  </button>
               </div>
             </div>
          ) : (
            <div className="text-center p-8 max-w-xs">
              {isProcessing ? (
                <div className="flex flex-col items-center animate-pulse">
                   <div className="w-16 h-16 bg-purple-200 rounded-2xl mb-4 flex items-center justify-center">
                     <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                   </div>
                   <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                   <div className="h-3 w-24 bg-slate-200 rounded"></div>
                   <p className="mt-4 text-purple-600 font-bold text-sm">Regenerating image with AI...</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="font-bold text-slate-400">No Translation Yet</h4>
                  <p className="text-sm text-slate-400 mt-1">Upload an image and select a language to generate the translated version.</p>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};