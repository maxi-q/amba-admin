import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SprintFlowPreview } from "./sprint-flow-preview";
import "@/styles/styles.css";
import "@senler/ui/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SprintFlowPreview />
  </StrictMode>,
);
