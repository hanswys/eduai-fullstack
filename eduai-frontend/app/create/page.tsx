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

// export const ImageToTextTool = () => {
//   // --- State Management ---
//   const [step, setStep] = useState<'upload' | 'processing' | 'done' | 'error'>('upload');
//   const [lang, setLang] = useState('Spanish');
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [translation, setTranslation] = useState<string>("");
//   const [errorMessage, setErrorMessage] = useState<string>("");
  
//   // Hidden input reference
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // --- Handlers ---

//   // 1. Handle File Selection
//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
      
//       // Create local preview
//       const previewUrl = URL.createObjectURL(file);
//       setSelectedImage(previewUrl);
      
//       // Trigger processing immediately
//       await processImage(file);
//     }
//   };

//   // 2. Send to Backend (Gemini)
//   const processImage = async (file: File) => {
//     setStep('processing');
//     setErrorMessage("");

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('lang', lang);

//     try {
//       // Replace with your actual backend URL
//       const response = await fetch('http://localhost:8000/api/translate-image', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.statusText}`);
//       }

//       const data = await response.json();
//       setTranslation(data.translated_text);
//       setStep('done');

//     } catch (error) {
//       console.error("Translation failed:", error);
//       setErrorMessage("Failed to process image. Ensure backend is running.");
//       setStep('error');
//     }
//   };

//   // 3. Reset / Try Again
//   const handleReset = () => {
//     setSelectedImage(null);
//     setTranslation("");
//     setStep('upload');
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      
//       {/* --- Settings Bar --- */}
//       <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-purple-100 p-2 rounded-lg">
//             <Languages className="w-5 h-5 text-purple-600"/>
//           </div>
//           <span className="font-semibold text-slate-700">Translation Settings</span>
//         </div>
        
//         <div className="flex items-center gap-3 w-full sm:w-auto">
//           <label className="text-sm text-slate-500 font-medium">Target Language:</label>
//           <select 
//             value={lang}
//             onChange={(e) => setLang(e.target.value)}
//             disabled={step === 'processing'}
//             className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
//           >
//             <option value="Spanish">Spanish</option>
//             <option value="French">French</option>
//             <option value="German">German</option>
//             <option value="Japanese">Japanese</option>
//             <option value="Mandarin">Mandarin</option>
//             <option value="Arabic">Arabic</option>
//           </select>
//         </div>
//       </div>

//       {/* --- Main Workspace --- */}
//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[600px] flex flex-col relative overflow-hidden">
        
//         {/* STEP 1: UPLOAD */}
//         {step === 'upload' && (
//           <div 
//             onClick={() => fileInputRef.current?.click()}
//             className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group border-2 border-transparent hover:border-purple-100 m-4 rounded-2xl border-dashed"
//           >
//             <input 
//               type="file" 
//               ref={fileInputRef}
//               onChange={handleFileSelect}
//               accept="image/*"
//               className="hidden" 
//             />
//             <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 border border-purple-100 group-hover:scale-110 transition duration-300 shadow-sm">
//               <UploadCloud className="w-10 h-10 text-purple-600" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-800">Upload Image</h3>
//             <p className="text-slate-500 mt-2">Click to browse textbook pages or worksheets</p>
//             <span className="mt-4 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Supports JPG, PNG, WEBP</span>
//           </div>
//         )}

//         {/* STEP 2: PROCESSING */}
//         {step === 'processing' && (
//           <div className="flex-1 flex flex-col items-center justify-center p-8">
//             <div className="relative w-32 h-32 mb-8">
//               {/* Preview Image with overlay */}
//               {selectedImage && (
//                 <img 
//                   src={selectedImage} 
//                   alt="Processing" 
//                   className="w-full h-full object-cover rounded-2xl opacity-50" 
//                 />
//               )}
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Loader2 className="w-12 h-12 text-purple-600 animate-spin drop-shadow-lg" />
//               </div>
//             </div>
//             <h3 className="text-xl font-bold text-slate-800 animate-pulse">EduLens is thinking...</h3>
//             <p className="text-slate-500 mt-2">Detecting text • Translating to {lang} • Formatting</p>
//           </div>
//         )}

//         {/* STEP 3: ERROR */}
//         {step === 'error' && (
//           <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
//             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
//               <AlertCircle className="w-10 h-10 text-red-500" />
//             </div>
//             <h3 className="text-xl font-bold text-slate-800">Something went wrong</h3>
//             <p className="text-slate-500 mt-2 max-w-md">{errorMessage}</p>
//             <button 
//               onClick={handleReset}
//               className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" /> Try Again
//             </button>
//           </div>
//         )}

//         {/* STEP 4: DONE (Split View) */}
//         {step === 'done' && (
//           <div className="flex flex-col md:flex-row h-full min-h-[600px]">
            
//             {/* Left: Original Image */}
//             <div className="md:w-1/2 bg-slate-900 p-6 flex flex-col items-center justify-center relative border-r border-slate-200">
//               <div className="absolute top-4 left-4 z-10 flex gap-2">
//                  <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-medium border border-white/10">Original</span>
//               </div>
              
//               {selectedImage && (
//                 <img 
//                   src={selectedImage} 
//                   className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-slate-700" 
//                   alt="Original" 
//                 />
//               )}
//             </div>

//             {/* Right: Translated Result */}
//             <div className="md:w-1/2 flex flex-col bg-white">
//               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-purple-50/30">
//                 <div className="flex items-center gap-2">
//                   <FileText className="w-4 h-4 text-purple-600" />
//                   <span className="font-bold text-slate-700 text-sm">Translated to {lang}</span>
//                 </div>
//                 <button 
//                   onClick={handleReset} 
//                   className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:bg-purple-50 px-3 py-1.5 rounded-lg transition"
//                 >
//                   <UploadCloud className="w-3 h-3" /> New Upload
//                 </button>
//               </div>

//               <div className="flex-1 p-8 overflow-y-auto max-h-[600px] bg-slate-50/50">
//                 <div className="prose prose-slate prose-p:text-slate-700 prose-headings:text-slate-900 max-w-none">
//                    {/* Render Markdown for bolding, lists, headers */}
//                    <ReactMarkdown>{translation}</ReactMarkdown>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };


// --- SUB-COMPONENT: EDULENS TOOL (Image + Lang -> Image) ---
const EduLensTool = () => {
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
  const handleTranslate = () => {
    if (!imageFile) return;
    setIsProcessing(true);
    
    // Simulate API Call to LLM Image Generator
    setTimeout(() => {
      setIsProcessing(false);
      // MOCK RESULT: In reality, this URL would come from your backend
      // Using a slightly different image to simulate "Translation" result
      setResultImage("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800&sat=-100"); 
    }, 3000);
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
              {/* Replace Button Overlay */}
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
                  <button className="bg-white text-slate-900 px-4 py-2 rounded-lg shadow-lg font-medium hover:bg-purple-50 hover:text-purple-600 transition flex items-center gap-2">
                    <Download className="w-4 h-4"/> Save Image
                  </button>
               </div>
             </div>
          ) : (
            <div className="text-center p-8 max-w-xs">
              {isProcessing ? (
                <div className="flex flex-col items-center animate-pulse">
                   <div className="w-16 h-16 bg-purple-200 rounded-2xl mb-4"></div>
                   <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                   <div className="h-3 w-24 bg-slate-200 rounded"></div>
                   <p className="mt-4 text-purple-600 font-bold text-sm">Generative Fill in progress...</p>
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