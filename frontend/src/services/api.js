import axios from 'axios';

const API_BASE = 'https://gridassist-ai.onrender.com';

export const api = {
  // Stats & Analytics
  getStats: () => axios.get(`${API_BASE}/dashboard`),
  getAnalytics: () => axios.get(`${API_BASE}/analytics`),
  getEngineers: () => axios.get(`${API_BASE}/engineers`),
  
  // Complaints List & Details
  getComplaints: (params) => axios.get(`${API_BASE}/complaints`, { params }),
  getComplaint: (id) => axios.get(`${API_BASE}/complaints/${id}`),
  createComplaint: (formData) => axios.post(`${API_BASE}/complaints`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  analyzeComplaint: (payload) => axios.post(`${API_BASE}/complaints/analyze`, payload),
  updateComplaint: (id, payload) => axios.patch(`${API_BASE}/complaints/${id}`, payload),
  
  // Settings & About
  getSettings: () => axios.get(`${API_BASE}/settings`),
  getAbout: () => axios.get(`${API_BASE}/about`),
  
  // AI query
  queryAI: (payload) => axios.post(`${API_BASE}/ai/query`, payload),

  // Admin Portal
  adminLogin: (payload) => axios.post(`${API_BASE}/admin/login`, payload),

  // Consumer Portal
  consumerRegister: (payload) => axios.post(`${API_BASE}/consumer/register`, payload),
  consumerLogin: (payload) => axios.post(`${API_BASE}/consumer/login`, payload),
  trackComplaint: (query) => axios.get(`${API_BASE}/complaints/track`, { params: { query } }),

  // Engineer Portal
  engineerLogin: (payload) => axios.post(`${API_BASE}/engineer/login`, payload),
  getEngineerTasks: (engineerId) => axios.get(`${API_BASE}/engineers/${engineerId}/tasks`),
  updateEngineerProgress: (formData) => axios.post(`${API_BASE}/engineer/update`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Notifications
  getNotifications: () => axios.get(`${API_BASE}/notifications`),
  markNotificationRead: (id) => axios.post(`${API_BASE}/notifications/${id}/read`)
};
