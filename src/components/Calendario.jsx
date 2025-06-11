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
  const [livelli, setLivelli] = useState([]);
  const [tuttiCorsi, setTuttiCorsi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroLivello, setFiltroLivello] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCorsi();
    fetchLivelli();
    fetchTuttiCorsi();
  }, [settimana, filtroLivello]);

  const fetchCorsi = async () => {
    setLoading(true);
    const giornoParam = "settimana";
    try {
      const response = await apiClient.get(`/calendario/corsi-programmati`, {
        params: {
          giorno: giornoParam,
          livello: filtroLivello,
        },
      });
      setCorsi(response.data || []);
    } catch (error) {
      setError("⚠️ Nessun corso disponibile per questa settimana.");
      setCorsi([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLivelli = async () => {
    try {
      const response = await apiClient.get("/livelli");
      setLivelli(response.data || []);
    } catch (error) {
      setLivelli([]);
    }
  };

  const fetchTuttiCorsi = async () => {
    try {
      const res = await apiClient.get("/corsi");
      setTuttiCorsi(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setTuttiCorsi([]);
    }
  };

  const cambiaSettimana = (direzione) => {
    setSettimana(settimana.clone().add(direzione, "weeks"));
  };

  const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

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
        {loading ? (
          <Thinner message="Caricamento calendario..." />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive-wrapper">
            <table
              id="calendario-pdf"
              className="table table-bordered calendario-table calendario-moderna calendario-moderna-fissa"
            >
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
                      <td className="fw-bold align-middle text-center calendario-orari-colonna">{orario}</td>
                      {giorniSettimana.map((giorno) => {
                        const corsiInSlot = corsi.filter(
                          (c) => normalizza(c.giorno) === normalizza(giorno) && c.orario === orario
                        );
                        return (
                          <td key={giorno + orario}>
                            {corsiInSlot.length ? (
                              corsiInSlot.map((corso) => {
                                const corsoDettaglio = tuttiCorsi.find((c) => c.id === corso.corsoId);
                                return (
                                  <div
                                    key={corso.corsoId}
                                    onClick={() => navigate(`/corsi/${corso.corsoId}`)}
                                    className="calendario-cella-piena calendario-cella-moderna"
                                  >
                                    <strong>{corsoDettaglio ? corsoDettaglio.nome : "Corso"}</strong>
                                    <span>📆 {corso.frequenza}</span>
                                    <span>🏫 {corso.aula || "N/A"}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="calendario-cella-vuota calendario-cella-vuota-center">-</div>
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
          <button className="btn btn-outline-success d-none" onClick={generaPDF}>
            📄 Esporta Calendario in PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default Calendario;
