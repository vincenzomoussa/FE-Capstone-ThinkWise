import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Intercettore per aggiungere il token JWT a tutte le richieste API
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Recupera il token salvato
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Aggiunge il token nell'header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercettore per gestire errori di autenticazione
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("📌 Errore in risposta:", error.response);
    }
    if (error.response && error.response.status === 401) {
      console.warn("❌ Token scaduto o non valido. Disconnessione forzata.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Monitorare i cambiamenti in localStorage
const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  console.log(`📌 Modifica su localStorage: ${key} = ${value}`);
  originalSetItem.apply(this, arguments); // Continua con la funzione originale
  window.dispatchEvent(new Event("localStorageChange"));
};

// Monitorare quando viene rimosso un elemento
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function (key) {
  console.log(`📌 Rimosso da localStorage: ${key}`);
  originalRemoveItem.apply(this, arguments); // Continua con la funzione originale
  window.dispatchEvent(new Event("localStorageChange"));
};

export default apiClient;
