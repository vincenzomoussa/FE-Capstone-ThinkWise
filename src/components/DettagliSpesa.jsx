import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import { Button } from "react-bootstrap";
import ModaleSpesa from "./ModaleSpesa";
import Thinner from "./Thinner";
import { toast } from "react-toastify";

const DettagliSpesa = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spesa, setSpesa] = useState(null);
  const [tempSpesa, setTempSpesa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSpesa();
  }, []);

  const fetchSpesa = async () => {
    try {
      const response = await apiClient.get(`/spese/${id}`);
      setSpesa(response.data);
      setTempSpesa(response.data);
    } catch (error) {
      console.error("❌ Errore nel recupero della spesa", error);
      setError("Errore nel caricamento della spesa.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setTempSpesa({ ...spesa });
    setIsEditing(true);
  };

  const eliminaSpesa = async () => {
    if (window.confirm("⚠️ Sei sicuro di voler eliminare questa spesa?")) {
      try {
        await apiClient.delete(`/spese/${id}`);
        toast.success("Spesa eliminata con successo!");
        sessionStorage.setItem("refreshReport", "true");
      } catch (error) {
        console.error("❌ Errore nell'eliminazione della spesa", error);
      }
    }
  };

  if (loading) return <Thinner message="Caricamento spesa in corso..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!spesa) return <p>⚠️ Nessuna spesa trovata.</p>;

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5 d-flex flex-column align-items-center justify-content-center">
        <div className="mb-4 w-100" style={{ maxWidth: 540 }}>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/spese")}
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
            🔙 Torna alla lista
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
              <span className="fw-bold">Importo:</span> <span>€ {spesa.importo ?? 0}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Categoria:</span> <span>{String(spesa.categoria || "—")}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Descrizione:</span> <span>{spesa.descrizione || "—"}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Data:</span> <span>{spesa.dataSpesa || "—"}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button
                variant="primary"
                onClick={handleEdit}
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
                ✏️ Modifica Spesa
              </Button>
              <Button
                variant="danger"
                onClick={eliminaSpesa}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                }}
              >
                🗑 Elimina Spesa
              </Button>
            </div>
          </div>
        </div>
        <ModaleSpesa
          show={isEditing}
          onHide={() => setIsEditing(false)}
          formData={tempSpesa}
          setFormData={setTempSpesa}
          isEditing={true}
          handleSubmit={async (e) => {
            e.preventDefault();
            try {
              await apiClient.put(`/spese/${id}`, {
                ...tempSpesa,
                dataSpesa: new Date(tempSpesa.dataSpesa).toISOString().split("T")[0],
              });
              toast.success("Modifica salvata con successo!");
              setSpesa(tempSpesa);
              setIsEditing(false);
              sessionStorage.setItem("refreshReport", "true");
            } catch (error) {
              console.error("❌ Errore nella modifica della spesa:", error);
              toast.error("Errore durante il salvataggio.");
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

export default DettagliSpesa;
