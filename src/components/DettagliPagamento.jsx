import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import it from "date-fns/locale/it";
import ModalePagamento from "./ModalePagamento";
import Thinner from "./Thinner";
import { toast } from "react-toastify";

registerLocale("it", it);

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

  useEffect(() => {
    fetchPagamento();
    fetchStudenti();
  }, []);

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
      setError("Errore nel caricamento del pagamento.", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudenti = async () => {
    try {
      const response = await apiClient.get("/studenti"); // Verifica l'endpoint
      setStudenti(response.data);
    } catch (error) {
      console.error("❌ Errore nel recupero degli studenti:", error);
      setError("Errore nel recupero degli studenti. Controlla la connessione o l'endpoint.");
    }
  };

  const eliminaPagamento = async () => {
    if (window.confirm("Vuoi eliminare questo pagamento?")) {
      try {
        await apiClient.delete(`/pagamenti/${id}`);
        toast.success("Pagamento eliminato con successo!");
        sessionStorage.setItem("refreshReport", "true");
      } catch (error) {
        setError("Errore nella cancellazione del pagamento.", error);
      }
    }
  };

  if (loading) return <Thinner message="Caricamento pagamento..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!pagamento) return <p>⚠️ Nessun pagamento trovato.</p>;

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5 d-flex flex-column align-items-center justify-content-center">
        <div className="mb-4 w-100" style={{ maxWidth: 540 }}>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/pagamenti")}
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
            🔙 Torna alla lista pagamenti
          </button>
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
            <div className="mb-2">
              <span className="fw-bold">📅 Data:</span>{" "}
              <span>{new Date(formData.dataPagamento).toLocaleDateString("it-IT")}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">🎓 Studente:</span>{" "}
              <span>
                {studenti.find((s) => s.id === formData.studenteId)?.nome}{" "}
                {studenti.find((s) => s.id === formData.studenteId)?.cognome}
              </span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">💰 Importo:</span> <span>€ {formData.importo}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">📆 Mensilità:</span> <span>{formData.mensilitaSaldata}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">🏦 Metodo:</span> <span>{formData.metodoPagamento}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">🧾 Numero Ricevuta:</span> <span>{formData.numeroRicevuta}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">📝 Note:</span> <span>{formData.note || "—"}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
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
                ✏️ Modifica Pagamento
              </Button>
              <Button
                variant="danger"
                onClick={eliminaPagamento}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                }}
              >
                🗑 Elimina Pagamento
              </Button>
            </div>
          </div>
        </div>
        <ModalePagamento
          show={isEditing}
          onHide={() => setIsEditing(false)}
          pagamentoSelezionato={formData}
          setPagamentoSelezionato={setFormData}
          isEditing={true}
          studenti={studenti}
          disableStudentSelect={true}
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
              console.error("❌ Errore nel salvataggio:", error);
              toast.error("Errore durante la modifica del pagamento.");
            }
          }}
        />
      </div>
      <style>{`
        .card {
          box-shadow: 0 4px 24px #6366f122 !important;
        }
      `}</style>
    </>
  );
};

export default DettagliPagamento;
