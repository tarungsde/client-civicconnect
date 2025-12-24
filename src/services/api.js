import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
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
  getCurentUser : () => API.get('/auth/me'),
  logout: () => API.post('auth/logout')
};

export const reportAPI = {
  createReport: (reportData) => API.post('/reports', reportData),
  getMyReports: () => API.get('/reports/my-reports'),
  getAllReports: (params) => API.get('/reports', { params }),
  updateReportStatus: (id, status) => API.patch(`/reports/${id}/status`, { status })
};

export default API;