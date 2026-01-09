import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import LoginPage from "./LoginPage";

const API_URL = "http://localhost:3000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ description: "", image: null, lat: "12.9716", lng: "77.5946" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [token]);

  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setComplaints([]);
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const jsonData = await res.json();
      setComplaints(jsonData.data || []);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Please upload an image!");

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result; // DataURL including prefix

        const res = await fetch(`${API_URL}/complaints`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            description: form.description,
            imageBase64: base64, // Pass full data URL
            location: {
              latitude: parseFloat(form.lat),
              longitude: parseFloat(form.lng)
            }
          })
        });

        if (!res.ok) throw new Error("Submission failed");

        const data = await res.json();
        alert(`Complaint submitted! Category: ${data.data.category}`);
        setForm({ description: "", image: null, lat: form.lat, lng: form.lng });
        fetchComplaints(); // Refresh map
      } catch (err) {
        console.error("Error adding complaint:", err);
        alert("Failed to submit complaint.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(form.image);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="container">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo">CityFix <span>AI</span></div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} style={{ padding: '0.4em 0.8em', fontSize: '0.8em' }}>Logout</button>
          </div>
        </div>

        <div className="card">
          <h2>Submit New Complaint</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Describe the issue (e.g., heavily potholed road)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
            />

            <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
              {form.image ? (
                <div style={{ color: "var(--primary-color)" }}>{form.image.name} selected</div>
              ) : (
                <>
                  Click to upload Photo/Video evidence
                  <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '0.5rem' }}>AI will auto-detect category</div>
                </>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input
                placeholder="Latitude"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                required
              />
              <input
                placeholder="Longitude"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Submitting..." : "Report Issue"}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: "2rem" }}>
          <h3>System Stats</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div style={{ padding: "1rem", background: "#21262d", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{complaints.length}</div>
              <div style={{ fontSize: "0.8em", opacity: 0.7 }}>Active Reports</div>
            </div>
            <div style={{ padding: "1rem", background: "#21262d", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2ea043" }}>
                {complaints.filter(c => c.status === 'Resolved').length}
              </div>
              <div style={{ fontSize: "0.8em", opacity: 0.7 }}>Resolved</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3>Live Complaint Map</h3>
            <div style={{ fontSize: '0.8em', opacity: 0.7 }}>Real-time updates enabled</div>
          </div>

          <div className="map-container" style={{ flexGrow: 1, minHeight: "500px" }}>
            <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {complaints.map((c) => (
                <Marker
                  key={c.id}
                  position={[c.latitude, c.longitude]}
                >
                  <Popup>
                    <div style={{ color: "black" }}>
                      <span className={`status-badge status-${c.status}`}>{c.status}</span>
                      <div style={{ fontWeight: "bold", marginTop: "5px" }}>{c.category}</div>
                      <div>{c.description}</div>
                      {c.image_base64 && (
                        <div style={{ marginTop: "5px" }}>
                          <img
                            src={c.image_base64}
                            style={{ width: "100px", borderRadius: "4px" }}
                            alt="Evidence"
                          />
                        </div>
                      )}
                      <div style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
                        Dept: {c.department}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
