import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import tabLogo from "@/assets/logo/logo.png";

const ensureFavicon = () => {
  const existing = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  const link = existing ?? document.createElement("link");
  link.type = "image/png";
  link.rel = "icon";
  link.href = tabLogo;
  if (!existing) {
    document.head.appendChild(link);
  }
};

ensureFavicon();

createRoot(document.getElementById("root")!).render(<App />);
