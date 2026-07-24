import "./styles/global.css"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./app"
import { AppProviders } from "@/providers/app-providers"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)

const showErrorOverlay = (error: unknown) => {
  const elementName = 'vite-error-overlay';
  const ErrorOverlay = customElements.get(elementName);

  // Prevent double overlay
  const isAlreadyAppear = document.body.contains(document.querySelector(elementName));

  if (!ErrorOverlay || isAlreadyAppear || import.meta.env.PROD) {
    return;
  }

  document.body.appendChild(new ErrorOverlay(error));
};

window.addEventListener('error', showErrorOverlay);
window.addEventListener('unhandledrejection', ({ reason }) => showErrorOverlay(reason));
