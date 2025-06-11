import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";
import ModaleInsegnante from "./ModaleInsegnante";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formatDateDMY } from "../utils/dateUtils";

const DettagliInsegnante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [insegnante, setInsegnante] = useState(null);
  const [tempInsegnante, setTempInsegnante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [corsiAssegnati, setCorsiAssegnati] = useState([]);
  const [tuttiCorsi, setTuttiCorsi] = useState([]);

  const formatSpecializzazione = (tipo) => {
    const mapping = {
      Frontend: "Frontend",
      Backend: "Backend",
      UX_UI_Design: "UX/UI Design",
      Cybersecurity: "Cybersecurity",
      Cloud_Computing: "Cloud Computing",
      Data_Science: "Data Science",
    };
    return mapping[tipo] || tipo;
  };

  const giorniOrdine = [
    "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"
  ];
  const orariOrdine = [
    "08:00-10:00",
    "10:00-12:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchInsegnante(), fetchTuttiCorsi()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchInsegnante = async () => {
    try {
      const response = await apiClient.get(`/insegnanti/${id}`);
      setInsegnante(response.data);
    } catch (error) {
      setError(error?.response?.data?.message || error?.message || "Errore nel caricamento dell'insegnante.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTuttiCorsi = async () => {
    try {
      const response = await apiClient.get(`/corsi/all/insegnante/${id}`);
      setTuttiCorsi(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // errore silenzioso
    }
  };

  const handleEdit = () => {
    setTempInsegnante({ ...insegnante });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempInsegnante(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/insegnanti/${id}`, tempInsegnante);
      toast.success("Modifiche salvate con successo!");
      setInsegnante(tempInsegnante);
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Errore nella modifica dell'insegnante");
    }
  };

  // Badge color helpers
  const badgeColor = (type) => {
    if (type === "specializzazione") return { bg: "#6366f1", color: "#fff" };
    if (type === "corso") return { bg: "#facc15", color: "#1e293b" };
    return { bg: "#e0e7ff", color: "#222" };
  };

  if (loading) return <Thinner message="Caricamento insegnante..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!insegnante) return <p>⚠️ Nessun insegnante trovato.</p>;

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="d-flex justify-content-start align-items-center mb-4">
          <button
            className="btn btn-lg px-4 py-2"
            style={{
              background: "#ede9fe",
              color: "#4f46e5",
              border: "none",
              borderRadius: 12,
              fontWeight: 600,
              letterSpacing: 0.2,
              boxShadow: "0 2px 8px #6366f122",
              transition: "background 0.18s, color 0.18s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#6366f1";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#ede9fe";
              e.currentTarget.style.color = "#4f46e5";
            }}
            onClick={() => navigate("/insegnanti")}
          >
            <span style={{ fontSize: "1.2em", marginRight: 8 }}>←</span> Torna alla Lista Insegnanti
          </button>
        </div>
        <div className="d-flex flex-column flex-md-row justify-content-center align-items-stretch gap-4 mt-5">
          {/* Card Dettagli Insegnante */}
          <motion.div
            className="p-4 mb-4 d-flex flex-column align-items-start"
            whileHover={{ scale: 1.02, boxShadow: "0 4px 24px #6366f122" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              background: "#fff",
              border: "1.5px solid #6366f1",
              borderRadius: 16,
              boxShadow: "0 2px 8px #6366f133",
              minWidth: 340,
              maxWidth: 400,
              width: "100%",
              flex: 1,
              marginBottom: 0,
              minHeight: 520,
              height: 520,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="fs-4 fw-bold mb-2">
              {insegnante.nome} {insegnante.cognome}
            </div>
            <div className="mb-1">
              <span className="fw-bold">Email:</span> <span className="fw-semibold">{insegnante.email}</span>
            </div>
            <div className="mb-1">
              <span className="fw-bold">Età:</span> <span className="fw-semibold">{insegnante.eta}</span>
            </div>
            <div className="mb-3">
              <span className="fw-bold">Data Assunzione:</span>{" "}
              <span className="fw-semibold">{formatDateDMY(insegnante.dataAssunzione)}</span>
            </div>
            <div className="mb-3">
              <span className="fw-bold">Specializzazioni:</span>{" "}
              {(insegnante.specializzazioni || []).length > 0 ? (
                <span className="ms-1">
                  {insegnante.specializzazioni.map((spec, idx) => (
                    <span
                      key={idx}
                      className="badge me-1"
                      style={{
                        background: badgeColor("specializzazione").bg,
                        color: badgeColor("specializzazione").color,
                        fontWeight: 600,
                        fontSize: "0.95em",
                        padding: "0.22em 0.7em",
                        borderRadius: 8,
                      }}
                    >
                      {formatSpecializzazione(spec)}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="ms-2 text-muted">Nessuna</span>
              )}
            </div>
            <div className="mb-3 mt-3">
              <span className="fw-bold">Giorni Disponibili:</span>{" "}
              {(insegnante.giorniDisponibili || []).length > 0 ? (
                <span className="ms-2">
                  {[...(insegnante.giorniDisponibili || [])]
                    .sort((a, b) => giorniOrdine.indexOf(a) - giorniOrdine.indexOf(b))
                    .map((g, idx) => (
                      <span
                        key={idx}
                        className="badge me-1"
                        style={{
                          background: "#facc15",
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95em",
                          padding: "0.22em 0.7em",
                          borderRadius: 8,
                        }}
                      >
                        {g}
                      </span>
                    ))}
                </span>
              ) : (
                <span className="ms-2 text-muted">Nessuno</span>
              )}
            </div>
            <div className="mt-3">
              <span className="fw-bold">Fasce Orarie Disponibili:</span>{" "}
              {(insegnante.fasceOrarieDisponibili || []).length > 0 ? (
                <span className="ms-2">
                  {[...(insegnante.fasceOrarieDisponibili || [])]
                    .sort((a, b) => orariOrdine.indexOf(a) - orariOrdine.indexOf(b))
                    .map((f, idx) => (
                      <span
                        key={idx}
                        className="badge me-1"
                        style={{
                          background: "#22c55e",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "0.95em",
                          padding: "0.22em 0.7em",
                          borderRadius: 8,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                </span>
              ) : (
                <span className="ms-2 text-muted">Nessuna</span>
              )}
            </div>
            <motion.button
              className="btn btn-primary btn-lg mt-auto mx-auto d-block"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: "#6366f1", border: "none", fontWeight: 500, letterSpacing: 0.2 }}
              onClick={handleEdit}
            >
              ✏️ Modifica Insegnante
            </motion.button>
          </motion.div>
          {/* Card Corsi Assegnati */}
          <motion.div
            className="shadow-sm d-flex flex-column align-items-center p-4 position-relative"
            whileHover={{ scale: 1.01, boxShadow: "0 4px 24px #6366f122" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              minWidth: 420,
              maxWidth: 600,
              width: "100%",
              flex: 1.2,
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #6366f1",
              boxShadow: "0 2px 8px #6366f133",
              minHeight: 520,
              height: 520,
              display: "flex",
              padding: "2rem",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center mb-3 w-100"
              style={{ paddingTop: "0.5rem" }}
            >
              <h4 className="fw-bold mb-0" style={{ letterSpacing: 0.2 }}>
                Corsi Assegnati
              </h4>
            </div>
            {(() => {
              const corsiInsegnante = tuttiCorsi;
              if (!corsiInsegnante || corsiInsegnante.length === 0) {
                return <p className="text-muted">Nessun corso assegnato</p>;
              }
              return (
                <ul className="list-group list-group-flush w-100">
                  {corsiInsegnante.map((corso) => (
                    <li
                      key={corso.id}
                      className="list-group-item d-flex justify-content-between align-items-center py-3 px-2"
                      style={{ border: "none", borderBottom: "1px solid #f1f1f1" }}
                    >
                      <span
                        className="badge"
                        style={{
                          background: corso.attivo ? "#22c55e" : "#a1a1aa",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "1.08em",
                          letterSpacing: 0.1,
                          padding: "0.22em 0.7em",
                          borderRadius: 8,
                          minWidth: 120,
                          textAlign: "left",
                        }}
                        title={corso.nome}
                      >
                        {corso.nome}
                      </span>
                      <button
                        className={`btn ${corso.attivo ? "btn-warning" : "btn-success"}`}
                        onClick={async () => {
                          if (
                            window.confirm(
                              corso.attivo ? "Vuoi disattivare questo corso?" : "Vuoi riattivare questo corso?"
                            )
                          ) {
                            try {
                              if (corso.attivo) {
                                await apiClient.put(`/corsi/${corso.id}/interrompi`);
                              } else {
                                await apiClient.put(`/corsi/${corso.id}/riattiva`);
                              }
                              fetchTuttiCorsi();
                              toast.success("Stato corso aggiornato!");
                            } catch (error) {
                              toast.error("Errore durante il cambio di stato del corso.");
                            }
                          }
                        }}
                        style={{
                          borderRadius: 10,
                          border: "none",
                          marginLeft: 12,
                          fontSize: "1.2em",
                          padding: "4px 16px",
                        }}
                        title={corso.attivo ? "Disattiva corso" : "Riattiva corso"}
                      >
                        {corso.attivo ? (
                          <span style={{ fontWeight: 700 }}>✘</span>
                        ) : (
                          <span style={{ fontWeight: 700 }}>✓</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </motion.div>
        </div>
        {isEditing && (
          <ModaleInsegnante
            show={isEditing}
            onHide={handleCancel}
            insegnante={tempInsegnante}
            setInsegnante={setTempInsegnante}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
};

export default DettagliInsegnante;
