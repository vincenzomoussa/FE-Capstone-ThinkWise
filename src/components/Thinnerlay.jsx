import React from "react";
import { Spinner } from "react-bootstrap";

const Thinnerlay = ({ message = "" }) => {
  return (
    <div className="overlay-spinner d-flex flex-column justify-content-center align-items-center">
      <Spinner animation="border" role="status" className="text-success mb-2">
        <span className="visually-hidden">Caricamento...</span>
      </Spinner>
      {message && <p className="text-muted small">{message}</p>}
    </div>
  );
};

export default Thinnerlay;
