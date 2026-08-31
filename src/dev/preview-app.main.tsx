import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { enableSprintFlowPreview } from "./preview-api";
import "@/styles/styles.css";
import "@senler/ui/styles.css";

enableSprintFlowPreview();

const previewParams = new URLSearchParams(window.location.search);
const requestedPath = previewParams.get("path");
const requestedSprintId = previewParams.get("sprint");
const initialPath = requestedPath?.startsWith("/rooms/preview-room/")
  ? requestedPath
  : requestedSprintId
    ? `/rooms/preview-room/sprints/${requestedSprintId}`
    : "/rooms/preview-room/sprints";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App initialPath={initialPath} />
  </StrictMode>,
);
