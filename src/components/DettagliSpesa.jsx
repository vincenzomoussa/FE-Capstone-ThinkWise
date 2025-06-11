import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import ModaleSpesa from "./ModaleSpesa";
import Thinner from "./Thinner";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { formatDateDMY } from "../utils/dateUtils";

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
      setError(error?.response?.data?.message || error?.message || "Errore nel caricamento della spesa.");
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
        navigate("/spese");
      } catch (error) {
        setError(error?.response?.data?.message || error?.message || "Errore nell'eliminazione della spesa.");
      }
    }
  };

  // Badge color helpers
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

  if (loading) return <Thinner message="Caricamento spesa in corso..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!spesa) return <p>⚠️ Nessuna spesa trovata.</p>;

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
            onClick={() => navigate("/spese")}
          >
            <span style={{ fontSize: "1.2em", marginRight: 8 }}>←</span> Torna alla Lista Spese
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
            <div className="fs-4 fw-bold mb-4">Dettagli Spesa</div>
            <div className="mb-4">
              <span className="fw-bold">Importo:</span> <span className="fw-semibold">€ {spesa.importo ?? 0}</span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">Categoria:</span>
              <span
                className="badge ms-2"
                style={{
                  background: categoriaColor(spesa.categoria).bg,
                  color: categoriaColor(spesa.categoria).color,
                  fontWeight: 600,
                  fontSize: "0.95em",
                  padding: "0.22em 0.7em",
                  borderRadius: 8,
                }}
              >
                {String(spesa.categoria || "—")}
              </span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">Descrizione:</span> <span>{spesa.descrizione || "—"}</span>
            </div>
            <div className="mb-4">
              <span className="fw-bold">Data:</span> <span>{formatDateDMY(spesa.dataSpesa) || "—"}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4 justify-content-center w-100 mt-auto">
              <motion.button
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: "#6366f1", border: "none", fontWeight: 500, letterSpacing: 0.2 }}
                onClick={handleEdit}
              >
                ✏️ Modifica Spesa
              </motion.button>
            </div>
          </motion.div>
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
              toast.error(error?.response?.data?.message || error?.message || "Errore durante il salvataggio.");
            }
          }}
        />
      </div>
    </>
  );
};

export default DettagliSpesa;
