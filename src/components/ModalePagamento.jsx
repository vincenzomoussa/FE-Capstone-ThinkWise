import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ModalePagamento = ({
  show,
  onHide,
  pagamentoSelezionato = {}, // Default a un oggetto vuoto
  setPagamentoSelezionato,
  isEditing,
  handleSubmit,
  studenti = [], // Default a un array vuoto
  disableStudentSelect = false, // Prop per disabilitare la selezione dello studente
}) => {
  if (!pagamentoSelezionato) {
    return null; // Evita errori se il pagamento è null o undefined
  }

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal-pagamento">
      <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
          {isEditing ? "✏️ Modifica Pagamento" : "➕ Aggiungi Pagamento"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}>
        <Form onSubmit={handleSubmit}>
          {!disableStudentSelect && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">🎓 Studente</Form.Label>
              <Form.Select
                name="studenteId"
                value={pagamentoSelezionato.studenteId || ""}
                onChange={(e) =>
                  setPagamentoSelezionato({
                    ...pagamentoSelezionato,
                    studenteId: e.target.value,
                  })
                }
                required
                disabled={isEditing}
                style={{
                  borderRadius: 10,
                  border: "1.5px solid #6366f1",
                  boxShadow: "0 1px 4px #6366f122",
                  fontWeight: 500,
                }}
              >
                <option value="">Seleziona Studente</option>
                {studenti.map((studente) => (
                  <option key={studente.id} value={studente.id}>
                    {studente.nome} {studente.cognome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>✅ Mensilità Saldata</Form.Label>
            <Form.Select
              name="mensilitaSaldata"
              value={pagamentoSelezionato.mensilitaSaldata || ""}
              onChange={(e) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  mensilitaSaldata: e.target.value,
                })
              }
              required
            >
              <option value="">Seleziona Mensilità</option>
              {Array.from({ length: 12 }, (_, i) => {
                const mese = new Date(0, i).toLocaleString("it", {
                  month: "long",
                });
                return (
                  <option key={mese} value={`${mese} ${new Date().getFullYear()}`}>
                    {mese} {new Date().getFullYear()}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📆 Data Pagamento</Form.Label>
            <DatePicker
              selected={pagamentoSelezionato.dataPagamento ? new Date(pagamentoSelezionato.dataPagamento) : new Date()}
              onChange={(date) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  dataPagamento: date,
                })
              }
              dateFormat="yyyy-MM-dd"
              className="form-control ms-2"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>💰 Importo (€)</Form.Label>
            <Form.Control
              type="number"
              name="importo"
              placeholder="Es. 150.00"
              value={pagamentoSelezionato.importo || ""}
              onChange={(e) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  importo: e.target.value,
                })
              }
              min="0.01"
              step="0.01"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>💳 Metodo di Pagamento</Form.Label>
            <Form.Select
              name="metodoPagamento"
              value={pagamentoSelezionato.metodoPagamento || "CARTA_DI_CREDITO"}
              onChange={(e) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  metodoPagamento: e.target.value,
                })
              }
              required
            >
              <option value="CARTA_DI_CREDITO">Carta di Credito</option>
              <option value="BONIFICO">Bonifico</option>
              <option value="CONTANTI">Contanti</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🧾 Numero Ricevuta</Form.Label>
            <Form.Control
              type="text"
              name="numeroRicevuta"
              value={pagamentoSelezionato.numeroRicevuta}
              onChange={(e) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  numeroRicevuta: e.target.value,
                })
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📝 Note</Form.Label>
            <Form.Control
              as="textarea"
              name="note"
              value={pagamentoSelezionato.note || ""}
              onChange={(e) =>
                setPagamentoSelezionato({
                  ...pagamentoSelezionato,
                  note: e.target.value,
                })
              }
            />
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
        .custom-modal-pagamento .modal-content {
          border-radius: 16px !important;
          border: 2px solid #6366f1 !important;
          box-shadow: 0 4px 24px #6366f122 !important;
        }
        .custom-modal-pagamento .modal-header {
          border-radius: 16px 16px 0 0 !important;
        }
        .custom-modal-pagamento .modal-body {
          border-radius: 0 0 16px 16px !important;
        }
        .custom-modal-pagamento .form-control:focus, .custom-modal-pagamento .form-select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px #6366f155;
        }
        .custom-modal-pagamento .form-label {
          font-weight: 700;
          color: #3730a3;
        }
      `}</style>
    </Modal>
  );
};

export default ModalePagamento;
