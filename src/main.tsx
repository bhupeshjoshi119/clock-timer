import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import ClockApp from "./components/ClockApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClockApp />
  </StrictMode>
);
