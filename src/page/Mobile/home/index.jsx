import React, { useState, useEffect } from "react";
import { NavBar, TabBar } from "antd-mobile";
import {
  AppOutline,
  MessageOutline,
  UserOutline,
  SetOutline,
  UserAddOutline,
} from "antd-mobile-icons";
import Message from "./message";
import Moment from "./moment";
import Setting from "./setting";
import Mine from "./mine";
import axios from "axios";
import "./style.css";

const pageTitle = {
  message: "消息",
  setting: "设置",
  moment: "朋友圈",
  mine: "个人中心",
};

const Bottom = () => {
  const [currentPage, setCurrentPage] = useState("message");
  const [chatingList, setChatingList] = useState([]);
  const [user, setUser] = useState({});

  const setRouteActive = value => {
    setCurrentPage(value);
  };

  const getChatingList = () => {
    const url = "http://www.talkflow.top:8080/getChatinglist";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        console.log(res.data);
        setChatingList(res.data.chatingList);
      });
  };

  const getRequestList = () => {
    const url = "http://www.talkflow.top:8080/getRequestList";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        if (res.data.requestList.length !== 0) {
          const targetItems = document.querySelectorAll(".adm-tab-bar-item");
          console.log(targetItems);
          const element = document.createElement("DIV");
          element.className = "red-dot-mobile";
          targetItems[2].appendChild(element);
          targetItems[2].addEventListener("click", () => {
            targetItems[2].removeChild(element);
          });
        }
      });
  };

  const getUserInfo = () => {
    const url = "http://www.talkflow.top:8080/getInfo";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        const data = res.data.user[0];
        setUser(data);
      });
  };

  useEffect(() => {
    getChatingList();
    getRequestList();
    getUserInfo();
  }, []);

  const addFriendSocket = window.addFriendSocket;
  addFriendSocket.onmessage = res => {
    const receivedMessage = JSON.parse(res.data);
    console.log("received: ", receivedMessage.content);
    if (receivedMessage.content !== "Accepted") {
      const targetItems = document.querySelectorAll(".adm-tab-bar-item");
      const element = document.createElement("DIV");
      element.className = "red-dot-mobile";
      targetItems[2].appendChild(element);
      targetItems[2].addEventListener("click", () => {
        targetItems[2].removeChild(element);
      });
    }
  };

  const tabs = [
    {
      key: "message",
      title: "消息",
      icon: <MessageOutline />,
    },
    {
      key: "moment",
      title: "朋友圈",
      icon: <AppOutline />,
    },
    {
      key: "mine",
      title: "好友请求",
      icon: <UserAddOutline />,
    },
    {
      key: "setting",
      title: "设置",
      icon: <SetOutline />,
    },
  ];
  const renderPage = () => {
    if (currentPage === "message") {
      return (
        <Message
          chatingList={chatingList}
          getChatingList={getChatingList}
          user={user}
        />
      );
    } else if (currentPage === "moment") {
      return <Moment />;
    } else if (currentPage === "mine") {
      return <Mine />;
    } else {
      return <Setting getUserInfo={getUserInfo} />;
    }
  };

  return (
    <>
      <NavBar className="nav-bar" backArrow={false}>
        {pageTitle[currentPage]}
      </NavBar>
      {renderPage()}
      <div className="tab-bar-container">
        <TabBar onChange={value => setRouteActive(value)}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </>
  );
};

export default Bottom;
