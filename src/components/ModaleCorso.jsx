import { useEffect, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import apiClient from "../utils/apiClient";
import Thinner from "./Thinner";
import { toast } from "react-toastify";

const LIVELLI = ["Beginner", "Junior", "Advanced"];

const FREQUENZE = ["1 volta a settimana", "2 volte a settimana"];

const ModaleCorso = ({ show, onHide, corso = null, refresh }) => {
  const [formCorso, setFormCorso] = useState({
    nome: "",
    tipoCorso: "",
    corsoTipo: "",
    livello: "Beginner",
    frequenza: "",
    giorno: "",
    orario: "",
    secondoGiorno: "",
    secondoOrario: "",
    insegnanteId: "",
    aulaId: "",
  });
  const [studentiDisponibili, setStudentiDisponibili] = useState([]);
  const [studentiAssegnati, setStudentiAssegnati] = useState([]);
  const [insegnanti, setInsegnanti] = useState([]);
  const [aule, setAule] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      fetchInsegnanti();
      fetchAule();
      fetchStudentiDisponibili();

      if (corso) {
        setFormCorso({
          nome: corso.nome,
          tipoCorso: corso.tipoCorso,
          corsoTipo: corso.corsoTipo,
          livello: corso.livello,
          frequenza: corso.frequenza,
          giorno: corso.giorno,
          orario: corso.orario,
          secondoGiorno: corso.secondoGiorno || "",
          secondoOrario: corso.secondoOrario || "",
          insegnanteId: corso.insegnante?.id || "",
          aulaId: corso.aula?.id || "",
        });
        setStudentiAssegnati(corso.studenti || []);
      } else {
        setFormCorso({
          nome: "",
          tipoCorso: "",
          corsoTipo: "",
          livello: "BEGINNER",
          frequenza: "",
          giorno: "",
          orario: "",
          secondoGiorno: "",
          secondoOrario: "",
          insegnanteId: "",
          aulaId: "",
        });
        setStudentiAssegnati([]);
      }
    }
  }, [show, corso]);

  const fetchInsegnanti = async () => {
    try {
      const res = await apiClient.get("/insegnanti");
      setInsegnanti(res.data || []);
    } catch (error) {
      console.error("Errore nel recupero insegnanti", error);
    }
  };

  const fetchAule = async () => {
    try {
      const res = await apiClient.get("/aule");
      setAule(res.data || []);
    } catch (error) {
      console.error("Errore nel recupero aule", error);
    }
  };

  const fetchStudentiDisponibili = async () => {
    try {
      const res = await apiClient.get("/studenti/senza-corso");
      console.log("Studenti disponibili ricevuti in ModaleCorso:", res.data);
      const parsedData = JSON.parse(res.data);
      setStudentiDisponibili(parsedData || []);
    } catch (error) {
      console.error("Errore nel recupero studenti disponibili in ModaleCorso", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormCorso((prev) => ({ ...prev, [name]: value }));
  };

  const handleAggiungiStudente = (studente) => {
    setStudentiDisponibili((prev) => prev.filter((s) => s.id !== studente.id));
    setStudentiAssegnati((prev) => [...prev, studente]);
  };

  const handleRimuoviStudente = (studente) => {
    setStudentiAssegnati((prev) => prev.filter((s) => s.id !== studente.id));
    setStudentiDisponibili((prev) => [...prev, studente]);
  };

  const handleSalva = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      nome: formCorso.nome,
      tipoCorso: formCorso.tipoCorso,
      corsoTipo: formCorso.corsoTipo,
      livello: formCorso.livello,
      frequenza: formCorso.frequenza,
      giorno: formCorso.giorno,
      orario: formCorso.orario,
      secondoGiorno: formCorso.secondoGiorno,
      secondoOrario: formCorso.secondoOrario,
      insegnanteId: parseInt(formCorso.insegnanteId),
      aulaId: parseInt(formCorso.aulaId),
      studentiIds: studentiAssegnati.map((s) => s.id),
    };

    try {
      if (corso) {
        await apiClient.put(`/corsi/${corso.id}`, payload);
        toast.success("Corso aggiornato con successo!");
      } else {
        await apiClient.post("/corsi", payload);
        toast.success("Corso creato con successo!");
      }
      onHide();
      refresh();
    } catch (error) {
      console.error("❌ Errore durante il salvataggio del corso", error);
      toast.error("Errore durante il salvataggio del corso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="custom-modal-corso">
      <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
          {corso ? "✏️ Modifica Corso" : "🆕 Crea Nuovo Corso"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}>
        {saving ? (
          <Thinner message="Salvataggio corso in corso..." />
        ) : (
          <Form onSubmit={handleSalva}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nome Corso</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formCorso.nome}
                onChange={handleChange}
                required
                placeholder="Es. Corso di React"
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Tipo di Corso</Form.Label>
              <Form.Select
                name="tipoCorso"
                value={formCorso.tipoCorso}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona il tipo di corso</option>
                <option value="INDIVIDUALE">Individuale</option>
                <option value="DI_GRUPPO">Di Gruppo</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Specializzazione</Form.Label>
              <Form.Select
                name="corsoTipo"
                value={formCorso.corsoTipo}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona una specializzazione</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="UX_UI_Design">UX/UI Design</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud_Computing">Cloud Computing</option>
                <option value="Data_Science">Data Science</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Livello</Form.Label>
              <Form.Select
                name="livello"
                value={formCorso.livello}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona il livello della specializzazione</option>
                <option value="Beginner">Beginner</option>
                <option value="Junior">Junior</option>
                <option value="Advanced">Advanced</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Frequenza</Form.Label>
              <Form.Select
                name="frequenza"
                value={formCorso.frequenza}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona frequenza</option>
                {FREQUENZE.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Giorno</Form.Label>
              <Form.Control
                type="text"
                name="giorno"
                value={formCorso.giorno}
                onChange={handleChange}
                required
                placeholder="Es. Lunedì"
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Orario</Form.Label>
              <Form.Control
                type="text"
                name="orario"
                value={formCorso.orario}
                onChange={handleChange}
                required
                placeholder="Es. 10:00-12:00"
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              />
            </Form.Group>

            {formCorso.frequenza === "2 volte a settimana" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Secondo Giorno</Form.Label>
                  <Form.Control
                    type="text"
                    name="secondoGiorno"
                    value={formCorso.secondoGiorno}
                    onChange={handleChange}
                    required
                    placeholder="Es. Mercoledì"
                    style={{
                      borderRadius: 10,
                      border: "1.5px solid #6366f1",
                      boxShadow: "0 1px 4px #6366f122",
                      fontWeight: 500,
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Secondo Orario</Form.Label>
                  <Form.Control
                    type="text"
                    name="secondoOrario"
                    value={formCorso.secondoOrario}
                    onChange={handleChange}
                    required
                    placeholder="Es. 14:00-16:00"
                    style={{
                      borderRadius: 10,
                      border: "1.5px solid #6366f1",
                      boxShadow: "0 1px 4px #6366f122",
                      fontWeight: 500,
                    }}
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Insegnante</Form.Label>
              <Form.Select
                name="insegnanteId"
                value={formCorso.insegnanteId}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona insegnante</option>
                {insegnanti
                  .filter(
                    (i) =>
                      i.specializzazioni?.includes(formCorso.corsoTipo) &&
                      i.giorniDisponibili?.includes(formCorso.giorno) &&
                      i.fasceOrarieDisponibili?.includes(formCorso.orario) &&
                      (formCorso.secondoGiorno === "" || i.giorniDisponibili?.includes(formCorso.secondoGiorno)) &&
                      (formCorso.secondoOrario === "" || i.fasceOrarieDisponibili?.includes(formCorso.secondoOrario))
                  )
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} {i.cognome}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Aula</Form.Label>
              <Form.Select
                name="aulaId"
                value={formCorso.aulaId}
                onChange={handleChange}
                required
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona aula</option>
                {aule.map((aula) => (
                  <option key={aula.id} value={aula.id}>
                    {aula.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr />

            <h5 className="fw-bold">🎓 Studenti Assegnati</h5>
            <ul>
              {studentiAssegnati.map((studente) => (
                <li key={studente.id}>
                  {studente.nome} {studente.cognome}
                  <Button variant="danger" size="sm" className="ms-2" onClick={() => handleRimuoviStudente(studente)}>
                    Rimuovi
                  </Button>
                </li>
              ))}
            </ul>

            <h5 className="fw-bold mt-4">🎓 Studenti Disponibili</h5>
            <ul>
              {studentiDisponibili
                .filter(
                  (studente) =>
                    studente.giorniPreferiti?.includes(formCorso.giorno) &&
                    studente.fasceOrariePreferite?.includes(formCorso.orario) &&
                    (formCorso.secondoGiorno === "" || studente.giorniPreferiti?.includes(formCorso.secondoGiorno)) &&
                    (formCorso.secondoOrario === "" || studente.fasceOrariePreferite?.includes(formCorso.secondoOrario))
                )
                .map((studente) => (
                  <li key={studente.id}>
                    {studente.nome} {studente.cognome}
                    <Button
                      variant="success"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleAggiungiStudente(studente)}
                    >
                      Aggiungi
                    </Button>
                  </li>
                ))}
            </ul>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={onHide}
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
        )}
      </Modal.Body>
      <style>{`
        .custom-modal-corso .modal-content {
          border-radius: 16px !important;
          border: 2px solid #6366f1 !important;
          box-shadow: 0 4px 24px #6366f122 !important;
        }
        .custom-modal-corso .modal-header {
          border-radius: 16px 16px 0 0 !important;
        }
        .custom-modal-corso .modal-body {
          border-radius: 0 0 16px 16px !important;
        }
        .custom-modal-corso .form-control:focus, .custom-modal-corso .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px #6366f155;
        }
        .custom-modal-corso .form-label {
          font-weight: 700;
          color: #3730a3;
        }
      `}</style>
    </Modal>
  );
};

export default ModaleCorso;
