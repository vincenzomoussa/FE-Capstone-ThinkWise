import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import DatePicker from "react-datepicker";
import ModalePagamento from "./ModalePagamento";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import it from "date-fns/locale/it";
import Thinner from "./Thinner";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formatDateDMY } from "../utils/dateUtils";

registerLocale("it", it);

const ListaPagamenti = () => {
  const [pagamenti, setPagamenti] = useState([]);
  const [studenti, setStudenti] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [studenteId, setStudenteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    studenteId: "",
    dataPagamento: new Date(),
    importo: "",
    mensilitaSaldata: "",
    metodoPagamento: "CARTA_DI_CREDITO",
    numeroRicevuta: "",
    note: "",
  });

  const anno = selectedDate?.getFullYear();
  const mese = String(selectedDate?.getMonth() + 1).padStart(2, "0");

  const [selectedCard, setSelectedCard] = useState(null);

  // Filtro testuale per nome/cognome studente
  const [filtroNome, setFiltroNome] = useState("");

  const [pagamentiStudenteSelezionato, setPagamentiStudenteSelezionato] = useState([]);

  useEffect(() => {
    fetchPagamenti();
    fetchStudenti();
  }, [anno, mese, studenteId]);

  useEffect(() => {
    if (formData.studenteId) {
      setPagamentiStudenteSelezionato(
        pagamenti.filter((p) => String(p.studenteId ?? p.studente?.id) === String(formData.studenteId))
      );
    } else {
      setPagamentiStudenteSelezionato([]);
    }
  }, [formData.studenteId, pagamenti]);

  const fetchPagamenti = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/pagamenti", {
        params: { anno, mese, studenteId },
      });
      setPagamenti(response.data);
    } catch (error) {
      setError(error?.response?.data?.message || error?.message || "Errore nel caricamento dei pagamenti.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudenti = async () => {
    try {
      const response = await apiClient.get("/studenti");
      setStudenti(response.data);
    } catch (error) {
      console.error("❌ Errore nel recupero degli studenti:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Errore nel recupero degli studenti. Controlla la connessione o l'endpoint."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEditing) {
        await apiClient.put(`/pagamenti/${formData.id}`, {
          ...formData,
          dataPagamento: formData.dataPagamento.toISOString().split("T")[0],
        });
        toast.success("Pagamento modificato con successo!");
        setShowModal(false);
        await fetchPagamenti();
      } else {
        await apiClient.post("/pagamenti", {
          ...formData,
          dataPagamento: formData.dataPagamento.toISOString().split("T")[0],
        });
        toast.success("Pagamento aggiunto con successo!");
        setShowModal(false);
        fetchPagamenti();
        sessionStorage.setItem("refreshReport", "true");
      }
    } catch (error) {
      console.error("❌ Errore:", error);
      const backendMsg =
        error?.response?.data?.message || error?.message || "Errore durante il salvataggio del pagamento.";
      if (backendMsg.includes("Non è possibile pagare un mese precedente alla data di iscrizione")) {
        toast.error("Non è possibile pagare un mese precedente alla data di iscrizione");
      } else {
        toast.error(backendMsg);
      }
      setError(backendMsg);
    }
  };

  const eliminaPagamento = async (id) => {
    if (window.confirm("Vuoi eliminare questo pagamento?")) {
      try {
        await apiClient.delete(`/pagamenti/${id}`);
        toast.success("Pagamento eliminato con successo!");
        fetchPagamenti();
        sessionStorage.setItem("refreshReport", "true"); // Flag per report
      } catch (error) {
        console.error("❌ Errore nella cancellazione del pagamento:", error);
        setError(error?.response?.data?.message || error?.message || "Errore nella cancellazione del pagamento.");
      }
    }
  };

  const resetFormData = () => {
    setFormData({
      id: "",
      studenteId: "",
      dataPagamento: new Date(),
      importo: "",
      mensilitaSaldata: "",
      metodoPagamento: "CARTA_DI_CREDITO",
      numeroRicevuta: "",
      note: "",
    });
    setIsEditing(false);
  };

  // Ordinamento colonne
  const [sortBy, setSortBy] = useState("dataPagamento");
  const [sortOrder, setSortOrder] = useState("asc");
  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }
  // Filtraggio e ordinamento pagamenti
  const pagamentiOrdinati = [...pagamenti].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "importo") {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === "dataPagamento") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortBy === "mensilitaSaldata") {
      // Parsing: "mese anno" (es: "gennaio 2025")
      const parseMensilita = (str) => {
        if (!str) return { year: 0, month: 0 };
        const [mese, anno] = str.split(" ");
        const mesi = [
          "gennaio",
          "febbraio",
          "marzo",
          "aprile",
          "maggio",
          "giugno",
          "luglio",
          "agosto",
          "settembre",
          "ottobre",
          "novembre",
          "dicembre",
        ];
        const m = mesi.indexOf(mese.toLowerCase());
        return { year: parseInt(anno), month: m };
      };
      const av = parseMensilita(aValue);
      const bv = parseMensilita(bValue);
      if (av.year !== bv.year) return sortOrder === "asc" ? av.year - bv.year : bv.year - av.year;
      if (av.month !== bv.month) return sortOrder === "asc" ? av.month - bv.month : bv.month - av.month;
      return 0;
    } else {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  // PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Funzione per filtrare pagamenti in base a card/metodo, mese e studente
  const getPagamentiToShow = () => {
    let filtered = [...pagamenti];
    // Filtro per metodo
    if (selectedCard) {
      filtered = filtered.filter((p) => p.metodoPagamento === selectedCard);
    }
    // Filtro per mese/anno SOLO se selectedDate è valorizzato
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      filtered = filtered.filter((p) => {
        const d = new Date(p.dataPagamento);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
    }
    // Filtro per studente SOLO se selezionato
    if (studenteId) {
      filtered = filtered.filter((p) => {
        // Supporta sia studenteId diretto che studente.id annidato
        const id = p.studenteId ?? p.studente?.id;
        return String(id) === String(studenteId);
      });
    }
    // Filtro testuale per nome/cognome studente
    if (filtroNome.trim()) {
      filtered = filtered.filter((p) => (p.studenteNome || "").toLowerCase().includes(filtroNome.trim().toLowerCase()));
    }
    // Ordinamento
    filtered = filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === "importo") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortBy === "dataPagamento") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === "mensilitaSaldata") {
        // Parsing: "mese anno" (es: "gennaio 2025")
        const parseMensilita = (str) => {
          if (!str) return { year: 0, month: 0 };
          const [mese, anno] = str.split(" ");
          const mesi = [
            "gennaio",
            "febbraio",
            "marzo",
            "aprile",
            "maggio",
            "giugno",
            "luglio",
            "agosto",
            "settembre",
            "ottobre",
            "novembre",
            "dicembre",
          ];
          const m = mesi.indexOf(mese.toLowerCase());
          return { year: parseInt(anno), month: m };
        };
        const av = parseMensilita(aValue);
        const bv = parseMensilita(bValue);
        if (av.year !== bv.year) return sortOrder === "asc" ? av.year - bv.year : bv.year - av.year;
        if (av.month !== bv.month) return sortOrder === "asc" ? av.month - bv.month : bv.month - av.month;
        return 0;
      } else {
        aValue = (aValue || "").toString().toLowerCase();
        bValue = (bValue || "").toString().toLowerCase();
      }
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  // Calcolo conteggio per metodo
  const getCountByMethod = (method) => pagamenti.filter((p) => p.metodoPagamento === method).length;

  // PAGINAZIONE aggiornata
  const pagamentiFiltrati = getPagamentiToShow();
  const totalPages = Math.ceil(pagamentiFiltrati.length / itemsPerPage);
  const paginatedPagamenti = pagamentiFiltrati.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Logica paginazione pill con massimo 5 bottoni
  const getPaginationRange = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (currentPage >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  // Calcolo totali per metodo
  const getTotalByMethod = (method) =>
    pagamenti.filter((p) => p.metodoPagamento === method).reduce((sum, p) => sum + parseFloat(p.importo), 0);

  const sortIcons = {
    asc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>,
    desc: <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>,
  };

  const paymentMethods = [
    { key: "CARTA_DI_CREDITO", label: "Carta di Credito", color: "#6366f1" },
    { key: "CONTANTI", label: "Contanti", color: "#22c55e" },
    { key: "BONIFICO", label: "Bonifico", color: "#3b82f6" },
  ];

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

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="row mb-4 align-items-center justify-content-center">
          {paymentMethods.map((m) => (
            <div className="col-md-4 mb-3" key={m.key}>
              <motion.div
                className={`stat-card text-center p-3 mb-3 card-clickable${selectedCard === m.key ? " selected" : ""}`}
                whileHover={{ scale: 1.04, boxShadow: "0 4px 24px rgba(99,102,241,0.13)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  cursor: "pointer",
                  background: "#fff",
                  border: `1.5px solid #6366f1`,
                  borderRadius: 16,
                  boxShadow: selectedCard === m.key ? `0 4px 24px #6366f133` : "0 2px 8px rgba(99,102,241,0.07)",
                  padding: "1.5rem 1rem",
                  marginBottom: "1.5rem",
                  transition: "box-shadow 0.2s",
                }}
                onClick={() => setSelectedCard(selectedCard === m.key ? null : m.key)}
              >
                <div
                  className="stat-title"
                  style={{ fontSize: "1.25rem", fontWeight: 700, color: "#6366f1", letterSpacing: 0.5 }}
                >
                  {m.label}
                </div>
                <div
                  className="stat-value"
                  style={{ fontSize: "2.5rem", fontWeight: 700, color: "#222", marginTop: 6 }}
                >
                  {getCountByMethod(m.key)}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="row mb-3 align-items-center filter-bar">
            <div className="col-md-4">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                locale="it"
                className="form-control text-center fw-bold"
                isClearable={true}
                placeholderText="Tutti i mesi"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Filtra per nome studente"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
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
                onClick={() => {
                  // Logica: se c'è uno studente filtrato, preimposta formData.studenteId
                  let preselectId = "";
                  if (studenteId) {
                    preselectId = studenteId;
                  } else if (filtroNome.trim()) {
                    const match = studenti.filter(s =>
                      `${s.nome} ${s.cognome}`.toLowerCase().includes(filtroNome.trim().toLowerCase())
                    );
                    if (match.length === 1) preselectId = match[0].id;
                  }
                  setFormData({
                    id: "",
                    studenteId: preselectId,
                    dataPagamento: new Date(),
                    importo: "",
                    mensilitaSaldata: "",
                    metodoPagamento: "CARTA_DI_CREDITO",
                    numeroRicevuta: "",
                    note: "",
                  });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                Aggiungi Pagamento
              </button>
            </div>
          </div>

          {loading ? (
            <Thinner message="Caricamento pagamenti in corso..." />
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
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("dataPagamento")}>
                      Data{sortBy === "dataPagamento" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("importo")}>
                      Importo{sortBy === "importo" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("studenteNome")}>
                      Studente{sortBy === "studenteNome" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("mensilitaSaldata")}>
                      Mensilità{sortBy === "mensilitaSaldata" && sortIcons[sortOrder]}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("metodoPagamento")}>
                      Metodo{sortBy === "metodoPagamento" && sortIcons[sortOrder]}
                    </th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPagamenti.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center">
                        📭 Nessun pagamento trovato per il periodo selezionato.
                      </td>
                    </tr>
                  ) : (
                    paginatedPagamenti.map((pagamento) => (
                      <tr key={pagamento.id}>
                        <td>{formatDateDMY(pagamento.dataPagamento)}</td>
                        <td>
                          <span className="fw-bold">€ {pagamento.importo}</span>
                        </td>
                        <td>
                          <span className="fw-bold">{pagamento.studenteNome}</span>
                        </td>
                        <td>{pagamento.mensilitaSaldata}</td>
                        <td>
                          <span
                            className="badge badge-corso"
                            style={{
                              background: metodoBadgeColor(pagamento.metodoPagamento).bg,
                              color: metodoBadgeColor(pagamento.metodoPagamento).color,
                              fontWeight: 600,
                              fontSize: "0.95em",
                              padding: "0.22em 0.7em",
                              borderRadius: 8,
                              minWidth: 60,
                              maxWidth: 170,
                              textAlign: "center",
                              letterSpacing: 0.1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                            title={pagamento.metodoPagamento
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          >
                            {pagamento.metodoPagamento.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="text-center align-middle">
                          <div className="actions-pill">
                            <button
                              className="btn btn-primary btn-sm"
                              title="Dettagli"
                              onClick={() => navigate(`/pagamenti/${pagamento.id}`)}
                            >
                              <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                                🔍
                              </span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              title="Elimina"
                              onClick={() => eliminaPagamento(pagamento.id)}
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
            </div>
          )}
        </div>

        <ModalePagamento
          show={showModal}
          onHide={() => {
            setShowModal(false);
            resetFormData();
          }}
          pagamentoSelezionato={formData}
          setPagamentoSelezionato={setFormData}
          isEditing={isEditing}
          handleSubmit={handleSubmit}
          studenti={studenti}
          handleChange={handleChange}
          pagamentiStudente={pagamentiStudenteSelezionato}
          pagamenti={pagamenti}
        />
      </div>
    </>
  );
};

export default ListaPagamenti;
