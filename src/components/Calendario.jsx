import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import moment from "moment";
import "moment/locale/it";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";

const Calendario = () => {
  const [settimana, setSettimana] = useState(moment());
  const [corsi, setCorsi] = useState([]);
  const [insegnanti, setInsegnanti] = useState([]);
  const [livelli, setLivelli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtroInsegnante, setFiltroInsegnante] = useState("");
  const [filtroLivello, setFiltroLivello] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCorsi();
    fetchInsegnanti();
    fetchLivelli();
  }, [settimana, filtroInsegnante, filtroLivello]);

  const fetchCorsi = async () => {
    setLoading(true);
    const giornoParam = "settimana";

    console.log("📅 Parametri invio API:", {
      giorno: giornoParam,
      insegnante: filtroInsegnante,
      livello: filtroLivello,
    });

    try {
      const response = await apiClient.get(`/calendario/corsi-programmati`, {
        params: {
          giorno: giornoParam,
          insegnante: filtroInsegnante,
          livello: filtroLivello,
        },
      });
      console.log("📦 Corsi ricevuti:", response.data);
      setCorsi(response.data || []);
    } catch (error) {
      console.error("❌ Errore nel recupero del calendario:", error);
      setError("⚠️ Nessun corso disponibile per questa settimana.");
      setCorsi([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsegnanti = async () => {
    try {
      const response = await apiClient.get("/insegnanti");
      setInsegnanti(response.data || []);
    } catch (error) {
      console.error("❌ Errore nel recupero degli insegnanti:", error);
    }
  };

  const fetchLivelli = async () => {
    try {
      const response = await apiClient.get("/livelli");
      setLivelli(response.data || []);
    } catch (error) {
      console.error("❌ Errore nel recupero dei livelli:", error);
      setLivelli([]);
    }
  };

  const cambiaSettimana = (direzione) => {
    setSettimana(settimana.clone().add(direzione, "weeks"));
  };

  const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

  const normalizza = (str) => str?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const generaPDF = () => {
    const calendario = document.getElementById("calendario-pdf");
    if (!calendario) return;

    html2canvas(calendario, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Calendario-${settimana.format("YYYY-MM-DD")}.pdf`);
    });
  };

  return (
    <>
      <ThinkBar />

      <div className="container pt-5 mt-5">
        <h2 className="text-center mb-4">📅 Calendario Corsi</h2>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">🎓 Seleziona Insegnante:</label>
            <select
              className="form-select"
              value={filtroInsegnante}
              onChange={(e) => setFiltroInsegnante(e.target.value)}
            >
              <option value="">Tutti</option>
              {insegnanti.map((insegnante) => (
                <option key={insegnante.id} value={insegnante.id}>
                  {insegnante.nome} {insegnante.cognome}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">📚 Seleziona Livello:</label>
            <select className="form-select" value={filtroLivello} onChange={(e) => setFiltroLivello(e.target.value)}>
              <option value="">Tutti</option>
              {livelli.map((livello) => (
                <option key={livello} value={livello}>
                  {livello}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-secondary w-100"
              onClick={() => {
                setFiltroInsegnante("");
                setFiltroLivello("");
              }}
            >
              🔄 Reset Filtri
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between mb-3">
          <button className="btn btn-outline-primary" onClick={() => cambiaSettimana(-1)}>
            ⬅️ Settimana Precedente
          </button>
          <h5 className="text-center fs-5 mt-3">
            {settimana.startOf("isoWeek").format("DD MMMM YYYY")} - {settimana.endOf("isoWeek").format("DD MMMM YYYY")}
          </h5>
          <button className="btn btn-outline-primary" onClick={() => cambiaSettimana(1)}>
            Settimana Successiva ➡️
          </button>
        </div>

        {loading ? (
          <Thinner message="Caricamento calendario..." />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive-wrapper">
            <table id="calendario-pdf" className="table table-bordered calendario-table">
              <thead>
                <tr>
                  <th>Ora</th>
                  {giorniSettimana.map((giorno) => (
                    <th key={giorno}>{giorno}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"].map(
                  (orario) => (
                    <tr key={orario}>
                      <td className="fw-bold align-middle text-center">{orario}</td>
                      {giorniSettimana.map((giorno) => {
                        const corsiInSlot = corsi.filter(
                          (c) => normalizza(c.giorno) === normalizza(giorno) && c.orario === orario
                        );
                        return (
                          <td key={giorno + orario}>
                            {corsiInSlot.length ? (
                              corsiInSlot.map((corso) => (
                                <div
                                  key={corso.corsoId}
                                  onClick={() => navigate(`/corsi/${corso.corsoId}`)}
                                  className={`calendario-cella-piena ${
                                    corso.tipoCorso?.toUpperCase().includes("PRIVATO")
                                      ? "corso-privato"
                                      : "corso-gruppo"
                                  }`}
                                >
                                  <strong>
                                    {corso.lingua} ({corso.tipoCorso})
                                  </strong>
                                  <span className={`badge-livello ${corso.livello}`}>🎯 {corso.livello}</span>
                                  <span>📆 {corso.frequenza}</span>
                                  <span>🏫 {corso.aula || "N/A"}</span>
                                  <span>👨‍🏫 {corso.insegnante || "N/A"}</span>
                                </div>
                              ))
                            ) : (
                              <div className="calendario-cella-vuota">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mb-3">
          <button className="btn btn-outline-success" onClick={generaPDF}>
            📄 Esporta Calendario in PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default Calendario;
