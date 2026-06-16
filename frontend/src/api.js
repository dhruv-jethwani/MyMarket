import axios from 'axios';

const API = axios.create({
  // If VITE_API_URL exists (Production), use it as the base URL.
  // If it doesn't exist (Local Development), leave it blank so Vite's proxy takes over.
  baseURL: import.meta.env.VITE_API_URL || '',
});

export default API;