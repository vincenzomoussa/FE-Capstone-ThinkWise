import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModaleStudente from "./ModaleStudente";
import Thinnerlay from "./Thinnerlay";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import React from "react";
import { formatDateDMY } from "../utils/dateUtils";

const sortIcons = {
  asc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>,
  desc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>,
};

const CARD_TYPE = {
  ALL: "ALL",
  WITH_COURSE: "WITH_COURSE",
  WITHOUT_COURSE: "WITHOUT_COURSE",
};

const ListaStudenti = () => {
  const [studenti, setStudenti] = useState([]);
  const [studentiSenzaCorso, setStudentiSenzaCorso] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("nome");
  const [filtroValore, setFiltroValore] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("nome");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCard, setSelectedCard] = useState(CARD_TYPE.ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

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

  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    eta: "",
    dataIscrizione: "",
    preferenzaCorso: "",
    giorniPreferiti: [],
    fasceOrariePreferite: [],
  });

  const resetFormData = () => {
    setFormData({
      nome: "",
      cognome: "",
      email: "",
      eta: "",
      dataIscrizione: "",
      preferenzaCorso: "",
      giorniPreferiti: [],
      fasceOrariePreferite: [],
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchStudenti().finally(() => setLoading(false));

    const avvisiJSON = sessionStorage.getItem("dashboardAvvisi");
    if (avvisiJSON) {
      const avvisi = JSON.parse(avvisiJSON);
      avvisi.forEach((avviso) => {
        if (!/pagamento|pagamenti/i.test(avviso.messaggio)) {
          toast.warn(avviso.messaggio);
        }
      });
      sessionStorage.removeItem("dashboardAvvisi");
    }
  }, []);

  const fetchStudenti = async () => {
    try {
      const response = await apiClient.get("/studenti");

      const studentiData = Array.isArray(response.data) ? response.data : response.data.content || []; // fallback se è paginato

      setStudenti(studentiData.filter((s) => s.corsi?.some((corso) => corso.attivo)));
      setStudentiSenzaCorso(studentiData.filter((s) => !s.corsi || s.corsi.every((corso) => !corso.attivo)));
    } catch (error) {
      console.error("Errore nel recupero degli studenti:", error);
    }
  };

  const filtraStudentiModern = (lista) => {
    let filtered = lista.filter((s) => {
      const valore = filtroValore.toLowerCase().trim();
      switch (filtroTipo) {
        case "nome": {
          // Ricerca combinata nome+cognome se c'è uno spazio
          const fullName = (s.nome + " " + s.cognome).toLowerCase();
          if (valore.includes(" ")) {
            return fullName.includes(valore);
          }
          return s.nome.toLowerCase().includes(valore) || s.cognome.toLowerCase().includes(valore);
        }
        case "preferenza corso": {
          const preferenze = Array.isArray(s.preferenzaCorso)
            ? s.preferenzaCorso.join(" ").toLowerCase()
            : (s.preferenzaCorso || "").toLowerCase();
          const parole = valore.split(/\s+/).filter(Boolean);
          return parole.every(p => preferenze.includes(p));
        }
        case "corsi":
          return (s.corsi || []).some((corso) => corso.nome.toLowerCase().includes(valore));
        case "data iscrizione":
          return (s.dataIscrizione || "").toLowerCase().includes(valore);
        default:
          return true;
      }
    });
    // Ordinamento
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "nome":
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case "preferenzaCorso":
          aValue = Array.isArray(a.preferenzaCorso) ? a.preferenzaCorso.length : a.preferenzaCorso ? 1 : 0;
          bValue = Array.isArray(b.preferenzaCorso) ? b.preferenzaCorso.length : b.preferenzaCorso ? 1 : 0;
          break;
        case "dataIscrizione":
          aValue = a.dataIscrizione || "";
          bValue = b.dataIscrizione || "";
          break;
        case "corsi":
          aValue = Array.isArray(a.corsi) ? a.corsi.length : 0;
          bValue = Array.isArray(b.corsi) ? b.corsi.length : 0;
          break;
        default:
          aValue = "";
          bValue = "";
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const eliminaStudente = async (id) => {
    if (window.confirm("❌ Sei sicuro di voler eliminare questo studente?")) {
      try {
        await apiClient.delete(`/studenti/${id}`);
        fetchStudenti();
      } catch (error) {
        console.error("Errore nell'eliminazione dello studente:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/studenti", formData);
      toast.success("Studente aggiunto correttamente!");
      setShowModal(false);
      resetFormData();
      fetchStudenti();
    } catch (error) {
      toast.error(`Errore: ${error.response?.data?.message || "Errore sconosciuto."}`);
    }
  };

  // Nuova funzione per filtrare in base alla card selezionata
  const getStudentiToShow = () => {
    if (selectedCard === CARD_TYPE.WITH_COURSE) return studenti;
    if (selectedCard === CARD_TYPE.WITHOUT_COURSE) return studentiSenzaCorso;
    return [...studenti, ...studentiSenzaCorso];
  };

  // Paginazione
  const studentiFiltrati = filtraStudentiModern(getStudentiToShow());
  const totalPages = Math.ceil(studentiFiltrati.length / studentsPerPage);
  const paginatedStudenti = studentiFiltrati.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  // Gestione click sulle card
  const handleCardClick = (type) => {
    if (selectedCard === type) {
      setSelectedCard(CARD_TYPE.ALL);
    } else {
      setSelectedCard(type);
    }
  };

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <motion.div
              className={`stat-card text-center p-3 mb-3 card-clickable ${
                selectedCard === CARD_TYPE.WITH_COURSE ? "active" : ""
              }`}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                cursor: "pointer",
                border: selectedCard === CARD_TYPE.WITH_COURSE ? "2.5px solid #6c63ff" : "1.5px solid #6c63ff",
                background: "#fff",
                color: "#222",
                boxShadow: selectedCard === CARD_TYPE.WITH_COURSE ? "0 0 0 2px #6c63ff33" : "none",
              }}
              onClick={() => handleCardClick(CARD_TYPE.WITH_COURSE)}
            >
              <div className="stat-title">Studenti con corso</div>
              <div className="stat-value">{studenti.length}</div>
            </motion.div>
          </div>
          <div className="col-md-6">
            <motion.div
              className={`stat-card text-center p-3 mb-3 card-clickable ${
                selectedCard === CARD_TYPE.WITHOUT_COURSE ? "active" : ""
              }`}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                cursor: "pointer",
                border: selectedCard === CARD_TYPE.WITHOUT_COURSE ? "2.5px solid #ffe066" : "1.5px solid #ffe066",
                background: "#ffe066",
                color: "#222",
                boxShadow: selectedCard === CARD_TYPE.WITHOUT_COURSE ? "0 0 0 2px #ffe06699" : "none",
              }}
              onClick={() => handleCardClick(CARD_TYPE.WITHOUT_COURSE)}
            >
              <div className="stat-title">Studenti senza corso</div>
              <div className="stat-value">{studentiSenzaCorso.length}</div>
            </motion.div>
          </div>
        </div>

        <ModaleStudente
          show={showModal}
          onHide={() => setShowModal(false)}
          formStudente={formData}
          setFormStudente={setFormData}
          handleSalvaModificheStudente={handleSubmit}
        />
        <div className="card">
          <div className="row mb-3 align-items-center filter-bar">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filtroTipo || "nome"}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="nome">Nome</option>
                <option value="preferenza corso">Preferenza Corso</option>
                <option value="corsi">Corsi</option>
                <option value="dataIscrizione">Data Iscrizione</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder={`Filtra per ${filtroTipo || "nome"}`}
                value={filtroValore}
                onChange={(e) => setFiltroValore(e.target.value)}
              />
            </div>
            <div className="col-md-4 d-flex justify-content-end align-items-center">
              <button
                className="btn btn-primary btn-lg"
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  fontWeight: 400,
                  padding: "12px 0",
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  boxShadow: "0 2px 8px #6366f133",
                  width: "100%",
                }}
                onClick={() => setShowModal(true)}
              >
                Aggiungi Studente
              </button>
            </div>
          </div>

          <div
            className="position-relative studentlist-scroll-area"
            style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}
          >
            {loading && <Thinnerlay message="Caricamento studenti..." />}

            <table className="table modern-table">
              <thead>
                <tr className="table-header-custom">
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("nome")}>
                    Studente{sortBy === "nome" && sortIcons[sortOrder]}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("preferenzaCorso")}>
                    Preferenza Corso{sortBy === "preferenzaCorso" && sortIcons[sortOrder]}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("dataIscrizione")}>
                    Data Iscrizione{sortBy === "dataIscrizione" && sortIcons[sortOrder]}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("corsi")}>
                    Corsi{sortBy === "corsi" && sortIcons[sortOrder]}
                  </th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudenti.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Nessun studente trovato.
                    </td>
                  </tr>
                ) : (
                  paginatedStudenti.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {s.nome[0]}
                            {s.cognome[0]}
                          </div>
                          <div className="user-info">
                            <div className="fw-bold">
                              {s.nome} {s.cognome}
                            </div>
                            <div className="text-muted small">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div className="student-courses-badges-wrapper">
                          <div className="student-courses-badges horizontal-badges">
                            {Array.isArray(s.preferenzaCorso) && s.preferenzaCorso.length > 0 ? (
                              <>
                                <span
                                  className="badge badge-corso bg-primary text-light"
                                  style={{ backgroundColor: "#6c63ff" }}
                                >
                                  {formatSpecializzazione(s.preferenzaCorso[0])}
                                </span>
                                {s.preferenzaCorso.length > 1 && (
                                  <span
                                    className="badge badge-corso bg-primary text-light"
                                    style={{ backgroundColor: "#6c63ff", fontWeight: 600 }}
                                  >
                                    +{s.preferenzaCorso.length - 1}
                                  </span>
                                )}
                              </>
                            ) : s.preferenzaCorso ? (
                              <span
                                className="badge badge-corso bg-primary text-light"
                                style={{ backgroundColor: "#6c63ff" }}
                              >
                                {formatSpecializzazione(s.preferenzaCorso)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold">{formatDateDMY(s.dataIscrizione)}</span>
                      </td>
                      <td style={{ maxWidth: 220, whiteSpace: "normal", minHeight: 32 }}>
                        {s.corsi && s.corsi.length > 0 ? (
                          <div className="student-courses-badges-wrapper">
                            <div className="student-courses-badges vertical-badges">
                              <span
                                className={`badge badge-corso me-1 ${
                                  s.corsi[0].attivo ? "bg-success" : "bg-secondary"
                                }`}
                                title={s.corsi[0].nome}
                              >
                                {s.corsi[0].nome}
                              </span>
                              {s.corsi.length > 1 && (
                                <span className="badge  badge-corso bg-success text-light" style={{ fontWeight: 600 }}>
                                  +{s.corsi.length - 1}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-center">
                            <span className="badge bg-warning text-dark">Nessun corso</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            boxShadow: "0 1px 4px #0001",
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            className="btn btn-primary btn-sm"
                            style={{
                              borderRadius: "8px 0 0 8px",
                              background: "#e0e7ff",
                              border: "none",
                              color: "#3b3b8f",
                              padding: "10px 36px 10px 36px",
                              outline: "none",
                              fontSize: "1.45em",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 44,
                            }}
                            title="Dettagli"
                            onClick={() => navigate(`/studenti/${s.id}`)}
                          >
                            <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                              🔍
                            </span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{
                              borderRadius: "0 8px 8px 0",
                              background: "#fca5a5",
                              border: "none",
                              color: "#b91c1c",
                              padding: "10px 36px 10px 36px",
                              outline: "none",
                              marginLeft: "-1px",
                              fontSize: "1.45em",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 44,
                            }}
                            title="Elimina"
                            onClick={() => eliminaStudente(s.id)}
                          >
                            <span role="img" aria-label="Elimina" style={{ fontSize: "1.25em" }}>
                              🗑️
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-2">
                <ul className="studentlist-pagination-pills mb-0">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i} className={`studentlist-page-pill${currentPage === i + 1 ? " active" : ""}`}>
                      <button className="studentlist-page-btn" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListaStudenti;
