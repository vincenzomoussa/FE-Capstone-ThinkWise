import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ModaleSpesa from "./ModaleSpesa";
import it from "date-fns/locale/it";
import Thinner from "./Thinner";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

registerLocale("it", it);

const ListaSpese = () => {
  const [spese, setSpese] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoria: "",
    importo: "",
    descrizione: "",
    dataSpesa: new Date(),
  });

  const anno = selectedDate ? selectedDate.getFullYear() : null;
  const mese = selectedDate ? String(selectedDate.getMonth() + 1).padStart(2, "0") : null;

  // Ordinamento colonne
  const [sortBy, setSortBy] = useState("dataSpesa");
  const [sortOrder, setSortOrder] = useState("asc");
  const sortIcons = {
    asc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>,
    desc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>,
  };
  const sortedSpese = [...spese].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "importo") {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === "dataSpesa") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  // Colori badge categoria
  const categoriaColor = (cat) => {
    switch (cat) {
      case "PERSONALE":
        return { bg: "#facc15", color: "#1e293b" };
      case "MANUTENZIONE":
        return { bg: "#22c55e", color: "#fff" };
      case "FORMAZIONE":
        return { bg: "#3b82f6", color: "#fff" };
      case "ASSICURAZIONE":
        return { bg: "#a78bfa", color: "#fff" };
      case "ATTREZZATURE":
        return { bg: "#fb923c", color: "#fff" };
      case "TRASPORTO":
        return { bg: "#a1a1aa", color: "#fff" };
      case "ALTRO":
        return { bg: "#6366f1", color: "#fff" };
      default:
        return { bg: "#e0e7ff", color: "#222" };
    }
  };

  useEffect(() => {
    fetchSpese();
  }, [anno, mese, categoria]);

  const fetchSpese = async () => {
    setLoading(true);
    try {
      const params = {};
      if (anno !== null) {
        params.anno = anno;
      }
      if (mese !== null) {
        params.mese = mese;
      }
      if (categoria !== "") {
        params.categoria = categoria;
      }

      const response = await apiClient.get("/spese/filtrate", {
        params,
      });
      setSpese(response.data);
      console.log("📋 Spese aggiornate:", response.data);
    } catch (error) {
      console.error("❌ Errore nel recupero delle spese", error);
      setError("Errore nel caricamento delle spese.");
    } finally {
      setLoading(false);
    }
  };

  const eliminaSpesa = async (id) => {
    if (window.confirm("Vuoi eliminare questa spesa?")) {
      try {
        await apiClient.delete(`/spese/${id}`);
        toast.success("Spesa eliminata con successo!");
        fetchSpese();
        sessionStorage.setItem("refreshReport", "true");
      } catch (error) {
        console.error("❌ Errore nella cancellazione della spesa:", error);
        setError("Errore nella cancellazione della spesa.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("📤 Dati inviati al backend:", formData);

    try {
      await apiClient.post("/spese", {
        ...formData,
        dataSpesa: formData.dataSpesa.toISOString().split("T")[0],
      });

      setShowModal(false);
      setSelectedDate(new Date(formData.dataSpesa)); // 👈 Forza il filtro corretto
      fetchSpese();
      toast.success("Spesa aggiunta con successo!");
      sessionStorage.setItem("refreshReport", "true");
    } catch (error) {
      console.error("❌ Errore nella creazione della spesa", error);
      if (error.response) {
        console.error("📩 Risposta dal server:", error.response.data);
      }
      setError(error.response ? JSON.stringify(error.response.data, null, 2) : "Errore generico.");
    }
  };

  // PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedSpese.length / itemsPerPage);
  const paginatedSpese = sortedSpese.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="row mb-4 align-items-center justify-content-center">
          <div className="col-md-6 mx-auto">
            <motion.div
              className="stat-card text-center p-3 mb-3 card-clickable"
              whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                cursor: "pointer",
                background: "#fff",
                border: "1.5px solid #6c63ff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
                padding: "1.5rem 1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div className="stat-title" style={{ fontSize: "1.45rem", fontWeight: 700, letterSpacing: 0.5 }}>
                Spese
              </div>
              <div className="stat-value" style={{ fontSize: "2.5rem", fontWeight: 700, color: "#222", marginTop: 6 }}>
                {spese.length}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="card">
          <div className="row mb-3 align-items-center filter-bar">
            <div className="col-md-4">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                showFullMonthYearPicker
                showTwoColumnMonthYearPicker
                locale="it"
                className="form-control text-center fw-bold"
                isClearable={true}
                placeholderText="Tutti i mesi"
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Tutte le categorie</option>
                <option value="PERSONALE">Personale</option>
                <option value="MANUTENZIONE">Manutenzione</option>
                <option value="FORMAZIONE">Formazione</option>
                <option value="ASSICURAZIONE">Assicurazione</option>
                <option value="ATTREZZATURE">Attrezzature</option>
                <option value="TRASPORTO">Trasporto</option>
                <option value="ALTRO">Altro</option>
              </select>
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
                onClick={() => {
                  setFormData({
                    categoria: "",
                    importo: "",
                    descrizione: "",
                    dataSpesa: new Date(),
                  });
                  setShowModal(true);
                }}
              >
                Aggiungi Spesa
              </button>
            </div>
          </div>

          {loading ? (
            <Thinner message="Caricamento spese in corso..." />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div
              className="position-relative studentlist-scroll-area"
              style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}
            >
              <table className="table modern-table">
                <thead>
                  <tr className="table-header-custom">
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("dataSpesa")}>
                      Data{sortBy === "dataSpesa" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("importo")}>
                      Importo{sortBy === "importo" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("categoria")}>
                      Categoria{sortBy === "categoria" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("descrizione")}>
                      Descrizione{sortBy === "descrizione" && sortIcons[sortOrder]}
                    </th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSpese.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        📭 Nessuna spesa trovata per il periodo selezionato.
                      </td>
                    </tr>
                  ) : (
                    paginatedSpese.map((spesa) => (
                      <tr key={spesa.id}>
                        <td>{spesa.dataSpesa}</td>
                        <td>
                          <span className="fw-bold">€ {spesa.importo}</span>
                        </td>
                        <td>
                          <span
                            className="badge badge-corso"
                            style={{
                              background: categoriaColor(spesa.categoria).bg,
                              color: categoriaColor(spesa.categoria).color,
                              fontWeight: 600,
                              fontSize: "0.85em",
                              padding: "0.22em 0.7em",
                              borderRadius: 8,
                              minWidth: 60,
                              maxWidth: 110,
                              textAlign: "center",
                              letterSpacing: 0.1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                            title={spesa.categoria.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          >
                            {spesa.categoria.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </td>
                        <td>{spesa.descrizione}</td>
                        <td className="text-center align-middle">
                          <div className="actions-pill">
                            <button
                              className="btn btn-primary btn-sm"
                              title="Dettagli"
                              onClick={() => navigate(`/spese/${spesa.id}`)}
                            >
                              <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                                🔍
                              </span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              title="Elimina"
                              onClick={() => eliminaSpesa(spesa.id)}
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
          )}
        </div>

        <ModaleSpesa
          show={showModal}
          onHide={() => setShowModal(false)}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          isEditing={false}
        />
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

export default ListaSpese;
