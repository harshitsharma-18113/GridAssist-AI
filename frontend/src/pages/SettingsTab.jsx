import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Bell, 
  Paintbrush, 
  Cpu, 
  CheckCircle,
  Database,
  Info
} from 'lucide-react';

const API_BASE = 'https://gridassist-ai.onrender.com';

export default function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Local state for UI toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [activeTheme, setActiveTheme] = useState('Light');

  useEffect(() => {
    axios.get(`${API_BASE}/settings`)
      .then(response => {
        setSettings(response.data);
        setEmailAlerts(response.data.notifications.email_alerts);
        setCriticalAlerts(response.data.notifications.critical_complaint_alerts);
        setActiveTheme(response.data.appearance.theme);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      });
  }, []);

  if (loading || !settings) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 text-sm">
        Loading system configuration console...
      </div>
    );
  }

  const { profile, system } = settings;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      
      {/* 1. User Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Administrator Profile</h3>
        </div>
        <div className="p-6 space-y-4 flex-1">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</span>
            <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
            <p className="text-sm font-mono font-semibold text-slate-800">{profile.email}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Role</span>
            <p className="text-sm font-semibold text-slate-800">{profile.role}</p>
          </div>
        </div>
      </div>

      {/* 2. Notification Dispatch Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <Bell size={16} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Notification Dispatcher</h3>
        </div>
        <div className="p-6 space-y-5 flex-1 justify-center flex flex-col">
          {/* Email Alerts Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700">Email Notifications</p>
              <p className="text-[10px] text-slate-400">Receive summaries of general consumer complaints</p>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${emailAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Critical Alerts Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700">Critical Fault Alarms</p>
              <p className="text-[10px] text-slate-400">Instant alarms on transformer explosions or severe fires</p>
            </div>
            <button
              onClick={() => setCriticalAlerts(!criticalAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${criticalAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${criticalAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Theme Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <Paintbrush size={16} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Appearance Theme</h3>
        </div>
        <div className="p-6 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTheme('Light')}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer
                ${activeTheme === 'Light' 
                  ? 'border-blue-500 bg-blue-50/40 text-blue-700 font-bold' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-650'}`}
            >
              <span className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-inner block" />
              <span className="text-xs">Light Theme</span>
            </button>
            
            <button
              disabled
              title="Dark Mode scheduled for future release"
              className="p-4 border border-slate-100 opacity-50 rounded-xl flex flex-col items-center gap-2 cursor-not-allowed text-slate-400"
            >
              <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 block" />
              <span className="text-xs">Dark Mode (Reserved)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Diagnostics & System */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <Cpu size={16} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Console Diagnostics</h3>
        </div>
        <div className="p-6 space-y-3.5 flex-1">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Software Version</span>
            <span className="font-mono font-bold text-slate-700">{system.version}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">SQLite Database status</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Database size={14} className="text-blue-600" />
              <span>Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">FastAPI Endpoint Status</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle size={14} />
              <span>Running</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
