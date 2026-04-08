const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

export const fetchPrediction = async (inputArray) => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: inputArray }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Prediction failed (${response.status}).`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Advisor request failed.");
  }
  return data;
};
