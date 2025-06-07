import React from "react";
import { Spinner } from "react-bootstrap";

const FullThinner = ({ message = "Caricamento in corso..." }) => {
  return (
    <div className="fullscreen-spinner d-flex flex-column justify-content-center align-items-center">
      <Spinner animation="border" role="status" className="text-success mb-3">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="text-light">{message}</p>
    </div>
  );
};

export default FullThinner;
