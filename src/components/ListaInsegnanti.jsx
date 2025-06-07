import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";
import ModaleInsegnante from "./ModaleInsegnante";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const sortIcons = {
  asc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>,
  desc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>,
};

const ListaInsegnanti = () => {
  const [insegnanti, setInsegnanti] = useState([]);
  const [corsi, setCorsi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formInsegnante, setFormInsegnante] = useState({
    nome: "",
    cognome: "",
    email: "",
    eta: "",
    dataAssunzione: "",
    specializzazioni: [],
    giorniDisponibili: [],
    fasceOrarieDisponibili: [],
  });
  const [filtroTipo, setFiltroTipo] = useState("nome");
  const [filtroValore, setFiltroValore] = useState("");
  const [sortBy, setSortBy] = useState("nome");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCard, setSelectedCard] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchInsegnanti();
    fetchCorsi();
  }, []);

  const fetchInsegnanti = async () => {
    try {
      const response = await apiClient.get("/insegnanti");
      setInsegnanti(response.data);
    } catch (error) {
      console.error("Errore nel recupero degli insegnanti", error);
      setError("Errore nel caricamento degli insegnanti.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCorsi = async () => {
    try {
      const response = await apiClient.get("/corsi");
      setCorsi(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Errore nel recupero dei corsi", error);
    }
  };

  const creaInsegnante = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/insegnanti", formInsegnante);
      toast.success("Insegnante aggiunto con successo!");
      setShowModal(false);
      setFormInsegnante({
        nome: "",
        cognome: "",
        email: "",
        eta: "",
        dataAssunzione: "",
        specializzazioni: [],
        giorniDisponibili: [],
        fasceOrarieDisponibili: [],
      });
      fetchInsegnanti();
    } catch (error) {
      console.error("Errore nella creazione dell'insegnante", error);
      toast.error("Errore durante la creazione dell'insegnante.");
    }
  };

  const eliminaInsegnante = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo insegnante? L'azione è irreversibile.")) {
      try {
        await apiClient.delete(`/insegnanti/${id}`);
        fetchInsegnanti();
      } catch (error) {
        console.error("Errore nell'eliminazione dell'insegnante", error);
      }
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

  // Filtro e ordinamento insegnanti
  const getInsegnantiToShow = () => {
    let filtered = insegnanti.filter((i) => {
      const valore = filtroValore.toLowerCase();
      switch (filtroTipo) {
        case "nome":
          return i.nome.toLowerCase().includes(valore) || i.cognome.toLowerCase().includes(valore);
        case "specializzazioni":
          return (i.specializzazioni || []).join(" ").toLowerCase().includes(valore);
        case "corsi":
          return corsi
            .filter((c) => c.insegnante?.id === i.id)
            .map((c) => c.nome)
            .join(" ")
            .toLowerCase()
            .includes(valore);
        default:
          return true;
      }
    });
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "nome":
          aValue = (a.nome + " " + a.cognome).toLowerCase();
          bValue = (b.nome + " " + b.cognome).toLowerCase();
          break;
        case "specializzazioni":
          aValue = (a.specializzazioni || []).join(", ").toLowerCase();
          bValue = (b.specializzazioni || []).join(", ").toLowerCase();
          break;
        case "corsi":
          aValue = corsi
            .filter((c) => c.insegnante?.id === a.id)
            .map((c) => c.nome)
            .join(", ")
            .toLowerCase();
          bValue = corsi
            .filter((c) => c.insegnante?.id === b.id)
            .map((c) => c.nome)
            .join(", ")
            .toLowerCase();
          break;
        case "dataAssunzione":
          aValue = a.dataAssunzione || "";
          bValue = b.dataAssunzione || "";
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

  // Filtra insegnanti in base alle card
  const getInsegnantiCardFiltered = () => {
    if (selectedCard === "CON_CORSO") {
      return getInsegnantiToShow().filter((i) => corsi.some((c) => c.insegnante?.id === i.id));
    } else if (selectedCard === "SENZA_CORSO") {
      return getInsegnantiToShow().filter((i) => !corsi.some((c) => c.insegnante?.id === i.id));
    }
    return getInsegnantiToShow();
  };

  // Utility per cerchietto iniziali
  const getInitials = (nome, cognome) => {
    return `${nome?.[0] || ""}${cognome?.[0] || ""}`.toUpperCase();
  };

  // Formatta le specializzazioni/corsi: UX_UI_Design -> UX/UI Design, altrimenti Title Case
  const formatSpecialization = (str) => {
    if (!str) return "";
    if (str === "UX_UI_Design") return "UX/UI Design";
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // PAGINAZIONE
  const insegnantiFiltrati = getInsegnantiCardFiltered();
  const totalPages = Math.ceil(insegnantiFiltrati.length / itemsPerPage);
  const paginatedInsegnanti = insegnantiFiltrati.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="row mb-4 align-items-center">
          <div className="col-md-6">
            <motion.div
              className={`stat-card text-center p-3 mb-3 card-clickable ${
                selectedCard === "CON_CORSO" ? "active" : ""
              }`}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                cursor: "pointer",
                border: selectedCard === "CON_CORSO" ? "2.5px solid #6c63ff" : "1.5px solid #6c63ff",
                background: "#fff",
                color: "#222",
                boxShadow: selectedCard === "CON_CORSO" ? "0 0 0 2px #6c63ff33" : "none",
              }}
              onClick={() => setSelectedCard(selectedCard === "CON_CORSO" ? "ALL" : "CON_CORSO")}
            >
              <div className="stat-title">Insegnanti con corso</div>
              <div className="stat-value">
                {insegnanti.filter((i) => corsi.some((c) => c.insegnante?.id === i.id)).length}
              </div>
            </motion.div>
          </div>
          <div className="col-md-6">
            <motion.div
              className={`stat-card text-center p-3 mb-3 card-clickable ${
                selectedCard === "SENZA_CORSO" ? "active" : ""
              }`}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                cursor: "pointer",
                border: selectedCard === "SENZA_CORSO" ? "2.5px solid #ffe066" : "1.5px solid #ffe066",
                background: "#ffe066",
                color: "#222",
                boxShadow: selectedCard === "SENZA_CORSO" ? "0 0 0 2px #ffe06699" : "none",
              }}
              onClick={() => setSelectedCard(selectedCard === "SENZA_CORSO" ? "ALL" : "SENZA_CORSO")}
            >
              <div className="stat-title">Insegnanti senza corso</div>
              <div className="stat-value">
                {insegnanti.filter((i) => !corsi.some((c) => c.insegnante?.id === i.id)).length}
              </div>
            </motion.div>
          </div>
        </div>
        <div className="card">
          <div className="row align-items-center filter-bar">
            <div className="col-md-4">
              <select className="form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="nome">Nome</option>
                <option value="specializzazioni">Specializzazioni</option>
                <option value="corsi">Corsi tenuti</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder={`Filtra per ${filtroTipo}`}
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
                Aggiungi Insegnante
              </button>
            </div>
          </div>

          <ModaleInsegnante
            show={showModal}
            onHide={() => setShowModal(false)}
            onSubmit={creaInsegnante}
            insegnante={formInsegnante}
            setInsegnante={setFormInsegnante}
            modalTitle="Aggiungi Insegnante"
          />

          <div
            className="position-relative studentlist-scroll-area"
            style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}
          >
            {loading && <Thinner message="Caricamento insegnanti..." />}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
              <div className="table-responsive-wrapper">
                <table className="table modern-table">
                  <thead>
                    <tr className="table-header-custom">
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("nome")}>
                        Nome{sortBy === "nome" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("specializzazioni")}>
                        Specializzazioni{sortBy === "specializzazioni" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("corsi")}>
                        Corsi tenuti{sortBy === "corsi" && sortIcons[sortOrder]}
                      </th>
                      <th style={{ cursor: "pointer" }} onClick={() => handleSort("dataAssunzione")}>
                        Data Assunzione{sortBy === "dataAssunzione" && sortIcons[sortOrder]}
                      </th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInsegnanti.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center">
                          Nessun insegnante trovato.
                        </td>
                      </tr>
                    ) : (
                      paginatedInsegnanti.map((insegnante) => {
                        const corsiInsegnante = corsi.filter((c) => c.insegnante?.id === insegnante.id);
                        return (
                          <tr key={insegnante.id}>
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar">{getInitials(insegnante.nome, insegnante.cognome)}</div>
                                <div className="user-info">
                                  <div className="fw-bold">
                                    {insegnante.nome} {insegnante.cognome}
                                  </div>
                                  <div className="text-muted small">{insegnante.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="badge-cell">
                              <div className="student-courses-badges-wrapper">
                                <div className="student-courses-badges horizontal-badges">
                                  {(insegnante.specializzazioni || []).map((spec, idx) => (
                                    <span
                                      key={idx}
                                      className="badge badge-corso bg-primary text-light"
                                      style={{ backgroundColor: "#6c63ff" }}
                                    >
                                      {formatSpecialization(spec)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="badge-cell">
                              {corsiInsegnante.length > 0 ? (
                                <div className="student-courses-badges-wrapper">
                                  <div className="student-courses-badges horizontal-badges">
                                    {corsiInsegnante.map((corso) => (
                                      <span
                                        key={corso.id}
                                        className="badge badge-corso me-1 bg-success"
                                        title={formatSpecialization(corso.nome)}
                                      >
                                        {formatSpecialization(corso.nome)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="d-flex justify-content-center">
                                  <span className="badge bg-warning text-dark">Nessun corso</span>
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="fw-bold">{insegnante.dataAssunzione}</span>
                            </td>
                            <td>
                              <div className="actions-pill">
                                <button
                                  className="btn btn-primary btn-sm"
                                  title="Dettagli"
                                  onClick={() => navigate(`/insegnanti/${insegnante.id}`)}
                                >
                                  <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                                    🔍
                                  </span>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  title="Elimina"
                                  onClick={() => eliminaInsegnante(insegnante.id)}
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
              </div>
            )}

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
      <style>{`
        .studentlist-scroll-area::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
        .studentlist-scroll-area {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .studentlist-scroll-area:hover::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
        .studentlist-scroll-area:hover {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        /* Scrollbar globale invisibile */
        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
        html {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .studentlist-pagination-sticky {
          position: sticky;
          bottom: 0;
          background: #fff;
          z-index: 2;
          box-shadow: 0 -2px 8px #0001;
          padding-top: 8px;
          margin-bottom: -8px;
        }
        .studentlist-pagination-pills {
          display: flex;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .studentlist-page-pill {
          border-radius: 999px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .studentlist-page-btn {
          border: 1.5px solid #6366f1;
          background: #fff;
          color: #6366f1;
          border-radius: 999px;
          padding: 4px 16px;
          font-size: 1em;
          font-weight: 500;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
          outline: none;
          cursor: pointer;
        }
        .studentlist-page-btn:hover {
          background: #e0e7ff;
          color: #3730a3;
          box-shadow: 0 2px 8px #6366f122;
        }
        .studentlist-page-pill.active .studentlist-page-btn {
          background: #6366f1;
          color: #fff;
          border-color: #6366f1;
          box-shadow: 0 2px 8px #6366f133;
        }
        /* Altezza fissa per tutte le righe della tabella studenti */
        .modern-table tbody tr {
          height: 64px;
          max-height: 64px;
        }
        .modern-table td {
          vertical-align: middle !important;
        }
        /* Impedisco che i badge verticali facciano crescere la riga */
        .student-courses-badges.vertical-badges {
          min-height: 36px;
          max-height: 36px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow-y: hidden;
          white-space: nowrap;
          gap: 4px;
        }
        /* Se vuoi badge più piccoli, puoi aggiungere qui: */
        /* .student-courses-badges.vertical-badges .badge { font-size: 0.95em; padding: 4px 10px; } */
      `}</style>
    </>
  );
};

export default ListaInsegnanti;
