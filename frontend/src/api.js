const API_BASE_URL = import.meta.env.PROD 
  ? 'https://student-grievance-backend.onrender.com' 
  : 'http://localhost:5000';

export const API_URL = `${API_BASE_URL}/api`;
