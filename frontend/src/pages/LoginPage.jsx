import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api } from '../services/api';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gridassist.ai');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    
    api.adminLogin({ email, password })
      .then(response => {
        localStorage.setItem('admin_session', 'true');
        setSuccess('Login successful! Redirecting to Dashboard...');
        setLoading(false);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Invalid Email or Password.');
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <CompanyBrand variant="vertical" />
            <p className="text-sm text-slate-500 pt-2">
              Sign in to the Complaint & Resolution Console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-semibold">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
                {success}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                  placeholder="admin@utility.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
