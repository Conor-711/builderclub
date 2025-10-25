import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Favicon now loaded from public directory

const ensureFavicon = () => {
  const existing = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  const link = existing ?? document.createElement("link");
  link.type = "image/png";
  link.rel = "icon";
  link.href = "/logo.png";
  if (!existing) {
    document.head.appendChild(link);
  }
};

ensureFavicon();

createRoot(document.getElementById("root")!).render(<App />);
