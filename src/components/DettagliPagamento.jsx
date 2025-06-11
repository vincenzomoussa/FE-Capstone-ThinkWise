import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModalePagamento from "./ModalePagamento";
import Thinner from "./Thinner";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formatDateDMY } from "../utils/dateUtils";

const DettagliPagamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pagamento, setPagamento] = useState(null);
  const [studenti, setStudenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    studenteId: "",
    dataPagamento: new Date(),
    importo: "",
    mensilitaSaldata: "",
    metodoPagamento: "CARTA_DI_CREDITO",
    numeroRicevuta: "",
    note: "",
  });
  const [pagamentiStudente, setPagamentiStudente] = useState([]);
  const [studenteDettaglio, setStudenteDettaglio] = useState(null);

  useEffect(() => {
    fetchPagamento();
    fetchStudenti();
  }, []);

  useEffect(() => {
    if (formData.studenteId) {
      apiClient
        .get(`/studenti/${formData.studenteId}`)
        .then((res) => setStudenteDettaglio(res.data))
        .catch(() => setStudenteDettaglio(null));
      apiClient
        .get(`/pagamenti/studente/${formData.studenteId}`)
        .then((res) => setPagamentiStudente(res.data))
        .catch(() => setPagamentiStudente([]));
    }
  }, [formData.studenteId]);

  const fetchPagamento = async () => {
    try {
      const response = await apiClient.get(`/pagamenti/${id}`);
      setPagamento(response.data);
      setFormData({
        studenteId: response.data.studenteId,
        dataPagamento: new Date(response.data.dataPagamento),
        importo: response.data.importo,
        mensilitaSaldata: response.data.mensilitaSaldata,
        metodoPagamento: response.data.metodoPagamento,
        numeroRicevuta: response.data.numeroRicevuta,
        note: response.data.note || "",
      });
    } catch (error) {
      setError("Errore nel caricamento del pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudenti = async () => {
    try {
      const response = await apiClient.get("/studenti");
      setStudenti(response.data);
    } catch (error) {
      setError("Errore nel recupero degli studenti. Controlla la connessione o l'endpoint.");
    }
  };

  const eliminaPagamento = async () => {
    if (window.confirm("Vuoi eliminare questo pagamento?")) {
      try {
        await apiClient.delete(`/pagamenti/${id}`);
        toast.success("Pagamento eliminato con successo!");
        sessionStorage.setItem("refreshReport", "true");
        navigate("/pagamenti");
      } catch (error) {
        setError(error?.response?.data?.message || error?.message || "Errore nella cancellazione del pagamento.");
      }
    }
  };

  // Badge color helpers
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

  if (loading) return <Thinner message="Caricamento pagamento..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!pagamento) return <p>⚠️ Nessun pagamento trovato.</p>;

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
            onClick={() => navigate("/pagamenti")}
          >
            <span style={{ fontSize: "1.2em", marginRight: 8 }}>←</span> Torna alla Lista Pagamenti
          </button>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-5">
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
              maxWidth: 500,
              width: "100%",
              marginBottom: 0,
              minHeight: 420,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="fs-4 fw-bold mb-4">Dettagli Pagamento</div>
            <div className="mb-4">
              <span className="fw-bold">📅 Data:</span> <span>{formatDateDMY(formData.dataPagamento)}</span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">🎓 Studente:</span>{" "}
              <span>
                {pagamento.studenteNome || studenti.find((s) => s.id == formData.studenteId)?.nome} {pagamento.studenteCognome || studenti.find((s) => s.id == formData.studenteId)?.cognome}
              </span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">💰 Importo:</span> <span className="fw-semibold">€ {formData.importo}</span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">📆 Mensilità:</span>
              <span
                className="badge ms-2"
                style={{
                  background: "#facc15",
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {formData.mensilitaSaldata}
              </span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">🏦 Metodo:</span>
              <span
                className="badge ms-2"
                style={{
                  background: metodoBadgeColor(formData.metodoPagamento).bg,
                  color: metodoBadgeColor(formData.metodoPagamento).color,
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {formData.metodoPagamento.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">🧾 Numero Ricevuta:</span> <span>{formData.numeroRicevuta}</span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">📝 Note:</span> <span>{formData.note || "—"}</span>
            </div>
          </motion.div>
        </div>
        <ModalePagamento
          show={isEditing}
          onHide={() => setIsEditing(false)}
          pagamentoSelezionato={formData}
          setPagamentoSelezionato={setFormData}
          isEditing={true}
          studenti={studenteDettaglio ? [studenteDettaglio] : []}
          disableStudentSelect={true}
          pagamentiStudente={pagamentiStudente}
          handleSubmit={async (e) => {
            e.preventDefault();
            try {
              await apiClient.put(`/pagamenti/${id}`, {
                ...formData,
                dataPagamento: formData.dataPagamento.toISOString().split("T")[0],
              });
              toast.success("Modifica salvata con successo!");
              setIsEditing(false);
              fetchPagamento();
              sessionStorage.setItem("refreshReport", "true");
            } catch (error) {
              toast.error(
                error?.response?.data?.message || error?.message || "Errore durante la modifica del pagamento."
              );
            }
          }}
        />
      </div>
    </>
  );
};

export default DettagliPagamento;
