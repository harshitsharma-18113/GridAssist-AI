import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  FileText, 
  BarChart3, 
  Bot, 
  Settings, 
  Info, 
  Bell, 
  User,
  LogOut,
  AlertTriangle,
  Clock,
  CheckCircle,
  FolderClosed,
  Menu,
  X,
  HeartPulse,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import CompanyBrand from '../components/CompanyBrand';
import Footer from '../components/Footer';
import ComplaintsTab from './ComplaintsTab';
import AnalyticsTab from './AnalyticsTab';
import AIAssistantTab from './AIAssistantTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    total_complaints: 0,
    pending_complaints: 0,
    resolved_complaints: 0,
    critical_complaints: 0
  });
  const [loading, setLoading] = useState(true);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  // Dashboard widgets states
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'Connected',
    model: 'Trained',
    latency: '12ms'
  });

  // States to pass clickable card selections to Complaints tab
  const [defaultStatusFilter, setDefaultStatusFilter] = useState('');
  const [defaultPriorityFilter, setDefaultPriorityFilter] = useState('');

  // Fetch all dashboard stats
  const fetchStats = () => {
    setLoading(true);
    api.getStats()
      .then(response => {
        if (response.data) {
          setStats(response.data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.warn("Error fetching stats:", error);
        setLoading(false);
      });
  };

  // Fetch notifications
  const fetchNotifications = () => {
    api.getNotifications()
      .then(response => {
        setNotifications(response.data);
      })
      .catch(err => console.error("Error loading notifications:", err));
  };

  // Fetch recent complaints
  const fetchRecentComplaints = () => {
    api.getComplaints({ limit: 5 })
      .then(response => {
        setRecentComplaints(response.data.complaints);
      })
      .catch(err => console.error("Error loading recent complaints:", err));
  };

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchRecentComplaints();
    
    // Poll updates every 10 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
      fetchRecentComplaints();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id) => {
    api.markNotificationRead(id)
      .then(() => {
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    navigate('/landing');
  };

  const navigationItems = [
    { name: 'Dashboard', icon: LayoutGrid },
    { name: 'Complaints', icon: FileText },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'AI Assistant', icon: Bot },
    { name: 'Settings', icon: Settings },
    { name: 'About', icon: Info },
  ];

  const unreadNotifs = notifications.filter(n => !n.is_read);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <CompanyBrand variant="horizontal" />
        </div>

        <div className="flex items-center gap-4 relative">
          
          {/* Live Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 relative transition-colors cursor-pointer"
            >
              <Bell size={20} />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden text-xs">
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-slate-800 flex justify-between items-center">
                  <span>System Activity Alerts ({unreadNotifs.length})</span>
                  <button 
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-400 hover:text-slate-650"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">No alerts registered.</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`p-3 space-y-1 hover:bg-slate-50 transition-colors cursor-pointer
                          ${!n.is_read ? 'bg-blue-50/40 font-semibold' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                            ${n.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                              n.type === 'warning' ? 'bg-amber-105 text-amber-800' :
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-normal">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
              <User size={16} />
            </div>
            <div className="hidden md:flex flex-col items-start select-none">
              <span className="text-xs font-semibold text-slate-800">Utility Administrator</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sai Computers Intern</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-16 bottom-0 left-0 z-20 
          w-64 border-r border-slate-200 bg-white 
          flex flex-col justify-between transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${!isSidebarOpen && 'md:w-20'}
        `}>
          <div className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setDefaultStatusFilter('');
                    setDefaultPriorityFilter('');
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span className={`${!isSidebarOpen && 'md:hidden'}`}>{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
              <span className={`${!isSidebarOpen && 'md:hidden'}`}>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <div className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeTab}
                </h1>
                <p className="text-sm text-slate-500">
                  {activeTab === 'Dashboard' 
                    ? 'Utility complaint management and status summary' 
                    : `Manage your grid ${activeTab.toLowerCase()} tasks`}
                </p>
              </div>
              <div className="text-xs bg-blue-50 text-blue-700 font-medium px-3 py-1.5 rounded-full border border-blue-100 self-start md:self-auto select-none">
                Internship Prototype Mode
              </div>
            </div>

            {/* Dashboard tab layout */}
            {activeTab === 'Dashboard' ? (
              <div className="space-y-6">
                
                {/* 4 Clickable Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div 
                    onClick={() => {
                      setDefaultStatusFilter('');
                      setDefaultPriorityFilter('');
                      setActiveTab('Complaints');
                    }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">Total Complaints</p>
                      <h3 className="text-3xl font-extrabold text-slate-900">
                        {loading ? '...' : stats.total_complaints.toLocaleString()}
                      </h3>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={22} />
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaultStatusFilter('Pending');
                      setDefaultPriorityFilter('');
                      setActiveTab('Complaints');
                    }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-650 transition-colors">Pending</p>
                      <h3 className="text-3xl font-extrabold text-slate-900">
                        {loading ? '...' : stats.pending_complaints.toLocaleString()}
                      </h3>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                      <Clock size={22} />
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaultStatusFilter('Resolved');
                      setDefaultPriorityFilter('');
                      setActiveTab('Complaints');
                    }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">Resolved</p>
                      <h3 className="text-3xl font-extrabold text-slate-900">
                        {loading ? '...' : stats.resolved_complaints.toLocaleString()}
                      </h3>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <CheckCircle size={22} />
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setDefaultStatusFilter('');
                      setDefaultPriorityFilter('Critical');
                      setActiveTab('Complaints');
                    }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 transition-all group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-red-500 transition-colors">Critical</p>
                      <h3 className="text-3xl font-extrabold text-red-650 animate-pulse">
                        {loading ? '...' : stats.critical_complaints.toLocaleString()}
                      </h3>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <AlertTriangle size={22} />
                    </div>
                  </div>
                </div>

                {/* Dashboard grid panel additions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left block (Complaints & Activities) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Latest Complaints */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-700 uppercase tracking-wider">
                        Latest Registered Logs
                      </div>
                      
                      {recentComplaints.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-450">No complaints registered.</div>
                      ) : (
                        <div className="overflow-x-auto text-xs">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="p-3 pl-4">ID</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Area</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {recentComplaints.slice(0, 5).map((rc) => (
                                <tr key={rc.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 pl-4 font-mono font-bold text-blue-600">{rc.complaint_id}</td>
                                  <td className="p-3 font-semibold text-slate-800">{rc.title}</td>
                                  <td className="p-3 text-slate-500">{rc.location}</td>
                                  <td className="p-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border
                                      ${rc.priority === 'Critical' ? 'bg-red-50 text-red-800 border-red-200' :
                                        rc.priority === 'High' ? 'bg-orange-55 text-orange-800 border-orange-200' :
                                        'bg-slate-50 text-slate-650 border-slate-100'}
                                    `}>
                                      {rc.priority}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border
                                      ${rc.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                                        'bg-slate-55 text-slate-700 border-slate-200'}
                                    `}>
                                      {rc.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Recent activity logs */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <Activity size={15} className="text-blue-600" />
                        Grid Dispatch Log Streams
                      </h4>
                      <div className="space-y-3.5 text-xs">
                        {notifications.slice(0, 4).map((n) => (
                          <div key={n.id} className="flex gap-2.5 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-slate-650 font-medium">{n.message}</p>
                              <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                                {new Date(n.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Right block widgets (System Health & Alerts) */}
                  <div className="space-y-6">
                    
                    {/* System Health Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                        <HeartPulse size={15} className="text-emerald-500" />
                        System Health Status
                      </h4>
                      
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="text-slate-500 font-semibold">Active Database</span>
                          <span className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {systemHealth.database}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="text-slate-500 font-semibold">AI Models (Pipeline)</span>
                          <span className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {systemHealth.model}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                          <span className="text-slate-500 font-semibold">API Latency (Ping)</span>
                          <span className="font-mono font-bold text-slate-700">{systemHealth.latency}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Alerts Widget */}
                    <div className="bg-gradient-to-br from-amber-50/70 to-red-50/30 border border-amber-250 rounded-xl p-5 shadow-sm space-y-4">
                      <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wider border-b border-amber-200 pb-2 flex items-center gap-1.5">
                        <ShieldAlert size={15} className="text-amber-600" />
                        AI Flagged Urgency Warnings
                      </h4>

                      <div className="space-y-3.5 text-xs text-slate-650">
                        {stats.critical_complaints > 0 ? (
                          <div className="p-3 bg-white/80 border border-amber-100 rounded-lg space-y-2">
                            <p className="font-semibold text-slate-800">Blowout dispatches flagged:</p>
                            <p className="text-[11px]">The TF-IDF Model detected safety hazards on {stats.critical_complaints} reports. dispatches routed immediately.</p>
                          </div>
                        ) : (
                          <p className="text-slate-550 italic font-semibold">No critical safety warning overrides logged today.</p>
                        )}
                        <div className="p-2.5 bg-blue-600 text-white rounded text-[11px] font-semibold text-center select-none">
                          All technician dispatches active.
                        </div>
                      </div>
                    </div>

                    {/* Engineer Allocation Widget */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b pb-2">
                        Technician Allocations
                      </h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Rajesh Kumar</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[9px]">Distribution Grid</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Amit Singh</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[9px]">Metering & Smart</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Priya Sharma</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[9px]">Billing & Comm.</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">Vikram Rathore</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 font-bold text-[9px]">Transmission Lines</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Information Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider border-b pb-2">
                        Project Meta Details
                      </h4>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>App Status:</span>
                          <span className="font-semibold text-emerald-600">Active (Prototype)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sprint Progress:</span>
                          <span className="font-semibold text-blue-600">Sprint 6 (100% Complete)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Database Tables:</span>
                          <span className="font-mono">8 tables active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seeded Complaints:</span>
                          <span className="font-mono">300 loaded</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TF-IDF Classifier:</span>
                          <span className="font-semibold text-blue-600">Trained on Startup</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Backend:</span>
                          <span className="font-mono">FastAPI (Uvicorn)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Build Version:</span>
                          <span className="font-mono font-bold">v1.0.6</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : activeTab === 'Complaints' ? (
              <ComplaintsTab 
                onUpdateStats={fetchStats} 
                defaultStatusFilter={defaultStatusFilter}
                defaultPriorityFilter={defaultPriorityFilter}
                resetDefaultFilters={() => {
                  setDefaultStatusFilter('');
                  setDefaultPriorityFilter('');
                }}
              />
            ) : activeTab === 'Analytics' ? (
              <AnalyticsTab />
            ) : activeTab === 'AI Assistant' ? (
              <AIAssistantTab />
            ) : activeTab === 'Settings' ? (
              <SettingsTab />
            ) : activeTab === 'About' ? (
              <AboutTab />
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4 my-8">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                  <FolderClosed size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{activeTab} Module</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The {activeTab} functionality is scheduled for subsequent sprints. This component forms the scaffolding structure and is reserved for future implementation.
                </p>
                <button 
                  onClick={() => setActiveTab('Dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>

          {/* Page Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
