import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

/*
React.StrictMode --> renders every component twice to help you detect side effects and memory leaks
Explains why multiple API server requests are received for single page load
Only happens in development mode and will automatically disappear when you build in production.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
