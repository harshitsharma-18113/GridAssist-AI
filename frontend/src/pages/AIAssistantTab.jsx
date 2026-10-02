import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, User, MessageCircle, HelpCircle } from 'lucide-react';

const API_BASE = 'https://gridassist-ai.onrender.com';

export default function AIAssistantTab() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am GridAssist AI. I can analyze complaints, report statistics, and list grid technical details. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef(null);

  const exampleQuestions = [
    "Show pending complaints",
    "Show critical complaints",
    "Which category has maximum complaints?",
    "Show transformer complaints",
    "What are today's complaint trends?"
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, submitting]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim() || submitting) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setSubmitting(true);

    // Call API
    axios.post(`${API_BASE}/ai/query`, { query: textToSend })
      .then(response => {
        const aiMsg = {
          sender: 'ai',
          text: response.data.response,
          timestamp: new Date(response.data.timestamp)
        };
        setMessages(prev => [...prev, aiMsg]);
        setSubmitting(false);
      })
      .catch(error => {
        console.error("AI agent query failed:", error);
        const errorMsg = {
          sender: 'ai',
          text: "I encountered an error querying the model gateway. Please verify that the FastAPI backend is running.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
        setSubmitting(false);
      });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(query);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* Left Example Questions Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
            <HelpCircle size={18} className="text-blue-600" />
            <h3>Ask GridAssist AI</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click any example prompt below to query the database and generate instant analysis report summaries.
          </p>
          <div className="space-y-2">
            {exampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={submitting}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-blue-700 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-900/60 font-semibold leading-relaxed">
          🔒 Architecture ready for Gemini Enterprise & OpenAI GPT API integrations in future sprints.
        </div>
      </div>

      {/* Right Chat Panel */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Grid Resolution Copilot</h3>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Gemini LLM Core Gateway</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Prototype Active
          </span>
        </div>

        {/* Chat Message Box */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[calc(100vh-23rem)] min-h-[300px] bg-slate-50/30">
          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            return (
              <div key={idx} className={`flex items-start gap-3 ${!isAI && 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shadow-sm shrink-0
                  ${isAI 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-slate-650 border-slate-200'}
                `}>
                  {isAI ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] p-3.5 rounded-xl shadow-sm border text-xs leading-relaxed
                  ${isAI 
                    ? 'bg-white text-slate-700 border-slate-200 rounded-tl-none' 
                    : 'bg-blue-600 text-white border-blue-600 rounded-tr-none'}
                `}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[8px] font-mono block mt-1 text-right
                    ${isAI ? 'text-slate-400' : 'text-blue-100'}
                  `}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {submitting && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white border border-blue-600 flex items-center justify-center shadow-sm shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white text-slate-400 border border-slate-200 px-4 py-2.5 rounded-xl rounded-tl-none text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Query Input Footer */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={submitting}
            placeholder="Type your grid question (e.g. show critical complaints)..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || submitting}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>

      </div>

    </div>
  );
}
