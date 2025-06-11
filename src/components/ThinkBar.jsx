import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useState } from "react";
import apiClient from "../utils/apiClient";

const ThinkBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAperto, setMenuAperto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = [
    { path: "/Overview", label: "ThinkBoard" },
    { path: "/studenti", label: "Studenti" },
    { path: "/corsi", label: "Corsi" },
    { path: "/insegnanti", label: "Insegnanti" },
    { path: "/aule", label: "Aule" },
    { path: "/spese", label: "Spese" },
    { path: "/pagamenti", label: "Pagamenti" },
    { path: "/calendario", label: "Calendario" },
    { path: "/report", label: "Report" },
  ];

  const handleGenerateData = async () => {
    try {
      setLoading(true);
      await apiClient.post("/generate-data");
      window.location.reload(); // Ricarica la pagina per aggiornare i dati ovunque
    } catch (err) {
      setError("Errore nella generazione dei dati. Riprova più tardi.");
      alert("Errore nella generazione dei dati. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="navbar fixed-top">
      <div className="container-fluid justify-content-between align-items-center" style={{ minHeight: 56 }}>
        <Link
          to="/dashboard"
          className="navbar-brand d-flex align-items-center"
          style={{ minWidth: 70, minHeight: 48, cursor: loading ? "wait" : "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            if (!loading) handleGenerateData();
          }}
          title="Clicca per generare dati di esempio"
        >
          <svg
            width="70"
            height="56"
            viewBox="0 0 140 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              height: 56,
              width: 70,
              objectFit: "contain",
              display: "block",
            }}
          >
            <text
              x="16"
              y="74"
              fontFamily="'Cinzel', serif"
              fontWeight="bold"
              fontSize="68"
              fill="#6366f1"
              letterSpacing="-6"
            >
              TW
            </text>
          </svg>
          <span style={{ minWidth: 24, display: "inline-block", marginLeft: 8, textAlign: "center" }}>
            {loading ? <span style={{ fontSize: 18, color: "#6366f1" }}>⏳</span> : null}
          </span>
        </Link>
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center nav-links-custom">
          {navLinks.map(({ path, icon, label }) => (
            <Link key={path} to={path} className={`nav-link ${isActive(path) ? "active-nav" : ""}`}>
              {icon} {label}
            </Link>
          ))}
        </div>
        <div className="d-none d-lg-flex align-items-center" style={{ minWidth: 120, justifyContent: "flex-end" }}>
          <button
            className="btn btn-logout-pill btn-sm d-flex align-items-center gap-2"
            onClick={handleLogout}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: "1.01rem",
              padding: "5px 16px",
              boxShadow: "0 2px 8px #ef444422",
              transition: "background 0.18s, color 0.18s",
              height: 36,
            }}
          >
            <span style={{ fontSize: "1.15em", marginRight: 5 }}>⏻</span>
            <span>Logout</span>
          </button>
        </div>
        <button className="navbar-toggler d-lg-none" type="button" onClick={() => setMenuAperto(!menuAperto)}>
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>

      {menuAperto && (
        <div className="mobile-menu d-lg-none">
          {navLinks.map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? "active-nav" : ""}`}
              onClick={() => setMenuAperto(false)}
            >
              {icon} {label}
            </Link>
          ))}
          <button className="btn btn-logout" onClick={handleLogout}>
            🔴 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default ThinkBar;
