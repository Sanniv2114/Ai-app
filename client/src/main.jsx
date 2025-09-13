// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AppProvider } from "./context/AppContext.jsx"; // <-- use the correct export name

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider> {/* <-- wrap your app with AppProvider */}
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);

