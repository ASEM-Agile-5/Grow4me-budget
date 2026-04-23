import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const LITE_URL =
  (import.meta.env.VITE_API_BASE_URL || "https://grow4me-backend-213305484430.us-central1.run.app/") + "lite/";

if (/Opera Mini/i.test(navigator.userAgent)) {
  window.location.replace(LITE_URL);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
