import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import apiClient from "../utils/apiClient";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";
import { toast } from "react-toastify";

const ListaAule = () => {
  const [aule, setAule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAula, setEditingAula] = useState(null); // Stato per l'aula in modifica

  // Stato per la nuova aula
  const [formData, setFormData] = useState({
    nome: "",
    capienzaMax: "",
    disponibilita: [],
  });

  // Funzione per resettare il form
  const resetFormData = () => {
    setFormData({
      nome: "",
      capienzaMax: "",
      disponibilita: [],
    });
  };

  useEffect(() => {
    fetchAule();
  }, []);

  const fetchAule = async () => {
    setLoading(true);

    try {
      const response = await apiClient.get("/aule");
      setAule(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle aule", error);
      setError("Errore nel caricamento delle aule.");
    } finally {
      setLoading(false);
    }
  };

  const eliminaAula = async (id) => {
    if (window.confirm("Vuoi eliminare questa aula?")) {
      try {
        await apiClient.delete(`/aule/${id}`);
        fetchAule();
      } catch (error) {
        console.error("Errore nella cancellazione dell'aula", error);
      }
    }
  };

  // Gestisce il cambiamento degli input nel form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Invia il form per creare una nuova aula
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formattedData = {
      ...formData,
      disponibilita: formData.disponibilita.reduce((acc, giorno) => {
        acc[giorno] = "";
        return acc;
      }, {}),
    };

    try {
      const response = await apiClient.post("/aule", formattedData);
      console.log("Risposta del backend:", response.data);
      setShowAddModal(false);
      resetFormData(); // Resetta il form
      fetchAule();
      toast.success("Aula creata con successo!");
    } catch (error) {
      console.error("❌ Errore nella creazione dell'aula", error);
      setError(error.response ? JSON.stringify(error.response.data, null, 2) : "Errore generico.");
    }
  };

  // Apre il modale di modifica con i dati dell'aula selezionata
  const handleEdit = (aula) => {
    setEditingAula(aula);
    setShowEditModal(true);
  };

  // Salva le modifiche dell'aula
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/aule/${editingAula.id}`, editingAula);
      setShowEditModal(false);
      fetchAule();
      toast.success("Modifiche salvate con successo!");
    } catch (error) {
      console.error("❌ Errore nella modifica dell'aula", error);
    }
  };

  // Ordinamento colonne
  const [sortBy, setSortBy] = useState("nome");
  const [sortOrder, setSortOrder] = useState("asc");
  const sortedAule = [...aule].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "nome") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    } else {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
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

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <div className="row mb-4 align-items-center justify-content-center">
          <div className="col-md-6 mx-auto">
            <div
              className="stat-card text-center p-3 mb-3 card-clickable"
              style={{
                cursor: "pointer",
                background: "#fff",
                border: "1.5px solid rgb(108, 99, 255),",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(99,102,241,0.07)",
                padding: "1.5rem 1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div className="stat-title" style={{ fontSize: "1.45rem", fontWeight: 700, letterSpacing: 0.5 }}>
                Aule
              </div>
              <div className="stat-value" style={{ fontSize: "2.5rem", fontWeight: 700, color: "#222", marginTop: 6 }}>
                {aule.length}
              </div>
            </div>
          </div>
        </div>

        {loading && <Thinner message="Caricamento aule in corso..." />}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card">
          <div
            className="position-relative studentlist-scroll-area"
            style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}
          >
            <table className="table modern-table">
              <thead>
                <tr className="table-header-custom">
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("nome")}>
                    Nome
                    {sortBy === "nome" &&
                      (sortOrder === "asc" ? (
                        <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>
                      ) : (
                        <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>
                      ))}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("capienzaMax")}>
                    Capienza
                    {sortBy === "capienzaMax" &&
                      (sortOrder === "asc" ? (
                        <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▼</span>
                      ) : (
                        <span style={{ fontSize: "0.9em", marginLeft: 4 }}>▲</span>
                      ))}
                  </th>
                  <th className="text-end" style={{ minWidth: 180 }}>
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
                        width: "70%",
                        marginLeft: 12,
                      }}
                      onClick={() => setShowAddModal(true)}
                    >
                      Aggiungi Aula
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAule.map((aula) => (
                  <tr key={aula.id}>
                    <td className="fw-bold">{aula.nome}</td>
                    <td>
                      <span className="fw-bold">{aula.capienzaMax}</span>
                    </td>
                    <td className="text-end align-middle">
                      <div className="actions-pill" style={{ float: "right" }}>
                        <button className="btn btn-primary btn-sm" title="Dettagli" onClick={() => handleEdit(aula)}>
                          <span role="img" aria-label="Dettagli" style={{ fontSize: "1.25em" }}>
                            🔍
                          </span>
                        </button>
                        <button className="btn btn-danger btn-sm" title="Elimina" onClick={() => eliminaAula(aula.id)}>
                          <span role="img" aria-label="Elimina" style={{ fontSize: "1.25em" }}>
                            🗑️
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            resetFormData();
          }}
          centered
          dialogClassName="custom-modal-aula"
        >
          <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
            <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
              🏫 Aggiungi Aula
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}
          >
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: "#3730a3" }}>
                  Nome Aula
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #6366f1",
                    boxShadow: "0 1px 4px #6366f122",
                    fontWeight: 500,
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: "#3730a3" }}>
                  Capienza Massima
                </Form.Label>
                <Form.Control
                  type="number"
                  name="capienzaMax"
                  value={formData.capienzaMax}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #6366f1",
                    boxShadow: "0 1px 4px #6366f122",
                    fontWeight: 500,
                  }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
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
                  ❌ Annulla
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="ms-2"
                  style={{
                    background: "#22c55e",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "1.15em",
                    letterSpacing: 0.2,
                    borderRadius: 12,
                    padding: "12px 32px",
                    boxShadow: "0 2px 8px #22c55e22",
                    transition: "background 0.18s, color 0.18s",
                  }}
                >
                  ✅ Aggiungi Aula
                </Button>
              </div>
            </Form>
          </Modal.Body>
          <style>{`
            .custom-modal-aula .modal-content {
              border-radius: 16px !important;
              border: 2px solid #6366f1 !important;
              box-shadow: 0 4px 24px #6366f122 !important;
            }
            .custom-modal-aula .modal-header {
              border-radius: 16px 16px 0 0 !important;
            }
            .custom-modal-aula .modal-body {
              border-radius: 0 0 16px 16px !important;
            }
            .custom-modal-aula .form-control:focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 2px #6366f155;
            }
            .custom-modal-aula .form-label {
              font-weight: 700;
              color: #3730a3;
            }
          `}</style>
        </Modal>

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="custom-modal-aula">
          <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
            <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
              ✏️ Modifica Aula
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}
          >
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: "#3730a3" }}>
                  Nome Aula
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={editingAula?.nome || ""}
                  onChange={(e) => setEditingAula({ ...editingAula, nome: e.target.value })}
                  required
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #6366f1",
                    boxShadow: "0 1px 4px #6366f122",
                    fontWeight: 500,
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: "#3730a3" }}>
                  Capienza Massima
                </Form.Label>
                <Form.Control
                  type="number"
                  name="capienzaMax"
                  value={editingAula?.capienzaMax || ""}
                  onChange={(e) => setEditingAula({ ...editingAula, capienzaMax: e.target.value })}
                  required
                  style={{
                    borderRadius: 10,
                    border: "1.5px solid #6366f1",
                    boxShadow: "0 1px 4px #6366f122",
                    fontWeight: 500,
                  }}
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
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
                  ❌ Annulla
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="ms-2"
                  style={{
                    background: "#22c55e",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "1.15em",
                    letterSpacing: 0.2,
                    borderRadius: 12,
                    padding: "12px 32px",
                    boxShadow: "0 2px 8px #22c55e22",
                    transition: "background 0.18s, color 0.18s",
                  }}
                >
                  💾 Salva
                </Button>
              </div>
            </Form>
          </Modal.Body>
          <style>{`
            .custom-modal-aula .modal-content {
              border-radius: 16px !important;
              border: 2px solid #6366f1 !important;
              box-shadow: 0 4px 24px #6366f122 !important;
            }
            .custom-modal-aula .modal-header {
              border-radius: 16px 16px 0 0 !important;
            }
            .custom-modal-aula .modal-body {
              border-radius: 0 0 16px 16px !important;
            }
            .custom-modal-aula .form-control:focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 2px #6366f155;
            }
            .custom-modal-aula .form-label {
              font-weight: 700;
              color: #3730a3;
            }
          `}</style>
        </Modal>
      </div>
    </>
  );
};

export default ListaAule;
