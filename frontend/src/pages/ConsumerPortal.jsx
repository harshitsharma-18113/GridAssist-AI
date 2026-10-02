import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, 
  Plus, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Upload, 
  Sparkles, 
  BrainCircuit, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  LogOut,
  ChevronRight,
  Building,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Toast, Modal } from '../components/Feedbacks';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';

export default function ConsumerPortal({ initialView = 'login' }) {
  const navigate = useNavigate();
  const [view, setView] = useState(initialView);
  const [consumer, setConsumer] = useState(() => {
    const saved = localStorage.getItem('consumer_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    const saved = localStorage.getItem('consumer_session');
    if (saved) {
      setConsumer(JSON.parse(saved));
    }
  }, [view]);
  
  // Auth states
  const [loginEmail, setLoginEmail] = useState('consumer@utility.com');
  const [loginPass, setLoginPass] = useState('password');
  const [regData, setRegData] = useState({
    name: '',
    consumer_number: '',
    mobile: '',
    email: '',
    password: ''
  });
  
  // Feedback states
  const [toast, setToast] = useState(null); // { message: '', type: 'success' }
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard / History States
  const [myComplaints, setMyComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, critical: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);

  // Multi-step form states
  const [step, setStep] = useState(1); // 1: Consumer, 2: Complaint, 3: Location, 4: Image, 5: AI Preview
  const [formData, setFormData] = useState({
    consumerName: '',
    consumerNumber: '',
    mobileNumber: '',
    location: '',
    title: '',
    description: '',
    category: 'Power Outage',
    priority: 'Medium'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiPreview, setAiPreview] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Tracker states
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Auto-fill consumer details when form is initialized
  useEffect(() => {
    if (consumer) {
      setFormData(prev => ({
        ...prev,
        consumerName: consumer.name,
        consumerNumber: consumer.consumer_number,
        mobileNumber: consumer.mobile
      }));
    }
  }, [consumer, view]);

  // Fetch consumer tickets
  const fetchConsumerTickets = () => {
    if (!consumer) return;
    setHistoryLoading(true);
    api.getComplaints({ limit: 100 })
      .then(response => {
        const filtered = response.data.complaints.filter(c => c.consumer_number === consumer.consumer_number);
        setMyComplaints(filtered);
        
        const total = filtered.length;
        const pending = filtered.filter(c => c.status === 'Pending' || c.status === 'Assigned').length;
        const resolved = filtered.filter(c => c.status === 'Resolved').length;
        const critical = filtered.filter(c => c.priority === 'Critical').length;
        setStats({ total, pending, resolved, critical });
        
        setHistoryLoading(false);
      })
      .catch(err => {
        console.error(err);
        setHistoryLoading(false);
      });
  };

  useEffect(() => {
    if (consumer && (view === 'dashboard' || view === 'history')) {
      fetchConsumerTickets();
    }
  }, [consumer, view]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    api.consumerLogin({ email: loginEmail, password: loginPass })
      .then(response => {
        setConsumer(response.data);
        localStorage.setItem('consumer_session', JSON.stringify(response.data));
        setView('dashboard');
        setAuthLoading(false);
        setToast({ message: `Welcome back, ${response.data.name}!`, type: 'success' });
      })
      .catch(err => {
        setAuthError(err.response?.data?.detail || 'Invalid email or password.');
        setAuthLoading(false);
      });
  };

  // Register handler with validation
  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');

    // Input Validation
    if (!regData.name.trim()) {
      setAuthError('Name is required.');
      return;
    }
    if (!regData.consumer_number.startsWith('CON-') || regData.consumer_number.length !== 9) {
      setAuthError('Connection Number must start with "CON-" followed by 5 digits (e.g. CON-90210).');
      return;
    }
    if (!/^\d{10}$/.test(regData.mobile)) {
      setAuthError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (regData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);

    api.consumerRegister(regData)
      .then(response => {
        setAuthSuccess('Registration successful! Redirecting to login...');
        setRegData({ name: '', consumer_number: '', mobile: '', email: '', password: '' });
        setAuthLoading(false);
        setToast({ message: 'Profile created successfully!', type: 'success' });
        setTimeout(() => {
          setAuthSuccess('');
          setView('login');
        }, 1500);
      })
      .catch(err => {
        setAuthError(err.response?.data?.detail || 'Registration failed.');
        setAuthLoading(false);
      });
  };

  // Form step navigation helpers with validation
  const nextStep = () => {
    setFormError('');
    
    if (step === 1 && (!formData.consumerName || !formData.consumerNumber || !formData.mobileNumber)) {
      setFormError('Please fill out all consumer details.');
      return;
    }
    
    if (step === 2) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setFormError('Please fill out both Title and Description.');
        return;
      }
      if (formData.description.length < 15) {
        setFormError('Please provide a descriptive explanation (minimum 15 characters) for AI diagnostics.');
        return;
      }
    }
    
    if (step === 3 && !formData.location.trim()) {
      setFormError('Location details are required.');
      return;
    }
    
    if (step === 4) {
      runAIAnalysis();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setFormError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Run AI analysis for preview
  const runAIAnalysis = () => {
    setAiAnalyzing(true);
    api.analyzeComplaint({ title: formData.title, description: formData.description })
      .then(response => {
        setAiPreview(response.data);
        setFormData(prev => ({
          ...prev,
          category: response.data.category,
          priority: response.data.priority
        }));
        setAiAnalyzing(false);
        setStep(5);
      })
      .catch(err => {
        console.error(err);
        setFormError('AI diagnostic module failed.');
        setAiAnalyzing(false);
      });
  };

  // Log complaint final submit
  const handleComplaintSubmit = () => {
    setSubmitLoading(true);
    
    const submitData = new FormData();
    submitData.append('consumer_name', formData.consumerName);
    submitData.append('consumer_number', formData.consumerNumber);
    submitData.append('mobile_number', formData.mobileNumber);
    submitData.append('location', formData.location);
    submitData.append('category', formData.category);
    submitData.append('priority', formData.priority);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    api.createComplaint(submitData)
      .then(response => {
        setToast({ message: `Complaint CMP-2026-${response.data.complaint_id} logged successfully!`, type: 'success' });
        setSubmitLoading(false);
        
        // Reset form
        setFormData({
          consumerName: consumer?.name || '',
          consumerNumber: consumer?.consumer_number || '',
          mobileNumber: consumer?.mobile || '',
          location: '',
          title: '',
          description: '',
          category: 'Power Outage',
          priority: 'Medium'
        });
        setImageFile(null);
        setImagePreview(null);
        setAiPreview(null);
        setStep(1);

        setView('dashboard');
      })
      .catch(err => {
        console.error(err);
        if (err.response?.status === 409) {
          setFormError('Duplicate complaint detected. You have submitted an identical request within the last 5 minutes.');
          setToast({ message: 'Duplicate ticket blocked.', type: 'error' });
        } else {
          setFormError('Failed to record complaint in database.');
        }
        setSubmitLoading(false);
      });
  };

  // Tracking query submit
  const handleTrackingQuery = (e) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) return;
    
    setTrackLoading(true);
    setTrackError('');
    setTrackResults([]);

    api.trackComplaint(trackQuery)
      .then(response => {
        if (response.data.length === 0) {
          setTrackError('No matching active tickets found.');
        } else {
          setTrackResults(response.data);
          setToast({ message: `Loaded ${response.data.length} tickets.`, type: 'info' });
        }
        setTrackLoading(false);
      })
      .catch(err => {
        setTrackError('Error querying database.');
        setTrackLoading(false);
      });
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSignOutConfirm = () => {
    setConsumer(null);
    localStorage.removeItem('consumer_session');
    setIsConfirmOpen(false);
    setToast({ message: 'Signed out successfully.', type: 'info' });
    setView('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Alert Feedback */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isConfirmOpen} 
        title="Sign Out" 
        message="Are you sure you want to end your active session?" 
        onConfirm={handleSignOutConfirm} 
        onCancel={() => setIsConfirmOpen(false)} 
        confirmText="Sign Out"
      />

      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="cursor-pointer select-none" onClick={() => navigate('/landing')}>
          <CompanyBrand variant="horizontal" />
        </div>
        
        {consumer && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline select-none">
              Welcome, <strong className="text-slate-800">{consumer.name}</strong>
            </span>
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="text-xs font-bold text-red-650 hover:text-red-750 bg-red-50 hover:bg-red-100/70 border border-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Main Workspace */}
      <main className="flex-grow p-6 md:p-8 max-w-6xl w-full mx-auto flex flex-col justify-center">

        {/* 1. CONSUMER LOGIN VIEW */}
        {view === 'login' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center space-y-2 select-none">
              <h2 className="text-xl font-bold">Consumer Resolution Desk</h2>
              <p className="text-xs text-slate-300 font-light">Sign in to report outages and track engineering dispatches</p>
            </div>
            
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-655" />
                  {authError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="e.g. consumer@utility.com"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow transition-all cursor-pointer"
              >
                {authLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setView('track'); setTrackResults([]); setTrackQuery(''); setTrackError(''); }}
                  className="text-slate-600 hover:underline font-semibold cursor-pointer"
                >
                  Track Public Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. CONSUMER REGISTER VIEW */}
        {view === 'register' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center space-y-2 select-none">
              <h2 className="text-xl font-bold">Register Grid Account</h2>
              <p className="text-xs text-slate-300 font-light">Link your consumer ID and mobile number to GridAssist AI</p>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-600" />
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600" />
                  {authSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={regData.name}
                  onChange={(e) => setRegData({...regData, name: e.target.value})}
                  required
                  placeholder="e.g. Arjun Sharma"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connection No.</label>
                  <input
                    type="text"
                    value={regData.consumer_number}
                    onChange={(e) => setRegData({...regData, consumer_number: e.target.value})}
                    required
                    placeholder="CON-XXXXX"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    value={regData.mobile}
                    onChange={(e) => setRegData({...regData, mobile: e.target.value})}
                    required
                    placeholder="10 digits"
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  required
                  placeholder="e.g. user@utility.com"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow transition-all cursor-pointer"
              >
                {authLoading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. CONSUMER DASHBOARD */}
        {view === 'dashboard' && consumer && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm select-none">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">Consumer Board: {consumer.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Building size={14} /> Connection: {consumer.consumer_number}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> Mobile: {consumer.mobile}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setView('submit'); setStep(1); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow cursor-pointer transition-all"
                >
                  <Plus size={14} />
                  Filing Complaint
                </button>
                <button
                  onClick={() => { setView('track'); setTrackQuery(consumer.mobile); handleTrackingQuery(); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 cursor-pointer transition-all"
                >
                  <Search size={14} />
                  Track Live Status
                </button>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Filed</span>
                <span className="text-2xl font-extrabold text-slate-900">{stats.total}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Active</span>
                <span className="text-2xl font-extrabold text-blue-600">{stats.pending}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resolved Tickets</span>
                <span className="text-2xl font-extrabold text-emerald-600">{stats.resolved}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Critical Issues</span>
                <span className="text-2xl font-extrabold text-red-655">{stats.critical}</span>
              </div>
            </div>

            {/* My Complaints list */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">My Registered Complaints</h3>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Realtime Grid Synchronization</span>
              </div>

              {historyLoading ? (
                <div className="p-12 text-center text-xs text-slate-500">Loading connection tickets...</div>
              ) : myComplaints.length === 0 ? (
                <div className="p-12 text-center text-sm text-slate-400 font-medium">
                  No complaints logged under this connection ID. Click 'Filing Complaint' above to register issues.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 font-bold text-xs uppercase tracking-wider">
                        <th className="p-4 px-6">Complaint ID</th>
                        <th className="p-4 px-6">Title</th>
                        <th className="p-4 px-6">Category</th>
                        <th className="p-4 px-6">Status</th>
                        <th className="p-4 px-6">Priority</th>
                        <th className="p-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 text-sm">
                      {myComplaints.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 px-6 font-mono text-xs font-bold text-blue-600">{c.complaint_id}</td>
                          <td className="p-4 px-6 font-semibold">{c.title}</td>
                          <td className="p-4 px-6 text-xs text-slate-500">{c.category}</td>
                          <td className="p-4 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                              ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-255' :
                                c.status === 'Pending' ? 'bg-slate-50 text-slate-750 border-slate-200' :
                                'bg-blue-50 text-blue-800 border-blue-200'}
                            `}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border
                              ${c.priority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                                c.priority === 'High' ? 'bg-orange-50 text-orange-850 border-orange-200' :
                                'bg-slate-50 text-slate-600 border-slate-100'}
                            `}>
                              {c.priority}
                            </span>
                          </td>
                          <td className="p-4 px-6 text-center">
                            <button
                              onClick={() => { setTrackQuery(c.complaint_id); handleTrackingQuery(); setView('track'); }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              Track Progress
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. SUBMIT COMPLAINT MULTI-STEP */}
        {view === 'submit' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden">
            
            <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
              <div>
                <h3 className="font-bold text-lg">File Grid Complaint</h3>
                <p className="text-xs text-slate-300 font-light">Follow the 5 steps to seed diagnostics and register dispatch</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {[1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border
                      ${step === i ? 'bg-blue-600 text-white border-blue-500 font-bold' :
                        step > i ? 'bg-emerald-600 text-white border-emerald-500' :
                        'bg-white/10 text-white/50 border-white/20'}
                    `}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-650 animate-pulse" />
                  {formError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-600" />
                  {authSuccess}
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 select-none">Step 1: Verification Profile</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-650">Consumer Name</label>
                      <input
                        type="text"
                        value={formData.consumerName}
                        onChange={(e) => setFormData({...formData, consumerName: e.target.value})}
                        disabled
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-655">Connection Reference</label>
                      <input
                        type="text"
                        value={formData.consumerNumber}
                        onChange={(e) => setFormData({...formData, consumerNumber: e.target.value})}
                        disabled
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-650">Registered Mobile Number</label>
                      <input
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                        disabled
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 select-none">Step 2: Issue Statement</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-650">Complaint Header / Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g. Total blackout in Street #3"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-650">Detailed Feedback Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      rows={4}
                      placeholder="Provide precise details of the electrical failure... (min 15 chars)"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 select-none">Step 3: Location Details</h4>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-650">Grid Area Location Address</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                      placeholder="e.g. Flat 104, Indiranagar, Bangalore"
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 select-none">Step 4: Image Evidence (Optional)</h4>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="flex-grow flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-55 hover:bg-slate-100/55 cursor-pointer transition-colors w-full">
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <span className="text-xs font-semibold text-slate-600">Choose Image File</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {imagePreview && (
                      <div className="w-36 h-28 relative rounded-lg border overflow-hidden">
                        <img src={imagePreview} alt="upload" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-1 right-1 bg-red-650 text-white rounded-full p-1 text-[10px] cursor-pointer hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && aiPreview && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b pb-2 select-none">Step 5: Diagnostics Verification</h4>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-150 pb-2">
                      <div className="flex items-center gap-1 text-blue-800 font-bold text-xs">
                        <Sparkles size={14} className="text-blue-600 animate-pulse" />
                        <span>AI Diagnostic Prediction Findings</span>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-850 px-2 py-0.5 rounded">
                        Confidence: {aiPreview.confidence}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Category</span>
                        <span className="font-semibold text-slate-800">{aiPreview.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Severity</span>
                        <span className="font-semibold text-slate-800">{aiPreview.priority}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Expected Resolution</span>
                        <span className="font-semibold text-slate-800">{aiPreview.estimated_resolution_time}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Responsible Department</span>
                        <span className="font-semibold text-slate-800">{aiPreview.department}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider opacity-85 block font-bold mb-0.5">Recommended Routing:</span>
                      {aiPreview.recommended_action}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed select-none">
                    By submitting, this ticket will be saved into GridAssist AI and routed to the corresponding department technician instantly.
                  </p>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 select-none">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={aiAnalyzing || submitLoading}
                    className="px-4 py-2 border border-slate-200 text-slate-705 font-semibold text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Previous
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setView('dashboard')}
                    className="px-4 py-2 border border-slate-200 text-slate-750 font-semibold text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={aiAnalyzing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition-all cursor-pointer flex items-center gap-1"
                  >
                    {aiAnalyzing ? (
                      <>
                        <BrainCircuit size={14} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleComplaintSubmit}
                    disabled={submitLoading || authSuccess}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-all"
                  >
                    {submitLoading ? 'Logging...' : 'Confirm & Log Complaint'}
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 5. TRACK COMPLAINT */}
        {view === 'track' && (
          <div className="space-y-6 max-w-4xl w-full mx-auto">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 select-none">
                <button
                  onClick={() => setView(consumer ? 'dashboard' : 'login')}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Universal Tracker Console</h3>
                  <p className="text-[11px] text-slate-500">Query active dispatches instantly using Ticket ID or Mobile Digits</p>
                </div>
              </div>

              <form onSubmit={handleTrackingQuery} className="flex gap-2">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter CMP-2026-XXXX or Mobile digits..."
                  required
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer"
                >
                  {trackLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {trackError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg select-none">
                  {trackError}
                </div>
              )}
            </div>

            {/* Results */}
            {trackResults.map((c, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
                
                <div className="flex flex-wrap items-center justify-between border-b pb-4 border-slate-100 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 select-none">
                      {c.complaint_id}
                    </span>
                    <h4 className="font-bold text-slate-800 text-lg mt-1">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 select-none">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border
                      ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                        c.status === 'Pending' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-blue-50 text-blue-800 border-blue-200'}
                    `}>
                      {c.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border
                      ${c.priority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                        c.priority === 'High' ? 'bg-orange-50 text-orange-850 border-orange-200' :
                        'bg-slate-50 text-slate-655 border-slate-100'}
                    `}>
                      {c.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5 text-xs text-slate-650">
                      <p><strong>Description:</strong> {c.description}</p>
                      <p><strong>Location:</strong> {c.location}</p>
                      <p><strong>AI Predicted Category:</strong> {c.predicted_category || c.category}</p>
                      <p><strong>Confidence Score:</strong> {c.prediction_confidence || 96}%</p>
                      <p><strong>Expected Resolution:</strong> {c.est_resolution_time || '4 Hours'}</p>
                    </div>

                    {c.assigned_engineer && (
                      <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-blue-800 font-bold select-none">
                          <UserCheck size={14} />
                          <span>Field Technician Dispatched</span>
                        </div>
                        <p className="text-slate-600"><strong>Name:</strong> {c.assigned_engineer.name}</p>
                        <p className="text-slate-600"><strong>Department:</strong> {c.assigned_engineer.department}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block select-none">Dispatch Timestones</h5>
                    
                    <div className="flow-root text-xs">
                      <ul className="-mb-8">
                        {c.timeline.map((step, sIdx) => {
                          const isLast = sIdx === c.timeline.length - 1;
                          return (
                            <li key={sIdx}>
                              <div className="relative pb-6">
                                {!isLast && (
                                  <span className="absolute top-4 left-3 -ml-px h-full w-0.5 bg-slate-200" />
                                )}
                                <div className="relative flex space-x-2.5">
                                  <div>
                                    <span className={`h-6.5 w-6.5 rounded-full flex items-center justify-center ring-4 ring-white
                                      ${step.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                                        step.status === 'Assigned' ? 'bg-blue-100 text-blue-600' :
                                        step.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                                        'bg-slate-100 text-slate-500'}
                                    `}>
                                      {step.status === 'Resolved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="font-bold text-slate-800 text-[11px]">{step.title}</p>
                                    <p className="text-[10px] text-slate-500">{step.description}</p>
                                    {step.timestamp && (
                                      <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                                        {new Date(step.timestamp).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
