import axios from 'axios';

const API_BASE_URL = 'http://172.60.46.90:8000';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// AUTH
export const loginUser    = (email, password)       => api.post('/auth/login',    { email, password });
export const registerUser = (name, email, password) => api.post('/auth/register', { name, email, password });

// CONTRACT
export const getContracts = () => api.get('/contract/list');
export const askQuestion  = (question, contractId) => api.post('/contract/query', { question, contract_id: contractId });

// ✅ FIXED: Alag axios instance — default headers se azaad
export const uploadContract = async (fileUri, fileName, fileType) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: fileType || 'application/pdf',
  });

  return axios.post(`${BASE_URL}/contract/upload`, formData, {
    timeout: 60000, // ← PDF badi ho sakti hai, timeout zyada rakho
    headers: {
      'Content-Type': 'multipart/form-data',
      // Authorization: `Bearer ${await getToken()}`, // ← baad mein auth lagani ho toh
    },
  });
};

export default api;
