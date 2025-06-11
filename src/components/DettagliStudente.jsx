import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModalePagamento from "./ModalePagamento";
import ModaleStudente from "./ModaleStudente";
import FullThinner from "./FullThinner";
import Thinnerlay from "./Thinnerlay";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formatDateDMY } from "../utils/dateUtils";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [studente, setStudente] = useState(null);
  const [pagamenti, setPagamenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pagamentoSelezionato, setPagamentoSelezionato] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [salvataggioStudenteLoading, setSalvataggioStudenteLoading] = useState(false);
  const [salvataggioPagamentoLoading, setSalvataggioPagamentoLoading] = useState(false);
  const [studenteDettaglio, setStudenteDettaglio] = useState(null);

  const [formStudente, setFormStudente] = useState({
    nome: "",
    cognome: "",
    email: "",
    eta: "",
    dataIscrizione: "",
    preferenzaCorso: "",
    giorniPreferiti: [],
    fasceOrariePreferite: [],
  });

  // PAGINAZIONE PAGAMENTI
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil((pagamenti?.length || 0) / itemsPerPage);
  const paginatedPagamenti = pagamenti.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const getPaginationRange = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  useEffect(() => {
    fetchDatiStudente();
  }, []);

  const fetchDatiStudente = async () => {
    setLoading(true);
    try {
      const [studenteRes, pagamentiRes] = await Promise.all([
        apiClient.get(`/studenti/${id}`),
        apiClient.get(`/pagamenti/studente/${id}`),
      ]);

      console.log("📌 Studente ricevuto dal backend:", studenteRes.data); // 🔥 Debug
      setStudente(studenteRes.data);
      setPagamenti(pagamentiRes.data);
      setError(null);
    } catch (error) {
      console.error("❌ Errore nel recupero dei dati dello studente:", error);
      setError("Errore nel recupero dei dati dello studente.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleChangeStudente = () => {
    if (!studente) return;

    setFormStudente({
      nome: studente.nome || "",
      cognome: studente.cognome || "",
      email: studente.email || "",
      eta: studente.eta || "",
      dataIscrizione: studente.dataIscrizione || "",
      preferenzaCorso: studente.preferenzaCorso || "",
      giorniPreferiti: studente.giorniPreferiti || [],
      fasceOrariePreferite: studente.fasceOrariePreferite || [],
    });

    setShowEditModal(true);
  };

  const handleSalvaModificheStudente = async (e) => {
    e.preventDefault();
    setSalvataggioStudenteLoading(true);
    try {
      await apiClient.put(`/studenti/${id}`, formStudente, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Studente aggiornato!");
      setShowEditModal(false);
      fetchDatiStudente();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Errore durante il salvataggio.");
    } finally {
      setSalvataggioStudenteLoading(false);
    }
  };

  const handleAggiungiPagamento = () => {
    setPagamentoSelezionato({
      studenteId: id,
      dataPagamento: new Date(),
      importo: "",
      mensilitaSaldata: "",
      metodoPagamento: "CARTA_DI_CREDITO",
      numeroRicevuta: "",
      note: "",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleModificaPagamento = (pagamento) => {
    setPagamentoSelezionato({
      ...pagamento,
      dataPagamento: pagamento.dataPagamento ? new Date(pagamento.dataPagamento) : new Date(),
    });
    setIsEditing(true);
    apiClient
      .get(`/studenti/${pagamento.studenteId ?? id}`)
      .then((res) => {
        setStudenteDettaglio(res.data);
        setShowModal(true);
      })
      .catch(() => {
        setStudenteDettaglio(null);
        setShowModal(true);
      });
  };

  const handleEliminaPagamento = async (pagamentoId) => {
    if (window.confirm("Sei sicuro di voler eliminare questo pagamento?")) {
      try {
        await apiClient.delete(`/pagamenti/${pagamentoId}`);
        fetchDatiStudente();
      } catch (error) {
        console.error("❌ Errore nell'eliminazione del pagamento:", error);
        toast.error(error?.response?.data?.message || error?.message || "Errore nell'eliminazione del pagamento.");
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!pagamentoSelezionato) {
      toast.error(error?.response?.data?.message || error?.message || "Errore: nessun pagamento selezionato.");
      return;
    }

    const { dataPagamento, importo, mensilitaSaldata, metodoPagamento, numeroRicevuta, note } = pagamentoSelezionato;

    if (!importo || parseFloat(importo) <= 0) {
      toast.error(error?.response?.data?.message || error?.message || "Inserisci un importo valido.");
      return;
    }
    if (!mensilitaSaldata) {
      toast.error(error?.response?.data?.message || error?.message || "Seleziona la mensilità saldata.");
      return;
    }
    if (!numeroRicevuta) {
      toast.error(error?.response?.data?.message || error?.message || "Inserisci un numero ricevuta valido.");
      return;
    }

    const pagamentoData = {
      studente: { id: id },
      dataPagamento: dataPagamento
        ? new Date(dataPagamento).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      importo: Math.max(1, parseFloat(importo)),
      mensilitaSaldata,
      numeroRicevuta: numeroRicevuta || `REC-${Date.now()}`,
      metodoPagamento,
      note: note || "",
    };

    setSalvataggioPagamentoLoading(true);

    try {
      if (isEditing) {
        await apiClient.put(`/pagamenti/${pagamentoSelezionato.id}`, pagamentoData);
      } else {
        await apiClient.post(`/studenti/${id}/pagamenti`, pagamentoData);
      }

      toast.success("Pagamento salvato con successo!");
      setShowModal(false);
      fetchDatiStudente();
    } catch (error) {
      console.error("❌ Errore nel salvataggio del pagamento:", error);

      if (error.response?.status === 401) {
        toast.warn("⚠️ Sessione scaduta. Effettua nuovamente il login.");
        dispatch(logout());
        window.location.href = "/login";
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Errore sconosciuto.");
      }
    } finally {
      setSalvataggioPagamentoLoading(false);
    }
  };

  const badgeColor = (type, value) => {
    if (type === "preferenza") return { bg: "#6366f1", color: "#fff" };
    if (type === "giorno") return { bg: "#facc15", color: "#1e293b" };
    if (type === "fascia") return { bg: "#22c55e", color: "#fff" };
    return { bg: "#e0e7ff", color: "#222" };
  };
  // Badge color per metodo pagamento
  const metodoBadgeColor = (metodo) => {
    switch ((metodo || "").toUpperCase()) {
      case "CARTA DI CREDITO":
      case "CARTA_DI_CREDITO":
        return { bg: "#6366f1", color: "#fff" };
      case "CONTANTI":
        return { bg: "#22c55e", color: "#fff" };
      case "BONIFICO":
        return { bg: "#3b82f6", color: "#fff" };
      case "PAYPAL":
        return { bg: "#fb923c", color: "#fff" };
      default:
        return { bg: "#e0e7ff", color: "#222" };
    }
  };

  const handleLeaveCourse = async (corsoId) => {
    if (window.confirm("Vuoi davvero smettere di seguire questo corso?")) {
      try {
        await apiClient.delete(`/studenti/${id}/rimuovi-da-corso/${corsoId}`);
        toast.success("Corso rimosso con successo");
        fetchDatiStudente();
      } catch (error) {
        toast.error("Errore durante la rimozione dal corso.");
      }
    }
  };

  const handleAssegnaCorso = async () => {
    try {
      const res = await apiClient.get("/corsi");
      const corsi = res.data || [];
      const preferenze = Array.isArray(studente.preferenzaCorso)
        ? studente.preferenzaCorso
        : Object.values(studente.preferenzaCorso || {});
      const giorni = Array.isArray(studente.giorniPreferiti)
        ? studente.giorniPreferiti
        : Object.values(studente.giorniPreferiti || {});
      const fasce = Array.isArray(studente.fasceOrariePreferite)
        ? studente.fasceOrariePreferite
        : Object.values(studente.fasceOrariePreferite || {});
      // Prendi gli id dei corsi già assegnati allo studente
      const corsiAssegnatiIds = (studente.corsi || []).map(c => c.id);
      // Filtra i corsi compatibili e NON già assegnati
      const corsiCompatibili = corsi.filter((corso) => {
        if (!corso.attivo) return false;
        const capienza = corso.aula?.capienzaMax || corso.aula?.capienza || 0;
        if ((corso.studenti?.length || 0) >= capienza) return false;
        if (!preferenze.includes(corso.corsoTipo)) return false;
        // Deve essere disponibile in TUTTI i giorni/orari del corso
        const primoGiornoOk = giorni.includes(corso.giorno) && fasce.includes(corso.orario);
        let secondoGiornoOk = true;
        if (corso.secondoGiorno && corso.secondoOrario) {
          secondoGiornoOk = giorni.includes(corso.secondoGiorno) && fasce.includes(corso.secondoOrario);
        }
        // Escludi corsi già assegnati
        if (corsiAssegnatiIds.includes(corso.id)) return false;
        return primoGiornoOk && secondoGiornoOk;
      });
      if (corsiCompatibili.length === 0) {
        toast.error("Nessun corso disponibile da assegnare");
        return;
      }
      const corsoDaAssegnare = corsiCompatibili[0];
      await apiClient.post(`/corsi/${corsoDaAssegnare.id}/aggiungi-studente`, { studenteId: studente.id });
      toast.success("Corso assegnato con successo");
      fetchDatiStudente();
    } catch (error) {
      toast.error("Errore durante l'assegnazione del corso");
    }
  };

  if (loading) return <FullThinner message="Caricamento studente..." />;
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
            onClick={() => navigate("/studenti")}
          >
            <span style={{ fontSize: "1.2em", marginRight: 8 }}>←</span> Torna alla Lista Studenti
          </button>
        </div>

        {studente && (
          <div className="d-flex flex-column flex-md-row justify-content-center align-items-stretch gap-4 mt-5">
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
                flex: 1.5,
                marginBottom: 0,
                minHeight: 520,
                height: 520,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="fs-4 fw-bold mb-2">
                {studente.nome} {studente.cognome}
              </div>
              <div className="mb-1">
                <span className="fw-bold">Email:</span> <span className="fw-semibold">{studente.email}</span>
              </div>
              <div className="mb-1">
                <span className="fw-bold">Età:</span> <span className="fw-semibold">{studente.eta}</span>
              </div>
              <div className="mb-3">
                <span className="fw-bold">Data Iscrizione:</span>{" "}
                <span className="fw-semibold">{formatDateDMY(studente.dataIscrizione)}</span>
              </div>
              <div className="mb-3">
                <span className="fw-bold">Preferenze:</span>
                {(studente.preferenzaCorso || []).length > 0 ? (
                  <span className="ms-2">
                    {[...studente.preferenzaCorso]
                      .sort((a, b) => formatSpecializzazione(a).localeCompare(formatSpecializzazione(b)))
                      .map((pref, idx) => (
                        <span
                          key={idx}
                          className="badge me-1"
                          style={{
                            background: badgeColor("preferenza").bg,
                            color: badgeColor("preferenza").color,
                            fontWeight: 600,
                            fontSize: "0.95em",
                            padding: "0.22em 0.7em",
                            borderRadius: 8,
                            letterSpacing: 0.1,
                          }}
                        >
                          {formatSpecializzazione(pref)}
                        </span>
                      ))}
                  </span>
                ) : (
                  <span className="ms-2 text-muted">Nessuna</span>
                )}
              </div>
              <div className="mb-3 mt-3">
                <span className="fw-bold">Giorni Disponibili:</span>
                {(studente.giorniPreferiti || []).length > 0 ? (
                  <span className="ms-2">
                    {[...studente.giorniPreferiti]
                      .sort((a, b) => {
                        const giorniOrdine = [
                          "Lunedì",
                          "Martedì",
                          "Mercoledì",
                          "Giovedì",
                          "Venerdì",
                          "Sabato",
                          "Domenica",
                        ];
                        return giorniOrdine.indexOf(a) - giorniOrdine.indexOf(b);
                      })
                      .map((g, idx) => (
                        <span
                          key={idx}
                          className="badge me-1"
                          style={{
                            background: badgeColor("giorno").bg,
                            color: badgeColor("giorno").color,
                            fontWeight: 600,
                            fontSize: "0.95em",
                            padding: "0.22em 0.7em",
                            borderRadius: 8,
                            letterSpacing: 0.1,
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
                <span className="fw-bold">Orari Disponibili:</span>
                {(studente.fasceOrariePreferite || []).length > 0 ? (
                  <span className="ms-2">
                    {[...studente.fasceOrariePreferite]
                      .sort((a, b) => {
                        const getStartHour = (fascia) => parseInt(fascia.split(":")[0], 10);
                        return getStartHour(a) - getStartHour(b);
                      })
                      .map((f, idx) => (
                        <span
                          key={idx}
                          className="badge me-1"
                          style={{
                            background: badgeColor("fascia").bg,
                            color: badgeColor("fascia").color,
                            fontWeight: 600,
                            fontSize: "0.95em",
                            padding: "0.22em 0.7em",
                            borderRadius: 8,
                            letterSpacing: 0.1,
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
                onClick={handleChangeStudente}
              >
                ✏️ Modifica Studente
              </motion.button>
            </motion.div>
            <motion.div
              className="shadow-sm d-flex flex-column align-items-center p-4 position-relative"
              whileHover={{ scale: 1.01, boxShadow: "0 4px 24px #6366f122" }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                minWidth: 420,
                maxWidth: 600,
                width: "100%",
                flex: 2.2,
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
              {salvataggioPagamentoLoading && <Thinnerlay message="Salvataggio pagamento..." />}
              <div
                className="d-flex justify-content-between align-items-center mb-3 w-100"
                style={{ paddingTop: "0.5rem" }}
              >
                <h4 className="fw-bold mb-0" style={{ letterSpacing: 0.2 }}>
                  Pagamenti
                </h4>
                <motion.button
                  className="btn btn-primary btn-lg px-4"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ background: "#22c55e", border: "none", fontWeight: 500, letterSpacing: 0.2 }}
                  onClick={handleAggiungiPagamento}
                >
                  ➕ Aggiungi Pagamento
                </motion.button>
              </div>
              {pagamenti.length === 0 ? (
                <p className="text-muted">Nessun pagamento registrato</p>
              ) : (
                <>
                  <ul className="list-group list-group-flush w-100">
                    {paginatedPagamenti.map((pagamento) => (
                      <li
                        key={pagamento.id}
                        className="list-group-item d-flex justify-content-between align-items-center py-3 px-2"
                        style={{ border: "none", borderBottom: "1px solid #f1f1f1" }}
                      >
                        <div className="d-flex flex-column flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2">
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
                              {pagamento.mensilitaSaldata}
                            </span>
                            <span className="fw-bold" style={{ color: "#222", fontSize: "1.08em" }}>
                              € {pagamento.importo ? pagamento.importo.toFixed(2) : "0.00"}
                            </span>
                            <span
                              className="badge"
                              style={{
                                background: metodoBadgeColor(pagamento.metodoPagamento).bg,
                                color: metodoBadgeColor(pagamento.metodoPagamento).color,
                                fontWeight: 600,
                                fontSize: "0.95em",
                                padding: "0.22em 0.7em",
                                borderRadius: 8,
                              }}
                            >
                              {pagamento.metodoPagamento.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                          <div className="text-muted small mt-1" style={{ marginLeft: 2 }}>
                            {pagamento.dataPagamento}
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <div
                            style={{
                              display: "inline-flex",
                              boxShadow: "0 1px 4px #0001",
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <button
                              className="btn btn-danger btn-sm"
                              style={{
                                borderRadius: "0 8px 8px 0",
                                background: "#fca5a5",
                                border: "none",
                                color: "#b91c1c",
                                padding: "6px 16px 6px 16px",
                                outline: "none",
                                marginLeft: "-1px",
                                fontSize: "1.1em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 32,
                              }}
                              title="Elimina"
                              onClick={() => handleEliminaPagamento(pagamento.id)}
                            >
                              <span role="img" aria-label="Elimina" style={{ fontSize: "1em" }}>
                                🗑️
                              </span>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {totalPages > 1 && (
                    <nav
                      className="d-flex justify-content-center mt-2"
                      style={{
                        position: "absolute",
                        bottom: "1.5rem",
                        left: 0,
                        width: "100%",
                        zIndex: 2,
                      }}
                    >
                      <ul className="studentlist-pagination-pills mb-0">
                        {getPaginationRange().map((page, idx) =>
                          page === "..." ? (
                            <li key={"ellipsis-" + idx} className="studentlist-page-pill disabled">
                              <span style={{ padding: "4px 12px", color: "#aaa" }}>...</span>
                            </li>
                          ) : (
                            <li key={page} className={`studentlist-page-pill${currentPage === page ? " active" : ""}`}>
                              <button className="studentlist-page-btn" onClick={() => setCurrentPage(page)}>
                                {page}
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </motion.div>
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
                flexDirection: "column",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                <h4 className="fw-bold mb-0" style={{ letterSpacing: 0.2 }}>
                  Corsi seguiti
                </h4>
              </div>
              {!studente.corsi || studente.corsi.length === 0 ? (
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
                    Nessun corso seguito
                  </li>
                </ul>
              ) : (
                <ul className="list-group list-group-flush w-100">
                  {studente.corsi.map((corso) => (
                    <li
                      key={corso.id}
                      className="list-group-item d-flex justify-content-between align-items-center py-3 px-2"
                      style={{ border: "none", borderBottom: "1px solid #f1f1f1" }}
                    >
                      <span
                        className={`badge badge-corso me-1 ${corso.attivo ? "bg-success" : "bg-secondary"}`}
                        title={corso.nome}
                        style={{ fontWeight: 600, fontSize: "1.08em", letterSpacing: 0.1 }}
                      >
                        {corso.nome}
                      </span>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Smetti di seguire il corso"
                        style={{ fontSize: "1.2em", borderRadius: 8, padding: "4px 12px" }}
                        onClick={() => handleLeaveCourse(corso.id)}
                      >
                        🚷
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="btn btn-primary btn-lg mt-auto mx-auto d-block"
                style={{ background: "#6366f1", border: "none", fontWeight: 500, letterSpacing: 0.2, marginTop: 32 }}
                onClick={handleAssegnaCorso}
              >
                ➕ Assegna corso
              </button>
            </motion.div>
          </div>
        )}
      </div>

      <ModalePagamento
        show={showModal}
        onHide={() => setShowModal(false)}
        pagamentoSelezionato={pagamentoSelezionato}
        setPagamentoSelezionato={setPagamentoSelezionato}
        isEditing={isEditing}
        handleSubmit={handleSubmit}
        disableStudentSelect={true}
        studenti={isEditing ? (studenteDettaglio ? [studenteDettaglio] : []) : studente ? [studente] : []}
        pagamentiStudente={pagamenti}
      />

      <div className="position-relative">
        {salvataggioStudenteLoading && <Thinnerlay message="Salvataggio studente..." />}
        <ModaleStudente
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          formStudente={formStudente}
          setFormStudente={setFormStudente}
          handleSalvaModificheStudente={handleSalvaModificheStudente}
          loading={salvataggioStudenteLoading}
        />
      </div>
    </>
  );
};

export default StudentDetail;
