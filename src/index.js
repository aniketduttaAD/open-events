import React from "react";
import ReactDOM from "react-dom/client";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.min.css";
import "react-calendar/dist/Calendar.css";
import "./app/layout/styles.css";
import App from "./app/layout/App";
import { Provider } from "react-redux";
import { configure } from "./app/store/configure";
import { BrowserRouter } from "react-router-dom";
import ScrollOnTop from "./app/layout/ScrollOnTop";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const store = configure();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ScrollOnTop />
      <App />
    </BrowserRouter>
  </Provider>
);

serviceWorkerRegistration.register();
reportWebVitals();
