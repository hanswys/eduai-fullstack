'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'; // Import this to track where user is
import { MessageSquarePlus, X, Send, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/authContext';

// Define your backend URL (or use an env variable)
const API_URL = 'http://localhost:8000'; 

export default function FeedbackWidget() {
  const { user } = useAuth();
  const pathname = usePathname(); // Get current route
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');

    try {
      // 1. Get the Firebase Token for Authentication
      const token = await user.getIdToken();

      // 2. Send to Backend
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Secure the request
        },
        body: JSON.stringify({
          message: message,
          path: pathname // Send the current page URL
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setStatus('sent');
      
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
        setStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Feedback error:', error);
      setStatus('error');
      // Reset error status after 3 seconds so they can try again
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl shadow-indigo-500/10 rounded-2xl p-4 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300 origin-bottom-right mb-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800">Your Feedback</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {status === 'sent' ? (
            <div className="flex flex-col items-center justify-center py-8 text-green-600 animate-in zoom-in duration-300">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Thanks for helping us improve!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Report a bug, suggest a feature..."
                className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-3 transition shadow-sm"
                autoFocus
                disabled={status === 'sending'}
              />
              
              {/* Error Message Display */}
              {status === 'error' && (
                <p className="text-xs text-red-500 mb-2">Failed to send. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {status === 'sending' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {status === 'sending' ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white/20 ${
          isOpen 
            ? 'bg-slate-800 text-white rotate-90' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquarePlus className="w-6 h-6" />}
      </button>
    </div>
  );
}