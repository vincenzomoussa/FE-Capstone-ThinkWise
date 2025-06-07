import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModaleCorso from "./ModaleCorso";
import Thinnerlay from "./Thinnerlay";

const DettagliCorso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [corso, setCorso] = useState(null);
  const [studentiDisponibili, setStudentiDisponibili] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModale, setShowModale] = useState(false);

  useEffect(() => {
    fetchCorso();
    fetchStudentiDisponibili();
  }, []);

  const fetchCorso = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/corsi/${id}`);
      setCorso(response.data || {});
    } catch (error) {
      console.error("❌ Errore nel recupero del corso:", error);
      setError("Errore nel caricamento del corso.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentiDisponibili = async () => {
    try {
      const response = await apiClient.get("/studenti/senza-corso");
      console.log("Studenti disponibili ricevuti dal backend:", response.data);
      const parsedData = JSON.parse(response.data);
      setStudentiDisponibili(parsedData || []);
    } catch (error) {
      console.error("❌ Errore nel recupero degli studenti disponibili:", error);
    }
  };

  const assegnaStudente = async (studenteId) => {
    try {
      await apiClient.post(`/corsi/${id}/aggiungi-studente`, { studenteId });
      setSuccessMessage("✅ Studente assegnato con successo!");
      fetchCorso();
      fetchStudentiDisponibili();
    } catch (error) {
      console.error("❌ Errore nell'assegnazione dello studente:", error);
      setError("Errore durante l'assegnazione dello studente.");
    }
  };

  const toggleStatoCorso = async () => {
    const conferma = corso?.attivo ? "Vuoi disattivare questo corso?" : "Vuoi riattivare questo corso?";

    if (window.confirm(conferma)) {
      try {
        if (corso?.attivo) {
          await apiClient.put(`/corsi/${id}/interrompi`);
        } else {
          await apiClient.put(`/corsi/${id}/riattiva`);
        }
        fetchCorso();
      } catch (error) {
        console.error("❌ Errore nel cambio di stato del corso:", error);
        setError("Errore durante il cambio di stato del corso.");
      }
    }
  };

  const eliminaCorso = async () => {
    if (window.confirm("Vuoi eliminare definitivamente questo corso?")) {
      try {
        await apiClient.delete(`/corsi/${id}`);
        navigate("/corsi");
      } catch (error) {
        console.error("❌ Errore nell'eliminazione del corso:", error);
        setError("Errore durante l'eliminazione del corso.");
      }
    }
  };

  if (loading) return <Thinnerlay />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5 mb-5 d-flex flex-column align-items-center justify-content-center">
        <div className="mb-4 w-100" style={{ maxWidth: 540 }}>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/corsi")}
            style={{
              borderRadius: 12,
              fontWeight: 600,
              fontSize: "1.08em",
              letterSpacing: 0.2,
              padding: "10px 28px",
              background: "#ede9fe",
              color: "#4f46e5",
              border: "none",
              boxShadow: "0 2px 8px #6366f122",
              transition: "background 0.18s, color 0.18s",
            }}
          >
            🔙 Torna alla Lista Corsi
          </button>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          <div
            className="card p-4 shadow border-0"
            style={{
              borderRadius: 16,
              border: "2px solid #6366f1",
              boxShadow: "0 4px 24px #6366f122",
              background: "#fff",
              minWidth: 340,
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0 fw-bold" style={{ color: "#3730a3", letterSpacing: 0.2 }}>
                {corso?.nome} - {corso?.tipoCorso} - Livello <span className="fw-bold">{corso?.livello || "N/A"}</span>
              </h4>
              <span
                className={`badge ${corso?.attivo ? "bg-success" : "bg-secondary"}`}
                style={{ fontSize: "1em", padding: "0.5em 1.2em", borderRadius: 8 }}
              >
                {corso?.attivo ? "Attivo" : "Disattivato"}
              </span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">🗓 Giorno:</span> <span>{corso?.giorno || "N/A"}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">⏰ Orario:</span> <span>{corso?.orario || "N/A"}</span>
            </div>
            {corso?.secondoGiorno && (
              <div className="mb-2">
                <span className="fw-bold">🗓 Secondo Giorno:</span> <span>{corso.secondoGiorno}</span>
              </div>
            )}
            {corso?.secondoOrario && (
              <div className="mb-2">
                <span className="fw-bold">⏰ Secondo Orario:</span> <span>{corso.secondoOrario}</span>
              </div>
            )}
            <div className="mb-2">
              <span className="fw-bold">🏫 Aula:</span> <span>{corso?.aula?.nome || "Non assegnata"}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">👨‍🏫 Insegnante:</span>{" "}
              <span>
                {corso?.insegnante?.nome} {corso?.insegnante?.cognome}
              </span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">🎓 Studenti Iscritti:</span>{" "}
              <span>{Array.isArray(corso?.studenti) ? corso.studenti.length : 0}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                className={`btn ${corso?.attivo ? "btn-warning" : "btn-success"}`}
                onClick={toggleStatoCorso}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                }}
              >
                {corso?.attivo ? "🚫 Disattiva Corso" : "✅ Riattiva Corso"}
              </button>
              <button
                className="btn btn-danger"
                onClick={eliminaCorso}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                }}
              >
                🗑 Elimina Corso
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowModale(true)}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                  background: "#6366f1",
                }}
              >
                ✏️ Modifica
              </button>
            </div>
          </div>
        </div>
        <ModaleCorso show={showModale} onHide={() => setShowModale(false)} corso={corso} refresh={fetchCorso} />
      </div>
      <style>{`
        .card {
          box-shadow: 0 4px 24px #6366f122 !important;
        }
      `}</style>
    </>
  );
};

export default DettagliCorso;
