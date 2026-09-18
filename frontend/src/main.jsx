import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import "./styles/index.css";
import "./styles/admin.css";

// No router library needed for one extra screen — visiting /admin
// (e.g. http://localhost:5173/admin) loads the tutorial builder instead
// of the customer-facing app.
const isAdmin = window.location.pathname.startsWith("/admin");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>{isAdmin ? <AdminApp /> : <App />}</LanguageProvider>
  </React.StrictMode>
);
