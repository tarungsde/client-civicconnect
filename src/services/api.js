import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://server-civicconnect.onrender.com/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) 
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  googleLogin: (token) => API.post('/auth/google', { token }),
  getCurrentUser : () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout')
};

export const reportAPI = {
  createReport: (reportData) => API.post('/reports', reportData),
  uploadImages: (formData) => API.post('/reports/upload', formData, {
    headers : {
      "Content-Type": 'multipart/form-data'
    }
  }),
  getMyReports: () => API.get('/reports/my-reports'),
  getAllReports: (params) => API.get('/reports', { params }),
  updateReport: (id, reportData) => API.put(`/reports/${id}`, reportData),
  updateReportStatus: (id, status) => API.patch(`/reports/${id}/status`, { status }),
  upvoteReport: (id) => API.post(`/reports/${id}/upvote`),
  checkUpvote: (id) => API.get(`/reports/${id}/upvote/check`),
};

export const adminAPI = {
  getReports: (params) => API.get('/admin/reports', { params }),
  updateStatus: (id, data) => API.patch(`/admin/reports/${id}/status`, data),
  getStats: () => API.get('/admin/stats')
};

export default API;