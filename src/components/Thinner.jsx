import React from "react";
import { Spinner } from "react-bootstrap";

const Thinner = ({ message = "Caricamento in corso..." }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner animation="border" role="status" className="mb-3 text-success">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default Thinner;
