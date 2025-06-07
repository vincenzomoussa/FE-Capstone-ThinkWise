import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";
import ModaleInsegnante from "./ModaleInsegnante";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const DettagliInsegnante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [insegnante, setInsegnante] = useState(null);
  const [tempInsegnante, setTempInsegnante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [corsiAssegnati, setCorsiAssegnati] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchInsegnante(), fetchCorsiAssegnati()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchInsegnante = async () => {
    try {
      const response = await apiClient.get(`/insegnanti/${id}`);
      setInsegnante(response.data);
    } catch (error) {
      console.error("Errore nel recupero dell'insegnante", error);
      setError("Errore nel caricamento dell'insegnante.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCorsiAssegnati = async () => {
    try {
      const response = await apiClient.get(`/corsi/insegnante/${id}`);
      setCorsiAssegnati(response.data);
    } catch (error) {
      console.error("Errore nel recupero dei corsi", error);
    }
  };

  const handleEdit = () => {
    setTempInsegnante({ ...insegnante });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempInsegnante(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/insegnanti/${id}`, tempInsegnante);
      toast.success("Modifiche salvate con successo!");
      setInsegnante(tempInsegnante);
      setIsEditing(false);
    } catch (error) {
      console.error("Errore nella modifica dell'insegnante", error);
    }
  };

  if (loading) return <Thinner message="Caricamento insegnante..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!insegnante) return <p>⚠️ Nessun insegnante trovato.</p>;

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5 d-flex flex-column align-items-center justify-content-center">
        <div className="mb-4 w-100" style={{ maxWidth: 540 }}>
          <button
            className="btn btn-secondary mb-3"
            onClick={() => navigate("/insegnanti")}
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
              <span className="fw-bold">Nome:</span> <span>{insegnante.nome}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Cognome:</span> <span>{insegnante.cognome}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Email:</span> <span>{insegnante.email}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Età:</span> <span>{insegnante.eta}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Data Assunzione:</span> <span>{insegnante.dataAssunzione}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Specializzazioni:</span>{" "}
              <span>{(insegnante.specializzazioni || []).join(", ")}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Giorni Disponibili:</span>{" "}
              <span>{(insegnante.giorniDisponibili || []).join(", ")}</span>
            </div>
            <div className="mb-2">
              <span className="fw-bold">Fasce Orarie Disponibili:</span>{" "}
              <span>{(insegnante.fasceOrarieDisponibili || []).join(", ")}</span>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button
                variant="warning"
                onClick={handleEdit}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.08em",
                  letterSpacing: 0.2,
                  padding: "10px 24px",
                  border: "none",
                  background: "#fde68a",
                  color: "#b45309",
                }}
              >
                ✏️ Modifica Insegnante
              </Button>
            </div>
          </div>
        </div>
        {isEditing && (
          <ModaleInsegnante
            show={isEditing}
            onHide={handleCancel}
            insegnante={tempInsegnante}
            setInsegnante={setTempInsegnante}
            onSubmit={handleSubmit}
          />
        )}
      </div>
      <style>{`
        .card {
          box-shadow: 0 4px 24px #6366f122 !important;
        }
      `}</style>
    </>
  );
};

export default DettagliInsegnante;
