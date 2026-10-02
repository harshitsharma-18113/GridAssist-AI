import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Wrench, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Upload, 
  AlertCircle, 
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { Toast, Modal } from '../components/Feedbacks';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';

export default function EngineerPortal({ initialView = 'login' }) {
  const navigate = useNavigate();
  const [view, setView] = useState(initialView);
  const [engineer, setEngineer] = useState(() => {
    const saved = localStorage.getItem('engineer_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    const saved = localStorage.getItem('engineer_session');
    if (saved) {
      setEngineer(JSON.parse(saved));
    }
  }, [view]);

  // Login states
  const [email, setEmail] = useState('engineer@utility.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Feedbacks
  const [toast, setToast] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Task list states
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Status update states
  const [statusVal, setStatusVal] = useState('In Progress');
  const [remarks, setRemarks] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [updateSubmitting, setUpdateSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Fetch engineer's tasks
  const fetchTasks = () => {
    if (!engineer) return;
    setTasksLoading(true);
    api.getEngineerTasks(engineer.id)
      .then(response => {
        setTasks(response.data);
        setTasksLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTasksLoading(false);
      });
  };

  useEffect(() => {
    if (engineer && view === 'dashboard') {
      fetchTasks();
    }
  }, [engineer, view]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    api.engineerLogin({ email, password })
      .then(response => {
        setEngineer(response.data);
        localStorage.setItem('engineer_session', JSON.stringify(response.data));
        setView('dashboard');
        setLoading(false);
        setToast({ message: `Welcome, Tech ${response.data.name}!`, type: 'success' });
      })
      .catch(err => {
        setError(err.response?.data?.detail || 'Invalid engineer credentials.');
        setLoading(false);
      });
  };

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit status update
  const handleStatusUpdate = (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    // Validation
    if (remarks.trim().length < 5) {
      setError('Please provide descriptive log notes (minimum 5 characters).');
      return;
    }

    setUpdateSubmitting(true);
    setError('');

    const upData = new FormData();
    upData.append('complaint_id', selectedTask.id);
    upData.append('engineer_id', engineer.id);
    upData.append('status', statusVal);
    upData.append('remarks', remarks);
    if (uploadFile) {
      upData.append('image', uploadFile);
    }

    api.updateEngineerProgress(upData)
      .then(response => {
        setUpdateSuccess('Task status updated successfully!');
        setRemarks('');
        setUploadFile(null);
        setImagePreview(null);
        setUpdateSubmitting(false);
        setToast({ message: 'Log notes transmitted to grid DB!', type: 'success' });

        fetchTasks();
        
        setTimeout(() => {
          setUpdateSuccess('');
          setSelectedTask(null);
        }, 1500);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to transmit progress report.');
        setUpdateSubmitting(false);
      });
  };

  const handleSignOutConfirm = () => {
    setEngineer(null);
    localStorage.removeItem('engineer_session');
    setIsConfirmOpen(false);
    setToast({ message: 'Technician logged out.', type: 'info' });
    setView('login');
  };

  const activeCount = tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Feedbacks */}
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
        title="Technician Logout" 
        message="Are you sure you want to end your active dispatch session?" 
        onConfirm={handleSignOutConfirm} 
        onCancel={() => setIsConfirmOpen(false)} 
        confirmText="Logout"
      />

      {/* Navbar */}
      <nav className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="cursor-pointer select-none" onClick={() => navigate('/landing')}>
          <CompanyBrand variant="horizontal" />
        </div>
        
        {engineer && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline select-none">
              Tech Console: <strong className="text-slate-800">{engineer.name}</strong>
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

      {/* Workspace Area */}
      <main className="flex-grow p-6 md:p-8 max-w-6xl w-full mx-auto flex flex-col justify-center">

        {/* 1. LOGIN */}
        {view === 'login' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center space-y-2 select-none">
              <h2 className="text-xl font-bold flex items-center justify-center gap-1.5">
                <Wrench size={20} />
                Technician Dispatch Login
              </h2>
              <p className="text-xs text-slate-300 font-light">Access allocated grid repair tasks and update status metrics</p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-600" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technician Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. engineer@utility.com"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access PIN / Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-lg shadow transition-all cursor-pointer"
              >
                {loading ? 'Verifying Credentials...' : 'Sign In to Grid'}
              </button>
            </form>
          </div>
        )}

        {/* 2. DASHBOARD */}
        {view === 'dashboard' && engineer && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800">Technician Control Console</h2>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span>Name: <strong className="text-slate-700">{engineer.name}</strong></span>
                  <span>Dept: <strong className="text-slate-700">{engineer.department}</strong></span>
                </div>
              </div>
              
              <div className="flex gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg bg-blue-50 text-blue-700 border-blue-100">
                  <Clock size={16} />
                  <span>{activeCount} Active Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg bg-emerald-50 text-emerald-700 border-emerald-100">
                  <CheckCircle size={16} />
                  <span>{completedCount} Completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Task list Column */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block border-b pb-2 select-none">Allocated Grid Dispatches</h3>
                
                {tasksLoading ? (
                  <div className="bg-white p-12 text-center text-xs border border-slate-200 rounded-xl text-slate-550">Loading task dispatches...</div>
                ) : tasks.length === 0 ? (
                  <div className="bg-white p-12 text-center text-sm border border-slate-200 rounded-xl text-slate-400 font-medium">
                    No active dispatches routed by AI.
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {tasks.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className={`p-4 border rounded-xl bg-white shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md
                          ${selectedTask?.id === t.id ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'}
                        `}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                              {t.complaint_id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border
                              ${t.status === 'Resolved' ? 'bg-emerald-55 text-emerald-800 border-emerald-100' :
                                t.status === 'Pending' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                'bg-blue-50 text-blue-800 border-blue-100'}
                            `}>
                              {t.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={13} /> {t.location}</span>
                            <span>Client: {t.consumer_name}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 bg-slate-105 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Details / Update Form Column */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block border-b pb-2 mb-4 select-none">Diagnostics Dispatch Tool</h3>
                
                {!selectedTask ? (
                  <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-xs text-slate-400 font-medium select-none">
                    Select a complaint dispatch card to inspect client details and update progress.
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 animate-in slide-in-from-right-5 duration-200">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-blue-600 block">{selectedTask.complaint_id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedTask.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 border rounded mt-2">{selectedTask.description}</p>
                    </div>

                    <form onSubmit={handleStatusUpdate} className="space-y-4 pt-2 border-t border-slate-100">
                      
                      {updateSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-600" />
                          {updateSuccess}
                        </div>
                      )}

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                          <AlertCircle size={14} className="text-red-650" />
                          {error}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Update Status</label>
                        <select
                          value={statusVal}
                          onChange={(e) => setStatusVal(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Work Log Remarks</label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          required
                          rows={3}
                          placeholder="Provide details regarding repairs completed... (min 5 chars)"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-650">Resolution Photo (Optional)</label>
                        <div className="flex items-center gap-3">
                          <label className="flex-1 flex items-center justify-center p-2.5 border-2 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 cursor-pointer text-xs transition-colors">
                            <Upload size={14} className="mr-1.5" />
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                          {imagePreview && (
                            <div className="w-12 h-10 border rounded overflow-hidden">
                              <img src={imagePreview} alt="prev" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={updateSubmitting || updateSuccess}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-lg shadow cursor-pointer transition-all"
                      >
                        {updateSubmitting ? 'Transmitting logs...' : 'Commit Status Update'}
                      </button>

                    </form>

                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
