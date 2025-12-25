import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx";
import "./../index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AlertProvider } from "./context/AlertContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <AlertProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
    </AlertProvider>
  </React.StrictMode>
);
