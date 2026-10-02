import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6">
          {/* GridAssist AI logo placeholder */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <LayoutGrid size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              GridAssist AI
            </h1>
            <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
              AI-Powered Consumer Complaint & Smart Resolution System
            </p>
          </div>
          
          <div className="w-full border-t border-slate-100 pt-6">
            <CompanyBrand variant="splash" />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
