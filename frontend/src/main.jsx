import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ObraProvider } from "./context/ObraContext.jsx";
import "./styles/theme.css";
import "./styles/globals.css";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ObraProvider>
          <App />
        </ObraProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
