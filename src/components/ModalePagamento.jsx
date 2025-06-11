import React, { useMemo } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
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
  pagamentiStudente = [], // nuova prop
  pagamenti = [], // tutti i pagamenti, usato in ListaPagamenti
  ...rest
}) => {
  if (!pagamentoSelezionato) {
    return null; // Evita errori se il pagamento è null o undefined
  }

  // Parsing robusto solo per formato ISO (yyyy-MM-dd)
  function parseDataIscrizione(str) {
    if (!str) return null;
    // ISO
    const iso = new Date(str);
    if (!isNaN(iso)) return iso;
    return null;
  }

  // Funzione di normalizzazione universale per i mesi
  const normalizeMonth = (str) => {
    if (!str) return "";
    str = String(str).toLowerCase().replace(/\s+/g, " ").trim();
    // Se già nel formato 'mese anno'
    const mesi = [
      "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
      "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
    ];
    // Match 'mese anno'
    if (/^[a-zàèéìòù]+ \d{4}$/.test(str)) return str;
    // Match 'MM/YYYY' o 'MM-YYYY' o 'YYYY-MM' o 'YYYY/MM'
    let match = str.match(/^(\d{2})[\/\-](\d{4})$/); // MM/YYYY o MM-YYYY
    if (match) {
      const meseIdx = parseInt(match[1], 10) - 1;
      if (meseIdx >= 0 && meseIdx < 12) return `${mesi[meseIdx]} ${match[2]}`;
    }
    match = str.match(/^(\d{4})[\/\-](\d{2})$/); // YYYY-MM o YYYY/MM
    if (match) {
      const meseIdx = parseInt(match[2], 10) - 1;
      if (meseIdx >= 0 && meseIdx < 12) return `${mesi[meseIdx]} ${match[1]}`;
    }
    return str;
  };

  // Calcola le mensilità disponibili in base alla data di iscrizione
  const mensilitaDisponibili = useMemo(() => {
    let dataIscrizione;
    if (pagamentoSelezionato.studenteId && studenti.length > 0) {
      const studente = studenti.find((s) => String(s.id) === String(pagamentoSelezionato.studenteId));
      if (studente && studente.dataIscrizione) {
        dataIscrizione = parseDataIscrizione(studente.dataIscrizione);
      }
    }
    // Se non c'è studente selezionato o data iscrizione, mostra solo l'anno corrente
    if (!dataIscrizione) {
      const now = new Date();
      return Array.from({ length: 12 }, (_, i) => {
        const mese = new Date(0, i).toLocaleString("it", { month: "long" });
        return `${mese} ${now.getFullYear()}`;
      });
    }
    // Calcola tutte le mensilità da iscrizione a oggi
    const oggi = new Date();
    const mensilita = [];
    let data = new Date(dataIscrizione.getFullYear(), dataIscrizione.getMonth(), 1);
    while (data <= oggi) {
      const mese = data.toLocaleString("it", { month: "long" });
      mensilita.push(`${mese} ${data.getFullYear()}`);
      data.setMonth(data.getMonth() + 1);
    }
    return mensilita;
  }, [pagamentoSelezionato.studenteId, studenti, studenti[0]?.dataIscrizione]);

  // Se ho pagamentiStudente uso quello, altrimenti filtro da pagamenti
  const pagamentiEffettivi = useMemo(() => {
    if (pagamentiStudente && pagamentiStudente.length > 0) return pagamentiStudente;
    if (pagamenti && pagamentoSelezionato.studenteId) {
      // Trova lo studente selezionato
      const studenteSel = studenti.find(s => String(s.id) === String(pagamentoSelezionato.studenteId));
      return pagamenti.filter(
        (p) =>
          String(p.studenteId ?? p.studente?.id) === String(pagamentoSelezionato.studenteId) ||
          (
            studenteSel &&
            p.studenteNome &&
            p.studenteNome.toLowerCase() === `${studenteSel.nome} ${studenteSel.cognome}`.toLowerCase()
          )
      );
    }
    return [];
  }, [pagamentiStudente, pagamenti, pagamentoSelezionato.studenteId, studenti]);

  const mensilitaPagate = useMemo(() => {
    return pagamentiEffettivi.map((p) => normalizeMonth(p.mensilitaSaldata));
  }, [pagamentiEffettivi]);

  // DEBUG: log mensilità pagate e disponibili
  console.log("[DEBUG] mensilitaPagate:", pagamentiEffettivi.map(p => p.mensilitaSaldata));
  console.log("[DEBUG] mensilitaDisponibili:", mensilitaDisponibili);

  // Spinner se manca la data di iscrizione in modifica
  const mancaDataIscrizione = isEditing && (!studenti[0] || !studenti[0].dataIscrizione);

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="custom-modal-pagamento">
      <Modal.Header closeButton style={{ border: "none", borderRadius: "16px 16px 0 0", background: "#f5f6fa" }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.35em", color: "#4f46e5", letterSpacing: 0.2 }}>
          {isEditing ? "✏️ Modifica Pagamento" : "➕ Aggiungi Pagamento"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#fff", borderRadius: "0 0 16px 16px", padding: "2.2rem 2.2rem 1.5rem 2.2rem" }}>
        {mancaDataIscrizione ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
            <Spinner animation="border" variant="primary" />
            <span className="ms-3">Caricamento dati studente...</span>
          </div>
        ) : (
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
                {[...studenti]
                  .sort((a, b) =>
                    `${a.nome} ${a.cognome}`.localeCompare(`${b.nome} ${b.cognome}`)
                  )
                  .map((studente) => (
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
              {mensilitaDisponibili.map((m) => {
                const pagata = mensilitaPagate.includes(normalizeMonth(m));
                // Se in modifica, la mensilità attuale deve essere selezionabile
                const isCurrent = isEditing && pagamentoSelezionato.mensilitaSaldata === m;
                return (
                  <option key={m} value={m} disabled={pagata && !isCurrent}>
                    {m} {pagata ? (isCurrent ? "✅ (attuale)" : "✅") : "⚠️"}
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
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalePagamento;
