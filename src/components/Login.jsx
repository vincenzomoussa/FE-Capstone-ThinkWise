import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice.js";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import FullThinner from "./FullThinner.jsx";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, userId } = response.data;
      if (!token || !userId) {
        setError("Errore nel login. Riprova.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      dispatch(loginSuccess({ token, userId }));
      navigate("/Overview");
    } catch (error) {
      setError("Email o password errati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("login-bg-split");
    return () => {
      document.body.classList.remove("login-bg-split");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-split-wrapper">
      <div className="login-split-illustration">
        {/* Slogan in alto a destra */}
        <div className="login-slogan-left">Gestisci la tua accademia con facilità</div>
        {/* Illustrazione stilizzata: libri, matita, grafico, nuvoletta */}
        <svg width="100%" height="100%" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Libri */}
          <rect x="40" y="260" width="120" height="30" rx="6" fill="#60a5fa" stroke="#6366f1" strokeWidth="3" />
          <rect x="60" y="230" width="100" height="30" rx="6" fill="#a78bfa" stroke="#6366f1" strokeWidth="3" />
          <rect x="80" y="200" width="80" height="30" rx="6" fill="#ffe066" stroke="#6366f1" strokeWidth="3" />
          {/* Matita */}

          {/* Grafico */}
          <rect x="60" y="120" width="30" height="60" rx="6" fill="#22c55e" stroke="#6366f1" strokeWidth="3" />
          <rect x="100" y="90" width="30" height="90" rx="6" fill="#3b82f6" stroke="#6366f1" strokeWidth="3" />
          <rect x="140" y="150" width="30" height="30" rx="6" fill="#ef4444" stroke="#6366f1" strokeWidth="3" />
          {/* Nuvoletta */}

          {/* Logo TW grande */}
          <text
            x="220"
            y="180"
            fontFamily="'Cinzel', serif"
            fontWeight="bold"
            fontSize="90"
            fill="#6366f1"
            letterSpacing="-6"
          >
            TW
          </text>
        </svg>
      </div>
      <div className="login-split-card-col ">
        {loading && <FullThinner message="Accesso in corso..." />}
        <div className="login-card-split login-card-rich">
          {/* Badge Admin */}
          <span className="login-badge-admin">Admin</span>
          <motion.div
            className="login-logo-modern"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: "none",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></motion.div>
          {/* Sottotitolo */}
          <div className="login-subtitle mt-3">Accedi al gestionale ThinkWise</div>
          {/* Divider colorato */}
          <div className="login-divider-color" />
          {/* Titolo + micro-illustrazione cappello laurea */}
          <div className="login-title-illu-row">
            <motion.h1
              className="login-title-modern"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ThinkWise
            </motion.h1>
            <span className="login-micro-illu">
              {/* Cappello laurea SVG */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="16,7 29,13 16,19 3,13 16,7" fill="#6366f1" />
                <rect x="15" y="19" width="2" height="7" rx="1" fill="#ffe066" />
                <circle cx="16" cy="27" r="2" fill="#fb923c" />
              </svg>
            </span>
          </div>
          {error && <div className="alert alert-danger login-alert-modern">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form-modern" autoComplete="off" noValidate>
            <div className="mb-3">
              <label className="form-label login-label-modern">Email</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-control login-input-modern login-input-withicon"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 position-relative">
              <label className="form-label login-label-modern">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control login-input-modern login-input-withicon pe-5"
                  placeholder="Inserisci la password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="login-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={0}
                  role="button"
                  aria-label="Mostra/Nascondi password"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="btn login-btn-modern w-100 d-flex justify-content-center align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Accesso...
                </>
              ) : (
                "Accedi"
              )}
            </button>
            {/* Link password dimenticata */}
          </form>
          {/* Footer mini */}
          <div className="login-mini-footer">© 2025 ThinkWise. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
