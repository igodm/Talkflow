import Login from "/src/page/login/index.jsx";
import Register from "/src/page/register/index.tsx";
import Home from "/src/page/PC/home/index.jsx";
import React from "react";

import HomeMobile from "/src/page/Mobile/home/index.jsx";
import { Route, Routes, HashRouter } from "react-router-dom";
import MediaQuery from "react-responsive";
import { createMemoryHistory } from "history";
const history = createMemoryHistory();

window.socket = new WebSocket("wss://www.talkflow.top:3000");
window.socket.onopen = () => {
  console.log("websocket connected...");
  if (sessionStorage.getItem("phone")) {
    const data = {
      fromId: sessionStorage.getItem("phone"),
    };
    window.socket.send(JSON.stringify(data));
  }
};
window.socket.onclose = () => {
  console.log("websocket connection closed~");
};

window.addFriendSocket = new WebSocket("wss://www.talkflow.top:3001");
window.addFriendSocket.onopen = () => {
  console.log("addFriendSocket connected...");
  if (sessionStorage.getItem("phone")) {
    const request = {
      fromId: sessionStorage.getItem("phone"),
      content: "add request please~",
    };
    window.addFriendSocket.send(JSON.stringify(request));
  }
};

window.addFriendSocket.onclose = () => {
  console.log("addFriendSocket connection closed~");
};

class RouterConfig extends React.Component {
  render() {
    return (
      <>
        <MediaQuery query="(min-device-width:1224px)">
          <HashRouter location={history.location} history={history}>
            <Routes>
              <Route path="/" exact element={<Login history={history} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </HashRouter>
        </MediaQuery>

        <MediaQuery query="(max-device-width:1224px)">
          <HashRouter location={history.location} history={history}>
            <Routes>
              <Route path="/" exact element={<Login history={history} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<HomeMobile />} />
            </Routes>
          </HashRouter>
        </MediaQuery>
      </>
    );
  }
}
export default RouterConfig;
