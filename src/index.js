import "core-js/features/map";
import "core-js/features/set";
import fetch2 from './components/Fetch'
import React from "react";
import ReactDOM from "react-dom";
import bridge from "@vkontakte/vk-bridge";
import App from "./App";

fetch2('verify').then(data => {
  if (data.response === 'ok') {
    bridge.send("VKWebAppInit");
    ReactDOM.render(<App />, document.getElementById("root"));
    if (process.env.NODE_ENV === "development") {
      import("./eruda").then(({ default: eruda }) => {});
    }
  } else {
    ReactDOM.render("Неверная подпись параметров запуска.", document.getElementById("root"));
  }
})