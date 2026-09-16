import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import { enableSprintFlowPreview } from "./preview-api";
import "@/styles/styles.css";
import "@senler/ui/styles.css";
import { TeamPreviewContext } from "@/pages/(list_integration)/applications/TeamPreviewContext";
import participantAvatar from "./participant-avatar.png";
import { OrdProfilePreviewContext } from "@/pages/(list_integration)/ord/OrdProfilePreviewContext";

enableSprintFlowPreview();

const previewParams = new URLSearchParams(window.location.search);
const requestedPath = previewParams.get("path");
const requestedSprintId = previewParams.get("sprint");
const ordProfileScenario = previewParams.get("ord-profile");
const ordProfilePreview = ordProfileScenario === "production" ? null : {
  details: {
    foreign: !["new", "resident"].includes(ordProfileScenario ?? ""),
    paymentNumber: "DE89 3704 0044 0532 0130 00",
    country: "США",
    address: "Техас, Теннеси",
  },
  countries: ["США", "Германия", "Беларусь", "Казахстан", "Армения"],
  locked: ordProfileScenario === "locked",
};
const initialPath = requestedPath?.startsWith("/rooms/preview-room/")
  ? requestedPath
  : requestedSprintId
    ? `/rooms/preview-room/sprints/${requestedSprintId}`
    : "/rooms/preview-room/sprints";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TeamPreviewContext.Provider value={[
      { id: "demo-owner", name: "Алексей Попов", avatarUrl: participantAvatar, role: "owner", profileUrl: "https://vk.com/id10001" },
      { id: "demo-admin", name: "Сергей Морозов", avatarUrl: participantAvatar, role: "admin", profileUrl: "https://vk.com/id10002" },
      { id: "demo-editor", name: "Анастасия Бунова", avatarUrl: participantAvatar, role: "editor", profileUrl: "https://vk.com/id10003" },
      { id: "demo-viewer", name: "Юлия Манова", avatarUrl: participantAvatar, role: "viewer", profileUrl: "https://vk.com/id10004" },
    ]}>
      <OrdProfilePreviewContext.Provider value={ordProfilePreview}>
        <App initialPath={initialPath} />
      </OrdProfilePreviewContext.Provider>
    </TeamPreviewContext.Provider>
  </StrictMode>,
);
