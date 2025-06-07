import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import it from "date-fns/locale/it";

registerLocale("it", it);

const ModaleSpesa = ({ show, onHide, formData, setFormData, handleSubmit, isEditing = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      dataSpesa: date,
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal-spesa">
      <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
          {isEditing ? "✏️ Modifica Spesa" : "➕ Aggiungi Spesa"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Categoria</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria || ""}
              onChange={handleChange}
              required
              style={{
                borderRadius: 10,
                border: "1.5px solid #6366f1",
                boxShadow: "0 1px 4px #6366f122",
                fontWeight: 500,
              }}
            >
              <option value="">Seleziona una categoria</option>
              <option value="PERSONALE">Personale</option>
              <option value="MANUTENZIONE">Manutenzione</option>
              <option value="FORMAZIONE">Formazione</option>
              <option value="ASSICURAZIONE">Assicurazione</option>
              <option value="ATTREZZATURE">Attrezzature</option>
              <option value="TRASPORTO">Trasporto</option>
              <option value="ALTRO">Altro</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Importo (€)</Form.Label>
            <Form.Control
              type="number"
              name="importo"
              placeholder="Es. 120.50"
              value={formData.importo || ""}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📆 Data Spesa</Form.Label>
            <DatePicker
              selected={formData.dataSpesa ? new Date(formData.dataSpesa) : new Date()}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              locale="it"
              className="form-control ms-2"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control type="text" name="descrizione" value={formData.descrizione || ""} onChange={handleChange} />
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
      <style>{`
        .custom-modal-spesa .modal-content {
          border-radius: 16px !important;
          border: 2px solid #6366f1 !important;
          box-shadow: 0 4px 24px #6366f122 !important;
        }
        .custom-modal-spesa .modal-header {
          border-radius: 16px 16px 0 0 !important;
        }
        .custom-modal-spesa .modal-body {
          border-radius: 0 0 16px 16px !important;
        }
        .custom-modal-spesa .form-control:focus, .custom-modal-spesa .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px #6366f155;
        }
        .custom-modal-spesa .form-label {
          font-weight: 700;
          color: #3730a3;
        }
      `}</style>
    </Modal>
  );
};

export default ModaleSpesa;
