import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth endpoints
export const authAPI = {
    login: (password: string) => api.post('/auth/login', { password }),
};

// Tasks endpoints
export const tasksAPI = {
    getTasks: (date?: string) => api.get('/tasks', { params: { date } }),
    createTask: (task: any) => api.post('/tasks', task),
    updateTask: (id: number, task: any) => api.put(`/tasks/${id}`, task),
    deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

// Analytics endpoints
export const analyticsAPI = {
    getDaily: (date?: string) => api.get('/analytics/daily', { params: { date } }),
    getWeekly: (startDate?: string) => api.get('/analytics/weekly', { params: { startDate } }),
    getMonthly: (month?: string) => api.get('/analytics/monthly', { params: { month } }),
    getStreak: () => api.get('/analytics/streak'),
    updateStreak: (data: { date: string; hours: number; taskCount: number }) =>
        api.post('/analytics/streak/update', data),
};

// Profile endpoints
export const profileAPI = {
    getProfile: () => api.get('/profile'),
    updateProfile: (profile: any) => api.put('/profile', profile),
};

// AI endpoints
export const aiAPI = {
    onboarding: (apiKey: string, userResponses: any) =>
        api.post('/ai/onboarding', { apiKey, userResponses }),
    dailySuggestion: (apiKey: string) =>
        api.post('/ai/daily-suggestion', { apiKey }),
    weeklyInsight: (apiKey: string) =>
        api.post('/ai/weekly-insight', { apiKey }),
    chat: (apiKey: string, message: string) =>
        api.post('/ai/chat', { apiKey, message }),
};

export default api;
