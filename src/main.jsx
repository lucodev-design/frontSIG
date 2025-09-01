import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "../src/components/Login";
// import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Login />
  </StrictMode>
);
