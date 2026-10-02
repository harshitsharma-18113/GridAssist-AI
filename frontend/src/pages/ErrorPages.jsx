import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, HelpCircle, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm animate-bounce">
          <HelpCircle size={32} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested console path does not exist on the GridAssist AI local routing server.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Gateway
        </button>
      </div>
      <Footer />
    </div>
  );
}

export function ServerErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-155 flex items-center justify-center text-red-600 shadow-sm animate-pulse">
          <AlertOctagon size={32} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800">Database Offline</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The GridAssist AI local database connection is unreachable or threw a 500 execution fault.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Gateway
        </button>
      </div>
      <Footer />
    </div>
  );
}
