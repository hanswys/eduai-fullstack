'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Loader2, 
  Calendar, 
  Mail, 
  Download,
  Search,
  AlertTriangle
} from 'lucide-react';

interface WaitlistEntry {
  id: number;
  email: string;
  created_at: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WaitlistEntry[]>([]);
  const [filter, setFilter] = useState('');

  // Fetch data immediately on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/waitlist');
        const { data } = await res.json();
        setData(data || []);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadCSV = () => {
    const headers = 'ID,Email,Date Joined\n';
    const csvContent = data.map(row => 
      `${row.id},${row.email},${new Date(row.created_at).toISOString()}`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredData = data.filter(entry => 
    entry.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Warning Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm text-orange-700">
           <AlertTriangle className="w-4 h-4" />
           <span><strong>Public Access Mode:</strong> This page is currently visible to anyone with the link.</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" /> Waitlist Manager
            </h1>
            <p className="text-slate-500 mt-1">
              Total Signups: <span className="font-bold text-slate-900">{loading ? '...' : data.length}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={downloadCSV}
              disabled={loading || data.length === 0}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition font-medium disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search emails..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-indigo-50/30 transition">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{entry.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                              <Mail className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700">{entry.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(entry.created_at).toLocaleDateString()} 
                            <span className="text-slate-300">|</span> 
                            {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                        No emails found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}