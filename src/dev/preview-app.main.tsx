import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { enableSprintFlowPreview } from "./preview-api";
import "@/styles/styles.css";
import "@senler/ui/styles.css";

enableSprintFlowPreview();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialPath="/rooms/preview-room/sprints" />
  </StrictMode>,
);
