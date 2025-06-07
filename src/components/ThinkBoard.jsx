import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import ThinkBar from "./ThinkBar";
import Thinner from "./Thinner";
import { motion } from "framer-motion";
import { Button } from "react-bootstrap";

// Palette moderna
const COLORS = {
  blu: "#3B82F6",
  bluChiaro: "#60A5FA",
  verde: "#10B981",
  verdeChiaro: "#34D399",
  rosso: "#EF4444",
  rossoChiaro: "#F87171",
  arancione: "#F59E42",
  arancioneChiaro: "#FBBF24",
  viola: "#8B5CF6",
  violaChiaro: "#A78BFA",
  grigio: "#F3F4F6",
  grigioScuro: "#374151",
};

const ThinkBoard = () => {
  const [stats, setStats] = useState({
    studenti: 0,
    corsi: 0,
    pagamenti: 0,
    insegnanti: 0,
    spese: 0,
  });
  const [dashboardAvvisi, setDashboardAvvisi] = useState([]);
  const [pagamentiMensili, setPagamentiMensili] = useState({
    labels: [],
    data: [],
  });
  const [oreInsegnateMensili, setOreInsegnateMensili] = useState({
    labels: [],
    data: [],
  });
  const [entrateUscite, setEntrateUscite] = useState({
    labels: [],
    entrate: [],
    uscite: [],
  });
  const [speseGenerali, setSpeseGenerali] = useState({
    labels: [],
    data: [],
  });
  const [studentiPerSpecializzazione, setStudentiPerSpecializzazione] = useState({
    labels: [],
    data: [],
  });
  const [problemi, setProblemi] = useState({
    studenti: false,
    corsi: false,
    pagamenti: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, avvisiRes, pagamentiRes, entrateUsciteRes, speseGeneraliRes, studentiRes] = await Promise.all([
        apiClient.get("/dashboard/stats"),
        apiClient.get("/dashboard/avvisi"),
        apiClient.get("/dashboard/pagamenti-mensili"),
        apiClient.get("/dashboard/entrate-uscite"),
        apiClient.get("/dashboard/spese-generali"),
        apiClient.get("/studenti?activeCoursesOnly=true"),
      ]);

      setStats(statsRes.data || { studenti: 0, corsi: 0, pagamenti: 0, insegnanti: 0, spese: 0 });
      setDashboardAvvisi(avvisiRes.data || []);

      // Identificazione problemi
      const problemiTemp = {
        studenti: false,
        corsi: false,
        pagamenti: false,
      };

      (avvisiRes.data || []).forEach((avviso) => {
        const msg = avviso.messaggio.toLowerCase();
        if (msg.includes("studente") || msg.includes("studenti")) {
          problemiTemp.studenti = true;
        }
        if (msg.includes("corso") || msg.includes("corsi")) {
          problemiTemp.corsi = true;
        }
        if (msg.includes("pagamento") || msg.includes("pagamenti")) {
          problemiTemp.pagamenti = true;
        }
      });

      setProblemi(problemiTemp);

      setPagamentiMensili({
        labels: pagamentiRes.data?.mesi || [],
        data: pagamentiRes.data?.importi || [],
      });

      setEntrateUscite({
        labels: entrateUsciteRes.data?.mesi || [],
        entrate: entrateUsciteRes.data?.entrate || [],
        uscite: entrateUsciteRes.data?.uscite || [],
      });

      setSpeseGenerali({
        labels: (speseGeneraliRes.data?.categorie || []).map(formatCategoryName).map(formatMultiLineLabel),
        data: speseGeneraliRes.data?.importi || [],
      });

      // Fetch ore insegnate per insegnante al mese
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // Mese è 0-indexed in JS
      const oreInsegnateRes = await apiClient.get(
        `/report/ore-insegnate-mensili?anno=${currentYear}&mese=${currentMonth}`
      );
      setOreInsegnateMensili({
        labels: (oreInsegnateRes.data?.nomiInsegnanti || []).map(formatMultiLineLabel),
        data: oreInsegnateRes.data?.oreTotali || [],
      });

      // Logica per studenti per specializzazione
      const studentiData = studentiRes.data || [];
      const specializzazioniCounts = {};

      studentiData.forEach((student) => {
        if (student.preferenzaCorso) {
          // Assumendo che preferenzaCorso sia la specializzazione
          const specializations = Array.isArray(student.preferenzaCorso)
            ? student.preferenzaCorso
            : [student.preferenzaCorso];
          specializations.forEach((spec) => {
            specializzazioniCounts[spec] = (specializzazioniCounts[spec] || 0) + 1;
          });
        }
      });

      setStudentiPerSpecializzazione({
        labels: Object.keys(specializzazioniCounts).map(formatCategoryName).map(formatMultiLineLabel),
        data: Object.values(specializzazioniCounts),
      });
    } catch (err) {
      console.error("❌ Errore nel caricamento dati:", err);
      setError("Errore nel caricamento della dashboard. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getChartOptions = (titleText, isCurrency = true) => ({
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: titleText,
        font: {
          size: 18,
          family: "Inter",
        },
        color: "#111",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (isCurrency) {
              return `€ ${context.raw.toLocaleString("it-IT")}`;
            } else {
              return `${context.raw}`;
            }
          },
        },
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => (isCurrency ? `€ ${value.toLocaleString("it-IT")}` : value),
          color: "#666",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: { size: 10 },
          color: "#666",
          minRotation: 0,
          maxRotation: 0,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.03)",
        },
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
    },
  });

  const cardStyle = (hasProblem) => ({
    backgroundColor: hasProblem ? "#ffe6e6" : "#fff",
    border: `1px solid ${hasProblem ? "#ff4d4d" : "#e0e0e0"}`,
    color: "#111",
    cursor: "pointer",
  });

  const getAvvisiPer = (...keywords) => {
    return dashboardAvvisi.filter((avviso) => keywords.some((kw) => avviso.messaggio.toLowerCase().includes(kw)));
  };

  const handleGenerateData = async () => {
    try {
      setLoading(true);
      await apiClient.post("/generate-data");
      // Aggiornamento dei dati dopo la generazione
      await fetchData();
    } catch (err) {
      console.error("❌ Errore nella generazione dei dati:", err);
      setError("Errore nella generazione dei dati. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (name) => {
    if (!name) return "";
    let formattedName = name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Specific override for UX/UI Design
    if (formattedName === "Ux Ui Design") {
      formattedName = "UX/UI Design";
    }

    return formattedName;
  };

  const formatMultiLineLabel = (label) => {
    if (typeof label !== "string") return label; // Handle non-string labels if any
    const words = label.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 <= 15) {
        // Max 15 chars per line (adjust as needed)
        currentLine += (currentLine === "" ? "" : " ") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine !== "") {
      lines.push(currentLine);
    }
    return lines;
  };

  return (
    <>
      <ThinkBar />
      <div className="container mt-5 pt-5">
        {loading && <Thinner message="Caricamento dati dashboard..." />}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <div className="row mb-5">
            <div className="col-md-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(problemi.studenti)}
                onClick={() => {
                  const avvisiCorsi = getAvvisiPer("corso", "effettuato");
                  if (avvisiCorsi.length > 0) {
                    sessionStorage.setItem("dashboardAvvisi", JSON.stringify(avvisiCorsi));
                  }
                  console.log("📌 Avvisi per studenti:", avvisiCorsi);
                  navigate("/studenti");
                }}
              >
                <h5>📌 Studenti</h5>
                <h2>{stats.studenti}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(problemi.corsi)}
                onClick={() => {
                  const avvisiCorsi = getAvvisiPer("corsi");
                  if (avvisiCorsi.length > 0) {
                    sessionStorage.setItem("dashboardAvvisi", JSON.stringify(avvisiCorsi));
                  }

                  navigate("/corsi");
                }}
              >
                <h5>📌 Corsi Attivi</h5>
                <h2>{stats.corsi}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(problemi.pagamenti)}
                onClick={() => navigate("/report")}
              >
                <h5>💰 Totale Pagamenti</h5>
                <h2>
                  € {stats.pagamenti.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            <div className="col-md-4 mt-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(false)}
                onClick={() => navigate("/insegnanti")}
              >
                <h5>👨‍🏫 Insegnanti</h5>
                <h2>{stats.insegnanti}</h2>
              </div>
            </div>
            <div className="col-md-4 mt-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(false)}
                onClick={() => navigate("/calendario")}
              >
                <h5>🗓 Calendario</h5>
                <h2>Vedi</h2>
              </div>
            </div>
            <div className="col-md-4 mt-4">
              <div
                className="card p-4 text-center shadow-sm"
                style={cardStyle(false)}
                onClick={() => navigate("/spese")}
              >
                <h5>💸 Spese Totali</h5>
                <h2>€ {stats.spese.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="row justify-content-center">
            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <Bar
                  data={{
                    labels: oreInsegnateMensili.labels,
                    datasets: [
                      {
                        label: "Ore Insegnate",
                        data: oreInsegnateMensili.data,
                        backgroundColor: COLORS.blu,
                        borderColor: COLORS.blu,
                        hoverBackgroundColor: COLORS.bluChiaro,
                        borderWidth: 2,
                        borderRadius: 5,
                        maxBarThickness: 50,
                      },
                    ],
                  }}
                  options={getChartOptions("🕒 Ore totali di lezione ", false)}
                />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <Bar
                  data={{
                    labels: entrateUscite.labels,
                    datasets: [
                      {
                        label: "Entrate (€)",
                        data: entrateUscite.entrate,
                        backgroundColor: COLORS.verde,
                        borderColor: COLORS.verde,
                        hoverBackgroundColor: COLORS.verdeChiaro,
                        borderWidth: 2,
                        borderRadius: 5,
                        maxBarThickness: 50,
                      },
                      {
                        label: "Uscite (€)",
                        data: entrateUscite.uscite,
                        backgroundColor: COLORS.rosso,
                        borderColor: COLORS.rosso,
                        hoverBackgroundColor: COLORS.rossoChiaro,
                        borderWidth: 2,
                        borderRadius: 5,
                        maxBarThickness: 50,
                      },
                    ],
                  }}
                  options={getChartOptions("💰 Entrate/Uscite Istituto (€)", true)}
                />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <Bar
                  data={{
                    labels: speseGenerali.labels,
                    datasets: [
                      {
                        label: "Spese (€)",
                        data: speseGenerali.data,
                        backgroundColor: COLORS.arancione,
                        borderColor: COLORS.arancione,
                        hoverBackgroundColor: COLORS.arancioneChiaro,
                        borderWidth: 2,
                        borderRadius: 5,
                        maxBarThickness: 50,
                      },
                    ],
                  }}
                  options={getChartOptions("💸 Spese Generali (€)", true)}
                />
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card p-4 shadow-sm">
                <Bar
                  data={{
                    labels: studentiPerSpecializzazione.labels,
                    datasets: [
                      {
                        label: "N° Studenti",
                        data: studentiPerSpecializzazione.data,
                        backgroundColor: COLORS.viola,
                        borderColor: COLORS.viola,
                        hoverBackgroundColor: COLORS.violaChiaro,
                        borderWidth: 2,
                        borderRadius: 5,
                        maxBarThickness: 50,
                      },
                    ],
                  }}
                  options={getChartOptions("👨‍🎓 Studenti per Specializzazione", false)}
                />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="d-flex justify-content-center mb-3">
            <Button onClick={handleGenerateData} className="btn btn-info" disabled={loading}>
              ⚙️ Genera Dati di Esempio
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ThinkBoard;
