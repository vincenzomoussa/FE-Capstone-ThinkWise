import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModaleCorso from "./ModaleCorso";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const sortIcons = {
  asc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>,
  desc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>,
};

const CARD_TYPE = {
  ALL: "ALL",
  ATTIVI: "ATTIVI",
  DISATTIVATI: "DISATTIVATI",
};

const ListaCorsi = () => {
  const [corsiAttivi, setCorsiAttivi] = useState([]);
  const [corsiDisattivati, setCorsiDisattivati] = useState([]);
  const [studentiInListaAttesa, setStudentiInListaAttesa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModale, setShowModale] = useState(false);
  const [filterTipoCorso, setFilterTipoCorso] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCard, setSelectedCard] = useState(CARD_TYPE.ALL);
  const [sortBy, setSortBy] = useState("nome");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const fetchCorsi = async () => {
    setLoading(true);
    try {
      const activeCoursesUrl = filterTipoCorso ? `/corsi/tipo/${filterTipoCorso}?attivo=true` : "/corsi";
      const inactiveCoursesUrl = filterTipoCorso ? `/corsi/tipo/${filterTipoCorso}?attivo=false` : "/corsi/disattivati";

      const response = await apiClient.get(activeCoursesUrl);
      const disattivati = await apiClient.get(inactiveCoursesUrl);
      const listaAttesaRes = await apiClient.get("/corsi/lista-attesa/studenti");

      setCorsiAttivi(Array.isArray(response.data) ? response.data : []);
      setCorsiDisattivati(disattivati.data || []);
      setStudentiInListaAttesa(listaAttesaRes.data || []);
    } catch (error) {
      console.error("❌ Errore nel recupero dei corsi:", error);
      setError("Errore nel caricamento dei corsi.");
    } finally {
      setLoading(false);
    }
  };

  const eliminaCorso = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo corso?")) {
      try {
        await apiClient.delete(`/corsi/${id}`);
        fetchCorsi();
      } catch (error) {
        toast.error("Errore durante l'eliminazione del corso.");
      }
    }
  };

  useEffect(() => {
    fetchCorsi();
    // eslint-disable-next-line
  }, [filterTipoCorso]);

  useEffect(() => {
    const avvisiCorsi = JSON.parse(sessionStorage.getItem("dashboardAvvisi")) || [];
    avvisiCorsi.forEach((avviso) => {
      toast.warn(avviso.messaggio);
    });
    sessionStorage.removeItem("dashboardAvvisi");
  }, []);

  // Gestione click sulle card
  const handleCardClick = (type) => {
    if (selectedCard === type) {
      setSelectedCard(CARD_TYPE.ALL);
    } else {
      setSelectedCard(type);
    }
  };

  // Ordinamento colonne
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Inserisco la funzione per formattare la specializzazione (riutilizzo da ListaInsegnanti)
  const formatSpecialization = (str) => {
    if (!str) return "";
    if (str === "UX_UI_Design") return "UX/UI Design";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Filtro corsi in base a card, ricerca e ordinamento
  const getCorsiToShow = () => {
    let corsi = [];
    if (selectedCard === CARD_TYPE.ATTIVI) corsi = corsiAttivi;
    else if (selectedCard === CARD_TYPE.DISATTIVATI) corsi = corsiDisattivati;
    else corsi = [...corsiAttivi, ...corsiDisattivati];
    if (searchValue.trim()) {
      corsi = corsi.filter((c) => c.nome.toLowerCase().includes(searchValue.toLowerCase()));
    }
    // Ordinamento
    corsi = [...corsi].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "nome":
          aValue = a.nome.toLowerCase();
          bValue = b.nome.toLowerCase();
          break;
        case "corsoTipo":
          aValue = formatSpecialization(a.corsoTipo).toLowerCase();
          bValue = formatSpecialization(b.corsoTipo).toLowerCase();
          break;
        case "tipoCorso":
          aValue = a.tipoCorso || "";
          bValue = b.tipoCorso || "";
          break;
        case "insegnante":
          aValue = (a.insegnante?.nome + " " + a.insegnante?.cognome).toLowerCase();
          bValue = (b.insegnante?.nome + " " + b.insegnante?.cognome).toLowerCase();
          break;
        case "studenti":
          aValue = Array.isArray(a.studenti) ? a.studenti.length : 0;
          bValue = Array.isArray(b.studenti) ? b.studenti.length : 0;
          break;
        default:
          aValue = "";
          bValue = "";
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return corsi;
  };

  const apriModaleNuovoCorso = () => {
    setShowModale(true);
  };

  // PAGINAZIONE
  const corsiFiltrati = getCorsiToShow();
  const totalPages = Math.ceil(corsiFiltrati.length / itemsPerPage);
  const paginatedCorsi = corsiFiltrati.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Funzione robusta per capire se un corso è disattivato
  const isCorsoDisattivato = (corso) => {
    if (corso.attivo === true) return false;
    if (typeof corso.attivo === "string" && corso.attivo.toLowerCase() === "true") return false;
    return true;
  };

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5 position-relative">
        {loading && (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        {error && !loading && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && (
          <>
            <div className="row mb-4 align-items-center">
              <div className="col-md-6">
                <motion.div
                  className={`stat-card text-center p-3 mb-3 card-clickable ${
                    selectedCard === CARD_TYPE.ATTIVI ? "active" : ""
                  }`}
                  whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    cursor: "pointer",
                    border: selectedCard === CARD_TYPE.ATTIVI ? "2.5px solid #6c63ff" : "1.5px solid #6c63ff",
                    background: "#fff",
                    color: "#222",
                    boxShadow: selectedCard === CARD_TYPE.ATTIVI ? "0 0 0 2px #6c63ff33" : "none",
                  }}
                  onClick={() => handleCardClick(CARD_TYPE.ATTIVI)}
                >
                  <div className="stat-title">Corsi attivi</div>
                  <div className="stat-value">{corsiAttivi.length}</div>
                </motion.div>
              </div>
              <div className="col-md-6">
                <motion.div
                  className={`stat-card text-center p-3 mb-3 card-clickable ${
                    selectedCard === CARD_TYPE.DISATTIVATI ? "active" : ""
                  }`}
                  whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    cursor: "pointer",
                    border: selectedCard === CARD_TYPE.DISATTIVATI ? "2.5px solid #ffe066" : "1.5px solid #ffe066",
                    background: "#ffe066",
                    color: "#222",
                    boxShadow: selectedCard === CARD_TYPE.DISATTIVATI ? "0 0 0 2px #ffe06699" : "none",
                  }}
                  onClick={() => handleCardClick(CARD_TYPE.DISATTIVATI)}
                >
                  <div className="stat-title">Corsi disattivati</div>
                  <div className="stat-value">{corsiDisattivati.length}</div>
                </motion.div>
              </div>
            </div>
            <div className="card">
              <div className="row mb-3 align-items-center filter-bar">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterTipoCorso}
                    onChange={(e) => setFilterTipoCorso(e.target.value)}
                  >
                    <option value="">Tutti i Corsi</option>
                    <option value="INDIVIDUALE">Individuale</option>
                    <option value="DI_GRUPPO">Di Gruppo</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cerca per nome corso"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
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
                    onClick={apriModaleNuovoCorso}
                  >
                    Aggiungi corso
                  </button>
                </div>
              </div>
              <div
                className="position-relative studentlist-scroll-area"
                style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}
              >
                <table className="table modern-table">
                  <thead>
                    <tr className="table-header-custom">
                      <th style={{ cursor: "pointer" }} className="text-center" onClick={() => handleSort("nome")}>
                        Nome Corso{sortBy === "nome" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} className="text-center" onClick={() => handleSort("corsoTipo")}>
                        Specializzazione{sortBy === "corsoTipo" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} className="text-center" onClick={() => handleSort("tipoCorso")}>
                        Tipo Corso{sortBy === "tipoCorso" && sortIcons[sortOrder]}
                      </th>
                      <th
                        style={{ cursor: "pointer" }}
                        className="text-center"
                        onClick={() => handleSort("insegnante")}
                      >
                        Insegnante{sortBy === "insegnante" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} className="text-center" onClick={() => handleSort("studenti")}>
                        Studenti{sortBy === "studenti" && sortIcons[sortOrder]}
                      </th>
                      <th className="text-center">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCorsi.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          Nessun corso trovato.
                        </td>
                      </tr>
                    ) : (
                      paginatedCorsi.map((corso) => {
                        console.log('DEBUG corso:', corso.nome, 'attivo:', corso.attivo);
                        return (
                          <tr
                            key={corso.id}
                            className={isCorsoDisattivato(corso) ? "row-disattivato" : ""}
                          >
                            <td className="text-center align-middle">
                              <div className="student-courses-badges horizontal-badges">
                                <span
                                  className="badge badge-corso bg-primary text-light"
                                  style={{ backgroundColor: "#6c63ff" }}
                                >
                                  {corso.nome}
                                </span>
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              <div className="student-courses-badges horizontal-badges">
                                <span
                                  className="badge badge-corso bg-info text-dark"
                                  style={{ backgroundColor: "#e0e7ff", color: "#222", fontWeight: 600 }}
                                >
                                  {formatSpecialization(corso.corsoTipo)}
                                </span>
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              <div className="student-courses-badges horizontal-badges">
                                <span
                                  className="badge badge-corso text-light"
                                  style={{ backgroundColor: corso.tipoCorso === "DI_GRUPPO" ? "#8B5CF6" : "#F59E42" }}
                                >
                                  {corso.tipoCorso === "DI_GRUPPO" ? "Di Gruppo" : "Individuale"}
                                </span>
                              </div>
                            </td>
                            <td className="text-center align-middle">
                              <span className="fw-bold">
                                {corso.insegnante?.nome} {corso.insegnante?.cognome}
                              </span>
                            </td>
                            <td className="text-center align-middle">
                              {corso.tipoCorso === "INDIVIDUALE" ? (
                                <span className="fw-bold">
                                  {(corso.studenti?.length || 0)}/1
                                </span>
                              ) : Array.isArray(corso.studenti) && (corso.aula?.capienza || corso.aula?.capienzaMax) ? (
                                <span className="fw-bold">
                                  {corso.studenti.length}/{corso.aula.capienza || corso.aula.capienzaMax}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td className="text-center align-middle">
                              <div className="actions-pill">
                                <button
                                  className="btn btn-primary btn-sm"
                                  title="Dettagli"
                                  onClick={() => navigate(`/corsi/${corso.id}`)}
                                >
                                  <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                                    🔍
                                  </span>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  title="Elimina"
                                  onClick={() => eliminaCorso(corso.id)}
                                >
                                  <span role="img" aria-label="Elimina" style={{ fontSize: "1.25em" }}>
                                    🗑️
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
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

            <ModaleCorso show={showModale} onHide={() => setShowModale(false)} corso={null} refresh={fetchCorsi} />
          </>
        )}
      </div>
    </>
  );
};

export default ListaCorsi;
