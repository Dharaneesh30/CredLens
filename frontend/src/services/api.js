const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
const API_KEY = process.env.REACT_APP_API_KEY || "";

const buildHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }
  return headers;
};

export const analyzeDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  const response = await fetch(`${API_BASE_URL}/analyze-dataset`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Dataset analysis failed.");
  }
  return data;
};

export const fetchCharts = async () => {
  const response = await fetch(`${API_BASE_URL}/charts`);
  const data = await response.json();
  return data.images || [];
};

export const fetchAdvisorSuggestion = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/loan-advisor`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.detail || "Advisor request failed.");
  }
  return data;
};

export const fetchBackendHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};

export const fetchModelHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health/model`);
  return response.json();
};

export const fetchOllamaHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health/ollama`);
  return response.json();
};

export const fetchAdvisorHistory = async (limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/loan-advisor/history?limit=${limit}`);
  return response.json();
};
