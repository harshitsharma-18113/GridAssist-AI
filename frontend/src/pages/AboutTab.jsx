import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info, Code2, Users, Rocket, Landmark } from 'lucide-react';
import Branding from '../components/Branding';

const API_BASE = 'https://gridassist-ai.onrender.com';

export default function AboutTab() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/about`)
      .then(response => {
        setAbout(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading about details:", error);
        setLoading(false);
      });
  }, []);

  if (loading || !about) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 text-sm">
        Loading project dossier...
      </div>
    );
  }

  const { project_name, tagline, version, internship, team, tech_stack, future_scope } = about;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Brand Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <Branding layout="column" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Technical Stack */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Code2 size={16} className="text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">System Architecture Tech Stack</h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frontend Client</h4>
              <div className="flex flex-wrap gap-1.5">
                {tech_stack.frontend.map((t, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-650 text-[10px] font-semibold">{t}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backend Gateway</h4>
              <div className="flex flex-wrap gap-1.5">
                {tech_stack.backend.map((t, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-650 text-[10px] font-semibold">{t}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Machine Learning Core</h4>
              <div className="flex flex-wrap gap-1.5">
                {tech_stack.ai.map((t, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700 text-[10px] font-bold">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Future Scope */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <Rocket size={16} className="text-blue-600" />
            <h3 className="font-bold text-sm text-slate-800">Future Scope Development Roadmap</h3>
          </div>
          <div className="p-5 space-y-3">
            {future_scope.map((scope, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <span>{scope}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Team Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <h3 className="font-bold text-sm text-slate-800">Internship Project Development Team</h3>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 space-y-1.5 text-center">
              <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center mx-auto uppercase">
                {member.role.charAt(0)}
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-850">{member.role}</h4>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sai Computers Ltd</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-100/70 pt-2">
                {member.tasks}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
