import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

function App() {
  const [formData, setFormData] = useState({
    age: "",
    job: "",
    housing: "",
    saving: "",
    checking: "",
    credit: "",
    duration: "",
    purpose: "",
    sex: "",
    other: ""
  });

  const [result, setResult] = useState(null);

  // Model comparison data
  const modelData = [
    { name: "Logistic Regression", Accuracy: 1.0, ROCAUC: 1.0 },
    { name: "Random Forest", Accuracy: 1.0, ROCAUC: 1.0 },
    { name: "XGBoost", Accuracy: 1.0, ROCAUC: 1.0 },
    { name: "Gradient Boosting", Accuracy: 1.0, ROCAUC: 1.0 }
  ];

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async () => {
    const inputArray = [
      Number(formData.age),
      Number(formData.job),
      Number(formData.housing),
      Number(formData.saving),
      Number(formData.checking),
      Number(formData.credit),
      Number(formData.duration),
      Number(formData.purpose),
      Number(formData.sex),
      Number(formData.other)
    ];

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: inputArray })
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error(error);
      alert("❌ Backend not running!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>💳 CredLens Credit Risk Predictor</h1>

      {/* INPUT FORM */}
      {Object.keys(formData).map((key) => (
        <div key={key} style={{ margin: "10px" }}>
          <input
            type="number"
            name={key}
            placeholder={key}
            value={formData[key]}
            onChange={handleChange}
          />
        </div>
      ))}

      <button onClick={handleSubmit}>Predict</button>

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h2>Result:</h2>
          <p>Prediction: {result.prediction}</p>
          <p>Probability: {result.probability}</p>

          {result.prediction === 1 ? (
            <h3 style={{ color: "red" }}>⚠️ High Risk</h3>
          ) : (
            <h3 style={{ color: "green" }}>✅ Low Risk</h3>
          )}
        </div>
      )}

      {/* MODEL COMPARISON CHART */}
      <div style={{ marginTop: "40px" }}>
        <h2>Model Performance Comparison</h2>
        <BarChart width={600} height={300} data={modelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Accuracy" fill="#8884d8" />
          <Bar dataKey="ROCAUC" fill="#82ca9d" />
        </BarChart>
      </div>
    </div>
  );
}

export default App;