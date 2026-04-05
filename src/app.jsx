import React, { useEffect, useState } from "react";

function App() {
  const [images, setImages] = useState([]);
  const [summary, setSummary] = useState("Loading EDA results...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/eda-results")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data from backend");
        }
        return res.json();
      })
      .then((data) => {
        setImages(data.images || []);
        setSummary(data.summary || "EDA Completed");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("❌ Backend not running or API error");
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 CredLens EDA Dashboard</h1>

      {loading && <p style={styles.loading}>⏳ Loading...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <h3 style={styles.summary}>{summary}</h3>

          <div style={styles.grid}>
            {images.length > 0 ? (
              images.map((img, index) => (
                <div key={index} style={styles.card}>
                  <img
                    src={`http://127.0.0.1:5000/images/${img}`}
                    alt={img}
                    style={styles.image}
                  />
                  <p style={styles.caption}>{img}</p>
                </div>
              ))
            ) : (
              <p>No images found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px",
  },
  summary: {
    color: "#27ae60",
    marginBottom: "20px",
  },
  loading: {
    fontSize: "18px",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    padding: "15px",
    margin: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    width: "420px",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
  },
  caption: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
  },
};

export default App;