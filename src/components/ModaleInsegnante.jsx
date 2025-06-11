import { Modal, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SPECIALIZZAZIONI = {
  Frontend: "Frontend",
  Backend: "Backend",
  UX_UI_Design: "UX/UI Design",
  Cybersecurity: "Cybersecurity",
  Cloud_Computing: "Cloud Computing",
  Data_Science: "Data Science",
};
const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
const FASCE_ORARIE = ["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"];

const ModaleInsegnante = ({
  show,
  onHide,
  insegnante = {},
  setInsegnante,
  onSubmit,
  modalTitle = "✏️ Aggiungi/Modifica Insegnante",
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInsegnante((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setInsegnante((prev) => ({
      ...prev,
      [field]: checked ? [...(prev[field] || []), value] : (prev[field] || []).filter((item) => item !== value),
    }));
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered dialogClassName="custom-modal-insegnante">
      <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Nome</Form.Label>
            <Form.Control
              name="nome"
              placeholder="Nome insegnante"
              value={insegnante.nome || ""}
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
            <Form.Label className="fw-bold">Cognome</Form.Label>
            <Form.Control
              name="cognome"
              placeholder="Cognome insegnante"
              value={insegnante.cognome || ""}
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
            <Form.Label className="fw-bold">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Email insegnante"
              value={insegnante.email || ""}
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
            <Form.Label className="fw-bold">Età</Form.Label>
            <Form.Control
              type="number"
              name="eta"
              placeholder="Età insegnante"
              value={insegnante.eta || ""}
              onChange={handleChange}
              min={18}
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
            <Form.Label className="fw-bold">Data Assunzione</Form.Label>
            <Form.Control
              type="date"
              name="dataAssunzione"
              value={insegnante.dataAssunzione || ""}
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
            <Form.Label className="fw-bold">Specializzazioni</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {Object.entries(SPECIALIZZAZIONI).map(([value, label]) => (
                <Form.Check
                  key={value}
                  type="checkbox"
                  label={
                    <span
                      className={`badge px-3 py-2 ${
                        insegnante.specializzazioni?.includes(value) ? "bg-primary text-light" : "bg-light text-dark"
                      }`}
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.98em", letterSpacing: 0.1 }}
                    >
                      {label}
                    </span>
                  }
                  value={value}
                  checked={(insegnante.specializzazioni || []).includes(value)}
                  onChange={(e) => handleCheckboxChange(e, "specializzazioni")}
                  className="me-2"
                  style={{ minWidth: 0 }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Giorni Disponibili</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {GIORNI.map((giorno) => (
                <Form.Check
                  key={giorno}
                  type="checkbox"
                  label={
                    <span
                      className={`badge px-3 py-2 ${
                        insegnante.giorniDisponibili?.includes(giorno) ? "bg-warning text-dark" : "bg-light text-dark"
                      }`}
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.98em", letterSpacing: 0.1 }}
                    >
                      {giorno}
                    </span>
                  }
                  value={giorno}
                  checked={(insegnante.giorniDisponibili || []).includes(giorno)}
                  onChange={(e) => handleCheckboxChange(e, "giorniDisponibili")}
                  className="me-2"
                  style={{ minWidth: 0 }}
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Fasce Orarie Disponibili</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {FASCE_ORARIE.map((fascia) => (
                <Form.Check
                  key={fascia}
                  type="checkbox"
                  label={
                    <span
                      className={`badge px-3 py-2 ${
                        insegnante.fasceOrarieDisponibili?.includes(fascia)
                          ? "bg-success text-light"
                          : "bg-light text-dark"
                      }`}
                      style={{ borderRadius: 8, fontWeight: 600, fontSize: "0.98em", letterSpacing: 0.1 }}
                    >
                      {fascia}
                    </span>
                  }
                  value={fascia}
                  checked={(insegnante.fasceOrarieDisponibili || []).includes(fascia)}
                  onChange={(e) => handleCheckboxChange(e, "fasceOrarieDisponibili")}
                  className="me-2"
                  style={{ minWidth: 0 }}
                />
              ))}
            </div>
          </Form.Group>

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
      </Modal.Body>
    </Modal>
  );
};

export default ModaleInsegnante;
