import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useState } from "react";

const ThinkBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAperto, setMenuAperto] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const navLinks = [
    { path: "/Overview", icon: "📊", label: "ThinkBoard" },
    { path: "/studenti", icon: "🎓", label: "Studenti" },
    { path: "/corsi", icon: "📚", label: "Corsi" },
    { path: "/insegnanti", icon: "👨‍🏫", label: "Insegnanti" },
    { path: "/aule", icon: "🏢", label: "Aule" },
    { path: "/spese", icon: "💰", label: "Spese" },
    { path: "/pagamenti", icon: "💳", label: "Pagamenti" },
    { path: "/calendario", icon: "📅", label: "Calendario" },
    { path: "/report", icon: "📄", label: "Report" },
  ];

  return (
    <nav className="navbar fixed-top">
      <div className="container-fluid justify-content-between align-items-center" style={{ minHeight: 56 }}>
        <Link
          to="/dashboard"
          className="navbar-brand d-flex align-items-center"
          style={{ minWidth: 70, minHeight: 48 }}
        >
          <img
            src="https://images.squarespace-cdn.com/content/v1/5e34540355a1d92e3ad13e6f/1591966507838-TLS3XL0LPBTRPZMDDBCW/LOGO_WEB1X1_png.png?format=1500w"
            alt="Dashboard"
            style={{
              height: 48,
              width: 56,
              objectFit: "contain",
              borderRadius: 10,
              background: "#ede9fe",
              boxShadow: "0 2px 8px #6366f122",
            }}
          />
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
