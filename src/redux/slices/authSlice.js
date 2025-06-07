import { createSlice } from "@reduxjs/toolkit";

// Stato iniziale
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null, // Recupera il token dal localStorage
  userId: null,
};

// Creazione dello slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Azione per il login
    loginSuccess: (state, action) => {
      state.token = action.payload.token; // Imposta il token
      state.userId = action.payload.userId; // Imposta l'ID utente
      state.user = { id: action.payload.userId }; // Imposta i dati dell'utente
      localStorage.setItem("token", action.payload.token); // Salva il token nel localStorage
    },
    // Azione per il logout
    logout: (state) => {
      state.token = null; // Resetta il token
      state.user = null; // Resetta i dati dell'utente
      state.userId = null; // Resetta l'ID utente
      localStorage.removeItem("token"); // Rimuove il token dal localStorage
    },
  },
});

// Esporta le azioni
export const { loginSuccess, logout } = authSlice.actions;

// Esporta il reducer
export default authSlice.reducer;
