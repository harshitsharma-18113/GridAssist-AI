import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  User, 
  Phone, 
  MapPin, 
  UserCheck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BrainCircuit,
  Wrench
} from 'lucide-react';

export default function ComplaintsTab({ 
  onUpdateStats, 
  defaultStatusFilter = '', 
  defaultPriorityFilter = '', 
  resetDefaultFilters 
}) {
  const [view, setView] = useState('list'); // 'list', 'create', 'details'
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  
  // List States
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState(defaultPriorityFilter);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync default filters if clicked from dashboard stats cards
  useEffect(() => {
    if (defaultStatusFilter || defaultPriorityFilter) {
      setStatusFilter(defaultStatusFilter);
      setPriorityFilter(defaultPriorityFilter);
      setPage(1);
      if (resetDefaultFilters) {
        resetDefaultFilters();
      }
    }
  }, [defaultStatusFilter, defaultPriorityFilter]);

  // Form States
  const [formData, setFormData] = useState({
    consumerName: '',
    consumerNumber: '',
    mobileNumber: '',
    location: '',
    category: 'Power Outage',
    priority: 'Medium',
    title: '',
    description: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // AI Preview State
  const [aiPreview, setAiPreview] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Details States
  const [detailComplaint, setDetailComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [assignmentRemarks, setAssignmentRemarks] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [detailActionSubmitting, setDetailActionSubmitting] = useState(false);

  // Fetch Complaints
  const fetchComplaints = () => {
    setLoading(true);
    api.getComplaints({
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      page,
      limit: 8
    })
    .then(response => {
      setComplaints(response.data.complaints);
      setTotalPages(response.data.pagination.pages);
      setTotalCount(response.data.pagination.total);
      setLoading(false);
      
      if (onUpdateStats) {
        onUpdateStats();
      }
    })
    .catch(error => {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (view === 'list') {
      fetchComplaints();
    }
  }, [view, search, statusFilter, priorityFilter, page]);

  // Fetch Engineers (For Details view assignment)
  useEffect(() => {
    if (view === 'details') {
      api.getEngineers()
        .then(response => {
          setEngineers(response.data);
        })
        .catch(error => console.error("Error fetching engineers:", error));
    }
  }, [view]);

  // Fetch Complaint details
  useEffect(() => {
    if (view === 'details' && selectedComplaintId) {
      setDetailLoading(true);
      api.getComplaint(selectedComplaintId)
        .then(response => {
          setDetailComplaint(response.data);
          setStatusUpdate(response.data.status);
          setSelectedEngineerId(response.data.assigned_engineer?.id || '');
          setDetailLoading(false);
        })
        .catch(error => {
          console.error("Error fetching details:", error);
          setDetailLoading(false);
        });
    }
  }, [view, selectedComplaintId]);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Run AI Text Analysis Preview
  const handleAIAnalyze = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError("Title and Description are required to run AI diagnostics.");
      return;
    }
    setAiAnalyzing(true);
    setFormError('');

    api.analyzeComplaint({
      title: formData.title,
      description: formData.description
    })
    .then(response => {
      setAiPreview(response.data);
      // Auto-select predicted category & priority in form state
      setFormData(prev => ({
        ...prev,
        category: response.data.category,
        priority: response.data.priority
      }));
      setAiAnalyzing(false);
    })
    .catch(error => {
      console.error("AI Analysis failed:", error);
      setFormError("Failed to communicate with AI classifier service.");
      setAiAnalyzing(false);
    });
  };

  // Submit Complaint Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    const submissionData = new FormData();
    submissionData.append('consumer_name', formData.consumerName);
    submissionData.append('consumer_number', formData.consumerNumber);
    submissionData.append('mobile_number', formData.mobileNumber);
    submissionData.append('location', formData.location);
    submissionData.append('category', formData.category);
    submissionData.append('priority', formData.priority);
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    if (uploadFile) {
      submissionData.append('image', uploadFile);
    }

    api.createComplaint(submissionData)
    .then(response => {
      setSuccessMessage(`Complaint logged successfully! ID: ${response.data.complaint_id}. Technician routed automatically.`);
      setFormSubmitting(false);
      setAiPreview(null);
      
      // Reset form
      setFormData({
        consumerName: '',
        consumerNumber: '',
        mobileNumber: '',
        location: '',
        category: 'Power Outage',
        priority: 'Medium',
        title: '',
        description: ''
      });
      setUploadFile(null);
      setImagePreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setView('list');
        setPage(1);
      }, 2000);
    })
    .catch(error => {
      console.error("Error submitting form:", error);
      setFormError("Submission failed. Ensure all fields are filled correctly.");
      setFormSubmitting(false);
    });
  };

  // Update Status / Assignment on Details page
  const handleDetailsUpdate = (e) => {
    e.preventDefault();
    setDetailActionSubmitting(true);
    
    const patchPayload = {
      status: statusUpdate || undefined,
      engineer_id: selectedEngineerId ? parseInt(selectedEngineerId) : null,
      remarks: assignmentRemarks || undefined
    };

    api.updateComplaint(selectedComplaintId, patchPayload)
      .then(response => {
        api.getComplaint(selectedComplaintId)
          .then(res => {
            setDetailComplaint(res.data);
            setAssignmentRemarks('');
            setDetailActionSubmitting(false);
            if (onUpdateStats) onUpdateStats();
          });
      })
      .catch(error => {
        console.error("Error updating complaint:", error);
        setDetailActionSubmitting(false);
      });
  };

  // Status badge selector helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">Pending</span>;
      case 'Assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Assigned</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  // Priority badge selector helper
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-100">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">Medium</span>;
      case 'Low':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-650 border border-slate-100">Low</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-600">{priority}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. COMPLAINT LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header Controls */}
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search ID, Consumer, Area, Tech Name..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filters:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <button
                onClick={() => { setView('create'); setAiPreview(null); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Plus size={16} />
                File Complaint
              </button>
            </div>

          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading complaints from grid db...</div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No complaints found matching filters.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Complaint ID</th>
                    <th className="py-4 px-6">Consumer Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Assigned Tech</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 text-sm font-medium">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs font-semibold text-blue-600">
                        <div className="flex flex-col">
                          <span>{c.complaint_id}</span>
                          {c.severity_score && (
                            <span className="text-[9px] text-slate-400 font-bold mt-0.5">Severity: {c.severity_score}%</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">{c.consumer_name}</td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">{c.category}</td>
                      <td className="py-3.5 px-6">{renderPriorityBadge(c.priority)}</td>
                      <td className="py-3.5 px-6">{renderStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        {c.assigned_engineer ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>{c.assigned_engineer.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => { setSelectedComplaintId(c.id); setView('details'); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading && complaints.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing page <strong className="text-slate-700">{page}</strong> of <strong className="text-slate-700">{totalPages}</strong> ({totalCount} total entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. COMPLAINT FORM SUBMISSION */}
      {view === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto overflow-hidden">
          
          <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setView('list')}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">File Consumer Grid Complaint</h2>
              <p className="text-xs text-slate-500">Register consumer reports with AI Smart Diagnostics and Auto-routing dispatches</p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
            
            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                {successMessage}
              </div>
            )}

            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Consumer Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consumer Name</label>
                <input
                  type="text"
                  name="consumerName"
                  value={formData.consumerName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Consumer Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consumer Connection No.</label>
                <input
                  type="text"
                  name="consumerNumber"
                  value={formData.consumerNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. CON-87391"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Area/Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Area Address</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Block-B, Sector 62, Noida"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

            </div>

            {/* Complaint Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Sparking in Transformer box"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* Complaint Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Complaint Description</label>
                <button
                  type="button"
                  onClick={handleAIAnalyze}
                  disabled={aiAnalyzing || !formData.title || !formData.description}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded px-2.5 py-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <BrainCircuit size={14} className={aiAnalyzing ? 'animate-spin' : ''} />
                  {aiAnalyzing ? 'Analyzing Text...' : 'Analyze & Preview AI Diagnostics'}
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Provide detailed information regarding the electricity grid issue..."
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {/* AI Preview Diagnostics Results Card */}
            {aiPreview && (
              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 rounded-xl p-5 space-y-4 shadow-sm relative">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold text-sm">
                    <Sparkles size={16} className="text-blue-600 animate-pulse" />
                    <h4>AI Classifier Predictions (Preview)</h4>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Confidence: {aiPreview.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Predicted Category</span>
                    <span className="font-semibold text-slate-800">{aiPreview.category}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Predicted Priority</span>
                    <span className="font-semibold text-slate-800">{aiPreview.priority}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Severity Score</span>
                    <span className="font-mono font-bold text-red-600">{aiPreview.severity_score}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Est. Resolution Time</span>
                    <span className="font-semibold text-slate-800">{aiPreview.estimated_resolution_time}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-500 font-medium"><strong>Target Department:</strong> {aiPreview.department}</p>
                  <p className="text-slate-500 font-medium"><strong>Detected Keywords:</strong> {aiPreview.keywords.join(', ') || 'None'}</p>
                  <p className="text-slate-500 font-medium"><strong>Prediction Reason:</strong> {aiPreview.reason}</p>
                </div>
                
                <div className="p-2.5 bg-blue-600 text-white rounded text-xs font-semibold">
                  <span className="uppercase text-[9px] tracking-wider opacity-90 block font-bold mb-0.5">Auto-Route dispatch:</span>
                  {aiPreview.recommended_action}
                </div>
              </div>
            )}

            {/* Selectors - Pre-filled by AI preview but editable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Power Outage">Power Outage</option>
                  <option value="Transformer Fault">Transformer Fault</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Voltage Fluctuation">Voltage Fluctuation</option>
                  <option value="Meter Problem">Meter Problem</option>
                  <option value="Street Light Fault">Street Light Fault</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Evidence Image (Optional)</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:flex-1">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-lg p-5 cursor-pointer bg-slate-50 hover:bg-blue-50/20 transition-all">
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-xs font-semibold text-slate-600">Select Image File</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative w-36 h-28 border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition-colors shadow"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="border-t border-slate-150 pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting || successMessage}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer"
              >
                {formSubmitting ? 'Logging...' : 'Confirm & File Complaint'}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* 3. COMPLAINT DETAILS VIEW */}
      {view === 'details' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to History
            </button>
            <span className="text-sm font-semibold text-slate-400">/</span>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              {detailComplaint?.complaint_id}
            </span>
          </div>

          {detailLoading || !detailComplaint ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500 text-sm">
              Loading full complaint dossier...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Complaint & Consumer Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Main Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                  
                  {/* Title & Status */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                        {detailComplaint.category}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900 mt-1">{detailComplaint.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderPriorityBadge(detailComplaint.priority)}
                      {renderStatusBadge(detailComplaint.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Description</h3>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-200 rounded-lg whitespace-pre-wrap">
                      {detailComplaint.description}
                    </p>
                  </div>

                  {/* Evidence Image */}
                  {detailComplaint.image_url && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Evidence Image</h3>
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-w-lg bg-slate-50 p-2">
                        <img 
                          src={detailComplaint.image_url} 
                          alt="Evidence upload" 
                          className="w-full h-auto max-h-80 object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentNode.innerHTML = '<div className="p-6 text-xs text-slate-400 font-medium">Image failed to load.</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Consumer Dossier */}
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consumer Profile Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Name</p>
                          <p className="font-semibold text-slate-800">{detailComplaint.consumer_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Account No.</p>
                          <p className="font-mono font-semibold text-slate-800">{detailComplaint.consumer_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <Phone size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
                          <p className="font-semibold text-slate-800">{detailComplaint.mobile_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Grid Address Location</p>
                          <p className="font-semibold text-slate-800">{detailComplaint.location}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* AI Resolution Analysis Section (Populated dynamically) */}
                <div className="relative bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-200 rounded-xl p-6 shadow-sm overflow-hidden space-y-4">
                  <div className="absolute top-0 right-0 p-4 text-blue-600/10 pointer-events-none">
                    <Sparkles size={100} />
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                      <Sparkles size={18} className="text-blue-600" />
                      <h4>GridAssist AI Prediction Analytics</h4>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Confidence: {detailComplaint.prediction_confidence || 96}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white/80 border border-blue-100/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Predicted Category</span>
                      <span className="font-semibold text-slate-800">{detailComplaint.predicted_category || detailComplaint.category}</span>
                    </div>
                    <div className="p-3 bg-white/80 border border-blue-100/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Predicted Priority</span>
                      <span className="font-semibold text-slate-800">{detailComplaint.predicted_priority || detailComplaint.priority}</span>
                    </div>
                    <div className="p-3 bg-white/80 border border-blue-100/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Severity Score</span>
                      <span className="font-mono font-bold text-red-600">{detailComplaint.severity_score || 85}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommended Department</span>
                      <span className="font-semibold text-slate-800">{detailComplaint.rec_department || 'Electrical Maintenance Team'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Resolution Time</span>
                      <span className="font-semibold text-slate-800">{detailComplaint.est_resolution_time || '4 Hours'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-650">
                    <p><strong>Detected Keywords:</strong> {detailComplaint.detected_keywords || 'None detected'}</p>
                    <p><strong>Prediction Rationale:</strong> {detailComplaint.prediction_reason || 'Classification based on keyword matching and historical data patterns.'}</p>
                  </div>

                  <div className="p-3 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                    <span className="uppercase text-[9px] tracking-wider opacity-85 block mb-0.5 font-bold">Recommended Action:</span>
                    {detailComplaint.rec_action || 'Dispatch electrical technicians immediately.'}
                  </div>
                </div>

              </div>

              {/* Right Column: Timeline & Assignment Manager */}
              <div className="space-y-6">
                
                {/* Assignment & Status Manager */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Console Dispatch Actions
                  </h3>
                  
                  <form onSubmit={handleDetailsUpdate} className="space-y-4">
                    
                    {/* Status Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Ticket Status</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Field Engineer Dropdown */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Assign Field Technician</label>
                      <select
                        value={selectedEngineerId}
                        onChange={(e) => setSelectedEngineerId(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Select Engineer --</option>
                        {engineers.map(eng => (
                          <option key={eng.id} value={eng.id}>
                            {eng.name} - {eng.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remarks Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Dispatch Remarks / Log Notes</label>
                      <textarea
                        value={assignmentRemarks}
                        onChange={(e) => setAssignmentRemarks(e.target.value)}
                        placeholder="e.g. Dispatched technician to Noida Sector 12 station..."
                        rows={3}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={detailActionSubmitting}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      {detailActionSubmitting ? 'Updating Database...' : 'Commit Status Update'}
                    </button>

                  </form>

                  {/* Assigned Engineer details cards */}
                  {detailComplaint.assigned_engineer && (
                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                        <Wrench size={14} />
                        <span>Assigned Technician</span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-650">
                        <p><strong>Name:</strong> {detailComplaint.assigned_engineer.name}</p>
                        <p><strong>Department:</strong> {detailComplaint.assigned_engineer.department}</p>
                        <p><strong>Contact:</strong> +91 {detailComplaint.assigned_engineer.mobile}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Timeline (5 stages) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Complaint Life-Cycle Logs
                  </h3>

                  <div className="flow-root">
                    <ul className="-mb-8">
                      {detailComplaint.timeline.map((step, idx) => {
                        const isLast = idx === detailComplaint.timeline.length - 1;
                        return (
                          <li key={idx}>
                            <div className="relative pb-8">
                              {!isLast && (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                                    ${step.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' :
                                      step.status === 'Assigned' ? 'bg-blue-100 text-blue-600' :
                                      step.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                                      'bg-slate-100 text-slate-500'}
                                  `}>
                                    {step.status === 'Resolved' ? <CheckCircle size={16} /> :
                                     step.status === 'Assigned' ? <UserCheck size={16} /> :
                                     step.status === 'In Progress' ? <Clock size={16} /> :
                                     <BrainCircuit size={16} />}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5">
                                  <p className="text-xs font-bold text-slate-800">{step.title}</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                                  {step.timestamp && (
                                    <span className="text-[9px] font-mono text-slate-400 block mt-1">
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
          )}

        </div>
      )}

    </div>
  );
}
