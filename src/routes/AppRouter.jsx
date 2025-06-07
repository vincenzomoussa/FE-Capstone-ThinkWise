import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../components/Login";
import ThinkBoard from "../components/ThinkBoard";
import ListaCorsi from "../components/ListaCorsi";
import DettagliCorso from "../components/DettagliCorso";
import ListaStudenti from "../components/ListaStudenti";
import DettagliStudente from "../components/DettagliStudente";
import ListaSpese from "../components/ListaSpese";
import DettagliSpesa from "../components/DettagliSpesa";
import ListaAule from "../components/ListaAule";
import Calendario from "../components/Calendario";
import Report from "../components/Report";
import ProtectedRoute from "./ProtectedRoute";
import ListaInsegnanti from "../components/ListaInsegnanti";
import DettagliInsegnante from "../components/DettagliInsegnante";
import ListaPagamenti from "../components/ListaPagamenti";
import DettagliPagamento from "../components/DettagliPagamento";

const AppRouter = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/Overview" /> : <Login />} />

        <Route
          path="/Overview"
          element={
            <ProtectedRoute>
              <ThinkBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corsi"
          element={
            <ProtectedRoute>
              <ListaCorsi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corsi/:id"
          element={
            <ProtectedRoute>
              <DettagliCorso />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studenti"
          element={
            <ProtectedRoute>
              <ListaStudenti />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studenti/:id"
          element={
            <ProtectedRoute>
              <DettagliStudente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spese"
          element={
            <ProtectedRoute>
              <ListaSpese />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spese/:id"
          element={
            <ProtectedRoute>
              <DettagliSpesa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <ProtectedRoute>
              <Calendario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route
          path="/aule"
          element={
            <ProtectedRoute>
              <ListaAule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insegnanti"
          element={
            <ProtectedRoute>
              <ListaInsegnanti />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insegnanti/:id"
          element={
            <ProtectedRoute>
              <DettagliInsegnante />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pagamenti"
          element={
            <ProtectedRoute>
              <ListaPagamenti />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pagamenti/:id"
          element={
            <ProtectedRoute>
              <DettagliPagamento />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={token ? "/Overview" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
