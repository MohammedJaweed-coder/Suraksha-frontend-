import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kaval-token') 
                ?? 'mock-jwt-kaval-2026'
  config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kaval-token')
      window.location.href = '/login'
    }
    if (!error.response) {
      console.warn('Network error — saving to offline queue')
    }
    return Promise.reject(error)
  }
)

export default api
