import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModaleCorso from "./ModaleCorso";
import Thinnerlay from "./Thinnerlay";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const DettagliCorso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [corso, setCorso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModale, setShowModale] = useState(false);
  const [studentiDisponibili, setStudentiDisponibili] = useState([]);

  useEffect(() => {
    fetchCorso();
  }, []);

  useEffect(() => {
    if (corso && corso.corsoTipo) {
      fetchStudentiDisponibili();
    }
    // eslint-disable-next-line
  }, [corso]);

  const fetchCorso = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/corsi/${id}`);
      setCorso(response.data || {});
    } catch (error) {
      setError("Errore nel caricamento del corso.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentiDisponibili = async () => {
    try {
      const res = await apiClient.get("/studenti");
      const studenti = res.data || [];
      // Normalizza tipo corso
      const tipoCorsoNorm = String(corso.corsoTipo).replace(/_/g, " ").toLowerCase();
      // Filtro studenti adatti
      const adatti = studenti.filter((studente) => {
        // Specializzazione (preferenzaCorso)
        const preferenze = Array.isArray(studente.preferenzaCorso)
          ? studente.preferenzaCorso
          : Object.values(studente.preferenzaCorso || {});
        const preferenzeNorm = preferenze.map((p) => String(p).replace(/_/g, " ").toLowerCase());
        if (!preferenzeNorm.includes(tipoCorsoNorm)) return false;
        // Giorni/orari
        const giorni = Array.isArray(studente.giorniPreferiti)
          ? studente.giorniPreferiti
          : Object.values(studente.giorniPreferiti || {});
        const fasce = Array.isArray(studente.fasceOrariePreferite)
          ? studente.fasceOrariePreferite
          : Object.values(studente.fasceOrariePreferite || {});
        const primoGiornoOk = giorni.includes(corso.giorno) && fasce.includes(corso.orario);
        let secondoGiornoOk = true;
        if (corso.secondoGiorno && corso.secondoOrario) {
          secondoGiornoOk = giorni.includes(corso.secondoGiorno) && fasce.includes(corso.secondoOrario);
        }
        // Non già iscritto
        if (corso.studenti?.some((s) => s.id === studente.id)) return false;
        return primoGiornoOk && secondoGiornoOk;
      });
      setStudentiDisponibili(adatti);
    } catch (error) {
      setStudentiDisponibili([]);
    }
  };

  const handleBanStudente = async (studenteId) => {
    if (window.confirm("Vuoi rimuovere questo studente dal corso?")) {
      try {
        await apiClient.delete(`/studenti/${studenteId}/rimuovi-da-corso/${corso.id}`);
        toast.success("Studente rimosso dal corso!");
        fetchCorso();
        fetchStudentiDisponibili();
      } catch (error) {
        toast.error("Errore nella rimozione dello studente.");
      }
    }
  };

  const handleAssegnaStudente = async (studenteId) => {
    // Blocco per corsi individuali
    if (corso?.tipoCorso === "INDIVIDUALE" && (corso.studenti?.length || 0) >= 1) {
      toast.error("Limite massimo di studenti raggiunto per il corso");
      return;
    }
    const capienza = corso?.aula?.capienzaMax || corso?.aula?.capienza || 0;
    if ((corso.studenti?.length || 0) >= capienza) {
      toast.error("Limite massimo di studenti raggiunto per il corso");
      return;
    }
    try {
      await apiClient.post(`/corsi/${corso.id}/aggiungi-studente`, { studenteId });
      toast.success("Studente assegnato al corso!");
      fetchCorso();
      fetchStudentiDisponibili();
    } catch (error) {
      toast.error("Errore nell'assegnazione dello studente.");
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
        setError("Errore durante l'eliminazione del corso.");
      }
    }
  };

  // Badge color helpers
  const badgeColor = (type, value) => {
    if (type === "stato") return corso?.attivo ? { bg: "#22c55e", color: "#fff" } : { bg: "#a1a1aa", color: "#fff" };
    if (type === "livello") {
      if (value === "Beginner") return { bg: "#ffe066", color: "#7f4f24" };
      if (value === "Junior") return { bg: "#d8f3dc", color: "#2d6a4f" };
      if (value === "Advanced") return { bg: "#b7e4c7", color: "#1b4332" };
    }
    if (type === "tipo") return { bg: "#6366f1", color: "#fff" };
    return { bg: "#e0e7ff", color: "#222" };
  };

  if (loading) return <Thinnerlay />;
  if (error) return <div className="alert alert-danger">{error}</div>;

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
            onClick={() => navigate("/corsi")}
          >
            <span style={{ fontSize: "1.2em", marginRight: 8 }}>←</span> Torna alla Lista Corsi
          </button>
        </div>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <div className="d-flex flex-column flex-md-row justify-content-center align-items-stretch gap-4 mt-5">
          {/* Card Dettagli Corso */}
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
            {/* Header nome corso e bottone stato */}
            <div className="d-flex align-items-center justify-content-between w-100 mb-2">
              <span className="fs-4 fw-bold">{corso?.nome}</span>
              <button
                className={`btn ${corso?.attivo ? "btn-warning" : "btn-success"}`}
                onClick={toggleStatoCorso}
                style={{ borderRadius: 10, border: "none", marginLeft: 12 }}
                title={corso?.attivo ? "Disattiva corso" : "Riattiva corso"}
              >
                {corso?.attivo ? "✘" : "✓"}
              </button>
            </div>
            <div className="mb-3 mt-3">
              <span className="fw-bold">Tipo:</span>
              <span
                className="badge ms-2"
                style={{
                  background: corso?.tipoCorso === "DI_GRUPPO" ? "#8B5CF6" : "#F59E42",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {corso?.tipoCorso
                  ? String(corso.tipoCorso)
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                  : ""}
              </span>
            </div>
            <div className="mb-3">
              <span className="fw-bold">Livello:</span>
              <span
                className="badge ms-2"
                style={{
                  background: badgeColor("livello", corso?.livello).bg,
                  color: badgeColor("livello", corso?.livello).color,
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {corso?.livello}
              </span>
            </div>
            <div className="mb-3">
              <span className="fw-bold">Stato:</span>
              <span
                className="badge ms-2"
                style={{
                  background: badgeColor("stato").bg,
                  color: badgeColor("stato").color,
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {corso?.attivo ? "Attivo" : "Inattivo"}
              </span>
            </div>
            {/* Badge giorno/orario con titoli */}
            <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
              <span className="fw-bold">Giorno:</span>
              {corso?.giorno && (
                <span
                  className="badge"
                  style={{
                    background: "#facc15",
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.95em",
                    padding: "0.22em 0.7em",
                    borderRadius: 8,
                  }}
                >
                  {corso.giorno}
                </span>
              )}
              {corso?.secondoGiorno && (
                <span
                  className="badge"
                  style={{
                    background: "#facc15",
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.95em",
                    padding: "0.22em 0.7em",
                    borderRadius: 8,
                  }}
                >
                  {corso.secondoGiorno}
                </span>
              )}
            </div>
            <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
              <span className="fw-bold">Orario:</span>
              {corso?.orario && (
                <span
                  className="badge"
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.95em",
                    padding: "0.22em 0.7em",
                    borderRadius: 8,
                  }}
                >
                  {corso.orario}
                </span>
              )}
              {corso?.secondoOrario && (
                <span
                  className="badge"
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.95em",
                    padding: "0.22em 0.7em",
                    borderRadius: 8,
                  }}
                >
                  {corso.secondoOrario}
                </span>
              )}
            </div>
            <div className="mb-3">
              <span className="fw-bold">Aula:</span>{" "}
              <span className="fw-semibold">{corso?.aula?.nome || "Non assegnata"}</span>
            </div>
            <div className="mb-1">
              <span className="fw-bold">Insegnante:</span>{" "}
              <span className="fw-semibold">
                {corso?.insegnante?.nome} {corso?.insegnante?.cognome}
              </span>
            </div>
            <motion.button
              className="btn btn-primary btn-lg mt-auto mx-auto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: "#6366f1", border: "none", fontWeight: 500, letterSpacing: 0.2 }}
              onClick={() => setShowModale(true)}
            >
              ✏️ Modifica Corso
            </motion.button>
          </motion.div>
          {/* Card Studenti Iscritti */}
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
                Studenti iscritti
              </h4>
              <span
                className="badge bg-primary"
                style={{
                  fontSize: "1.1em",
                  fontWeight: 600,
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "0.32em 1.1em",
                }}
              >
                {corso?.tipoCorso === "INDIVIDUALE"
                  ? `${corso.studenti?.length || 0}/1`
                  : `${corso.studenti?.length || 0}/${corso?.aula?.capienzaMax || corso?.aula?.capienza || "?"}`}
              </span>
            </div>
            {!corso.studenti || corso.studenti.length === 0 ? (
              <ul className="list-group list-group-flush w-100">
                <li
                  className="list-group-item text-muted"
                  style={{
                    border: "none",
                    borderBottom: "1px solid #f1f1f1",
                    padding: "12px 16px",
                    fontWeight: 500,
                    fontSize: "1em",
                  }}
                >
                  Nessuno studente iscritto
                </li>
              </ul>
            ) : (
              <ul className="list-group list-group-flush w-100">
                {corso.studenti.map((studente) => (
                  <li
                    key={studente.id}
                    className="list-group-item d-flex justify-content-between align-items-center py-3 px-2"
                    style={{ border: "none", borderBottom: "1px solid #f1f1f1" }}
                  >
                    <div className="d-flex flex-column flex-grow-1">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <span className="fw-bold" style={{ color: "#222", fontSize: "1.08em" }}>
                          {studente.nome} {studente.cognome}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: "#6366f1",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.95em",
                            padding: "0.22em 0.7em",
                            borderRadius: 8,
                          }}
                        >
                          {studente.email}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      title="Rimuovi studente dal corso"
                      style={{ fontSize: "1.2em", borderRadius: 8, padding: "4px 12px" }}
                      onClick={() => handleBanStudente(studente.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
          {/* Card Studenti Disponibili */}
          <motion.div
            className="shadow-sm d-flex flex-column align-items-center p-4 position-relative"
            whileHover={{ scale: 1.01, boxShadow: "0 4px 24px #6366f122" }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              minWidth: 340,
              maxWidth: 400,
              width: "100%",
              flex: 1,
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
                Studenti disponibili
              </h4>
            </div>
            {studentiDisponibili.length === 0 ? (
              <ul className="list-group list-group-flush w-100">
                <li
                  className="list-group-item text-muted"
                  style={{
                    border: "none",
                    borderBottom: "1px solid #f1f1f1",
                    padding: "12px 16px",
                    fontWeight: 500,
                    fontSize: "1em",
                  }}
                >
                  Nessuno studente disponibile
                </li>
              </ul>
            ) : (
              <ul className="list-group list-group-flush w-100">
                {studentiDisponibili.map((studente) => (
                  <li
                    key={studente.id}
                    className="list-group-item d-flex justify-content-between align-items-center py-3 px-2"
                    style={{ border: "none", borderBottom: "1px solid #f1f1f1" }}
                  >
                    <span className="fw-bold" style={{ color: "#222", fontSize: "1.08em" }}>
                      {studente.nome} {studente.cognome}
                    </span>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      title="Assegna studente al corso"
                      style={{ fontSize: "1.2em", borderRadius: 8, padding: "4px 12px" }}
                      onClick={() => handleAssegnaStudente(studente.id)}
                    >
                      +
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
        <ModaleCorso show={showModale} onHide={() => setShowModale(false)} corso={corso} refresh={fetchCorso} />
      </div>
    </>
  );
};

export default DettagliCorso;
