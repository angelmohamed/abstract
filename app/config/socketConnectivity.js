// import package
import { createContext } from "react";
import io from "socket.io-client";
import config from "./config";
// import store from "@/store/store";
// import lib
let connectionOptions = {
  transports: ["websocket"],
  cookie: false,
  forceNew: true,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 600,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  // parser,
};
const socket = io(config.backendURL, connectionOptions);

const subscribe = event => {
  socket.emit("subscribe", event);
};

const unsubscribe = event => {
  socket.emit("unsubscribe", event);
};

// socket.on("disconnect", reason => {
//   const { user } = store.getState().auth;
//   if (user && user._id) createSocketUser(user._id);
// });

const SocketContext = createContext({
  socket: socket,
});

export {
  socket,
  subscribe,
  unsubscribe,
  SocketContext,
};
