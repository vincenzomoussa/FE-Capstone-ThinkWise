import { useEffect, useState } from "react";
import apiClient from "../utils/apiClient";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ThinkBar from "./ThinkBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import it from "date-fns/locale/it";
import Thinner from "./Thinner";
import { Button } from "react-bootstrap";

registerLocale("it", it);

const Report = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insegnante, setInsegnante] = useState("tutti");
  const [listaInsegnanti, setListaInsegnanti] = useState([]);
  const [mode, setMode] = useState("mensile");
  const [showChart, setShowChart] = useState({ left: "pagamenti" });

  const anno = selectedDate.getFullYear();
  const mese = selectedDate.getMonth() + 1;
  const isTutti = !insegnante || insegnante === "tutti";

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint = "";

      if (!isTutti) {
        endpoint =
          mode === "annuale"
            ? `/report/insegnante?anno=${anno}&insegnanteId=${insegnante}`
            : `/report/insegnante?anno=${anno}&mese=${mese}&insegnanteId=${insegnante}`;
      } else {
        endpoint = mode === "annuale" ? `/report/annuale/${anno}` : `/report/mensile?anno=${anno}&mese=${mese}`;
      }

      const response = await apiClient.get(endpoint);
      setReport(response.data);
    } catch (error) {
      console.error("Errore nel recupero del report", error);
      setError("Errore nel caricamento del report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsegnanti = async () => {
    try {
      const response = await apiClient.get("/insegnanti");
      setListaInsegnanti(response.data);
    } catch (error) {
      console.error("Errore nel recupero degli insegnanti", error);
    }
  };

  const scaricaReportPdf = async () => {
    setLoading(true);
    try {
      const endpoint =
        mode === "annuale" ? `/report/annuale/pdf?anno=${anno}` : `/report/mensile/pdf?anno=${anno}&mese=${mese}`;
      const response = await apiClient.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${mode}_${anno}${mode === "mensile" ? "_" + mese : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Errore nel download del report", error);
      setError("Errore nel download del report.");
    } finally {
      setLoading(false);
    }
  };

  const scaricaOreInsegnante = async () => {
    if (isNaN(insegnante)) {
      setError("ID insegnante non valido.");
      return;
    }
    if (isTutti) {
      toast.error("Seleziona un insegnante prima di scaricare il report.");
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        mode === "annuale"
          ? `/report/insegnante/pdf?anno=${anno}&insegnanteId=${insegnante}`
          : `/report/insegnante/pdf?anno=${anno}&mese=${mese}&insegnanteId=${insegnante}`;
      const response = await apiClient.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_Insegnante_${mode}_${anno}${mode === "mensile" ? "_" + mese : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Errore nel download del report insegnante", error);
      setError("Errore nel download del report insegnante.");
    } finally {
      setLoading(false);
    }
  };

  const getNomeInsegnanteById = (id) => {
    if (!id || id === "tutti") return "Tutti gli insegnanti";
    const found = listaInsegnanti.find((ins) => ins.id.toString() === id.toString());
    return found ? `${found.nome.trim()} ${found.cognome.trim()}` : "";
  };

  const nomeSelezionato = getNomeInsegnanteById(insegnante);

  const oreData = report?.oreInsegnate || {};
  const data = isTutti
    ? Object.entries(oreData).map(([nome, ore]) => ({ nome, ore }))
    : Object.entries(oreData)
        .filter(([nome]) => nome.trim().toLowerCase() === nomeSelezionato.trim().toLowerCase())
        .map(([nome, ore]) => ({ nome, ore }));

  useEffect(() => {
    fetchReport();
  }, [anno, mese, mode, insegnante]);

  useEffect(() => {
    fetchInsegnanti();
  }, []);

  const COLORS = [
    "#6366f1", "#818cf8", "#a5b4fc", "#38bdf8", "#f472b6", "#facc15", "#22d3ee", "#f59e42"
  ];

  return (
    <>
      <ThinkBar />
      <div className="container pt-5 mt-5">
        <h2 className="text-center mb-4" style={{ color: '#6366f1', fontWeight: 700, letterSpacing: 0.5 }}>📊 Report {mode === "annuale" ? "Annuale" : "Mensile"}</h2>

        <div className="d-flex justify-content-center mb-4 gap-3 flex-wrap align-items-center report-filters-bar">
          <select className="form-select w-auto report-select" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="mensile">Mensile</option>
            <option value="annuale">Annuale</option>
          </select>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat={mode === "annuale" ? "yyyy" : "MMMM yyyy"}
            showYearPicker={mode === "annuale"}
            showMonthYearPicker={mode === "mensile"}
            locale="it"
            className="form-control text-center fw-bold report-select"
          />

          <select
            className="form-select w-auto report-select"
            value={insegnante}
            onChange={(e) => setInsegnante(Number(e.target.value))}
          >
            <option value="tutti">🎓 Tutti</option>
            {listaInsegnanti.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.nome} {ins.cognome}
              </option>
            ))}
          </select>

          <Button
            className="btn report-btn-primary"
            onClick={scaricaOreInsegnante}
            disabled={loading || isTutti}
          >
            {loading ? "Scaricamento..." : "📥 Report Insegnante"}
          </Button>

          <button className="btn report-btn-success" onClick={scaricaReportPdf} disabled={loading}>
            {loading ? "Scaricamento..." : "📥 Scarica PDF"}
          </button>
        </div>

        {!isTutti && (
          <div className="text-center mb-4">
            <h5 style={{ color: '#6366f1', fontWeight: 600 }}>📘 Insegnante selezionato: {nomeSelezionato}</h5>
          </div>
        )}

        {loading ? (
          <Thinner message="Caricamento report in corso..." />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : report ? (
          <>
            <div className="row mb-4 g-4">
              <div className="col-md-3">
                <div className="report-card text-center">
                  <h5>💰 Totale Entrate</h5>
                  <h2>€ {(report.totaleEntrate ?? 0).toFixed(2)}</h2>
                </div>
              </div>
              <div className="col-md-3">
                <div className="report-card text-center">
                  <h5>📉 Totale Uscite</h5>
                  <h2>€ {(report.totaleUscite ?? 0).toFixed(2)}</h2>
                </div>
              </div>
              <div className="col-md-3">
                <div className="report-card text-center">
                  <h5>🕒 Ore Insegnate</h5>
                  <h2>
                    {!isTutti ? data.reduce((acc, curr) => acc + curr.ore, 0) : report.totaleOreInsegnate ?? 0} ore
                  </h2>
                </div>
              </div>
              <div className="col-md-3">
                <div
                  className={`report-card text-center ${report.bilancio >= 0 ? "report-card-success" : "report-card-danger"}`}
                >
                  <h5>📊 Bilancio</h5>
                  <h2>€ {(report.bilancio ?? 0).toFixed(2)}</h2>
                </div>
              </div>
            </div>

            {(report.pagamentiRicevuti && Object.keys(report.pagamentiRicevuti).length > 0) ||
            (report.speseRegistrate && Object.keys(report.speseRegistrate).length > 0) ? (
              <div className="container mt-5">
                <div className="text-center mb-3">
                  <Button
                    variant={showChart.left === "pagamenti" ? "primary" : "outline-primary"}
                    className={`report-btn-toggle me-2 ${showChart.left === "pagamenti" ? "active" : ""}`}
                    onClick={() => setShowChart({ left: "pagamenti" })}
                  >
                    💳 Pagamenti per Metodo
                  </Button>
                  <Button
                    variant={showChart.left === "spese" ? "primary" : "outline-primary"}
                    className={`report-btn-toggle ${showChart.left === "spese" ? "active" : ""}`}
                    onClick={() => setShowChart({ left: "spese" })}
                  >
                    🧾 Spese per Categoria
                  </Button>
                </div>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                  {showChart.left === "pagamenti" &&
                    report.pagamentiRicevuti &&
                    Object.keys(report.pagamentiRicevuti).length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(report.pagamentiRicevuti).map(([metodo, valore]) => ({
                              name: metodo,
                              value: valore,
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {Object.keys(report.pagamentiRicevuti).map((_, index) => (
                              <Cell key={`pay-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}

                  {showChart.left === "spese" &&
                    report.speseRegistrate &&
                    Object.keys(report.speseRegistrate).length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={Object.entries(report.speseRegistrate).map(([categoria, valore]) => ({
                              name: categoria,
                              value: valore,
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {Object.keys(report.speseRegistrate).map((_, index) => (
                              <Cell key={`exp-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                </div>
              </div>
            ) : null}

            {report?.oreInsegnate && (
              <div className="container grafico-final mt-5">
                <h4 className="mb-4 text-start" style={{ color: '#6366f1', fontWeight: 600 }}>🧑‍🏫 Ore Insegnate per Insegnante</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#a5b4fc" />
                    <XAxis dataKey="nome" stroke="#6366f1" />
                    <YAxis allowDecimals={false} stroke="#6366f1" />
                    <Tooltip />
                    <Bar dataKey="ore" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <p>Nessun dato disponibile per il periodo selezionato.</p>
        )}
      </div>
    </>
  );
};

export default Report;
