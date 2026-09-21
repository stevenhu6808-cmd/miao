import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

export function App() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error(
        "[global error]",
        event.error ?? event.message,
        event.filename,
        event.lineno,
        event.colno,
      );
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[unhandled promise rejection]", event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
