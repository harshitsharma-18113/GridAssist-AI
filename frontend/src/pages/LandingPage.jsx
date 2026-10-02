import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Cpu, Wrench, Shield, CheckCircle, Search, ArrowRight, Activity, Zap } from 'lucide-react';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header bar */}
      <nav className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
        <CompanyBrand variant="horizontal" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/engineer/login')}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            Technician Console
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-all cursor-pointer"
          >
            Admin Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <Zap size={14} />
            Smart Grid Solutions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            AI-Powered Consumer Complaint & Smart Resolution System
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl font-light">
            Empowering utility grids with machine learning classifiers for automated diagnostic routing, technician dispatches, and real-time resolution timeline tracking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/consumer/login')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              Consumer Login
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/track')}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search size={16} />
              Track Complaint Status
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Model Accuracy</span>
            <h3 className="text-3xl font-extrabold text-blue-600">96.4%</h3>
            <p className="text-xs text-slate-500 font-semibold">Automatic classification confidence</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Seeded Training Logs</span>
            <h3 className="text-3xl font-extrabold text-blue-600">320+</h3>
            <p className="text-xs text-slate-500 font-semibold">Utility complaint cases loaded</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Resolution</span>
            <h3 className="text-3xl font-extrabold text-blue-600">2.4h</h3>
            <p className="text-xs text-slate-500 font-semibold">Dispatch closure timeline</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Technicians</span>
            <h3 className="text-3xl font-extrabold text-blue-600">4</h3>
            <p className="text-xs text-slate-500 font-semibold">Auto-dispatch routing grid</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-white border-t border-b border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">How GridAssist AI Works</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Seamless automation from consumer registration to engineering resolution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-lg font-bold">1</div>
              <h3 className="font-bold text-sm text-slate-800">Consumer Filing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consumers file grid issues through a smart step-by-step form. AI parses descriptions to generate diagnostics.
              </p>
            </div>

            <div className="space-y-3 text-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-lg font-bold">2</div>
              <h3 className="font-bold text-sm text-slate-800">Smart Auto-Routing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The Scikit-learn classification engine categorizes issues and automatically dispatches the corresponding team.
              </p>
            </div>

            <div className="space-y-3 text-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-lg font-bold">3</div>
              <h3 className="font-bold text-sm text-slate-800">Field Dispatch & Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Field technicians log progress updates in real-time, while consumers monitor updates via the live timeline tracker.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">GridAssist AI Features</h2>
          <p className="text-sm text-slate-500">Enterprise tools for smart utility management and consumer resolution</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Cpu className="text-blue-600" size={24} />
            <h3 className="font-bold text-sm text-slate-800">TF-IDF Classifier</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Trains on 320+ loaded grid complaints to predict category, severity, and departments dynamically.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Wrench className="text-blue-600" size={24} />
            <h3 className="font-bold text-sm text-slate-800">Technician Workspace</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Dedicated technician dashboards to receive dispatches, write resolution logs, and upload completed image logs.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Search className="text-blue-600" size={24} />
            <h3 className="font-bold text-sm text-slate-800">Universal Tracker</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Allows public users to query progress timeline logs instantly using only ticket IDs or mobile digits.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Activity className="text-blue-600" size={24} />
            <h3 className="font-bold text-sm text-slate-800">Diagnostics Control</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Admin console dashboards with real-time analytics graphs, notification logs, system health checks, and alerts.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <Shield className="text-blue-600" size={24} />
            <h3 className="font-bold text-sm text-slate-800">Rule-based Fallback</h3>
            <p className="text-xs text-slate-550 leading-relaxed">
              Guarantees zero system downtime with an integrated regular expression keyword matching classifier fallback.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-center items-center text-center border-dashed border-slate-300 bg-slate-50/50">
            <CheckCircle className="text-slate-400" size={24} />
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wide mt-2">More Modules Planned</h3>
            <p className="text-[10px] text-slate-400">Gemini LLM integrations, IoT meter pings, and GIS coordinates scheduled next.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
