import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice.js";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import FullThinner from "./FullThinner.jsx";
import { Eye, EyeOff } from "lucide-react";
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
      console.error("❌ Errore login:", error);
      setError("Email o password errati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("login-background");
    return () => {
      document.body.classList.remove("login-background");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <>
      {loading && <FullThinner message="Accesso in corso..." />}

      <div
        id="login"
        className="login-page container d-flex flex-column flex-md-row justify-content-center align-items-center gap-5"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <motion.img
            src="https://images.squarespace-cdn.com/content/v1/5e34540355a1d92e3ad13e6f/1591966507838-TLS3XL0LPBTRPZMDDBCW/LOGO_WEB1X1_png.png?format=1500w"
            alt="Logo scuola"
            style={{ width: "150px", marginBottom: "0.2rem" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.h1
            className="text-black fw-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.4rem",
              marginTop: "-0.5rem",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ThinkWise
          </motion.h1>
        </div>

        <motion.div
          className="login-card w-100 p-3 p-md-4"
          style={{ maxWidth: "400px" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4 position-relative">
              <label className="form-label">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "38px", cursor: "pointer", color: "#ccc" }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
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
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
