import React, { useState, useEffect } from "react";
import SideNavyBar from "./components/sideNavyBar";
import ChatingList from "./components/chatingList";
import MessageBoard from "./components/messageBoard";
import AddReaquest from "./components/addRequest";
import Setting from "./components/setting";
import Moment from "./components/moment";
import axios from "axios";
import "./style.css";

const Home = () => {
  const [currentChating, setCurrentChating] = useState({});
  const [user, setUser] = useState([]);
  const [currentComponent, setCurrentComponent] = useState("1"); // 侧边栏切换
  const [chatingList, setChatingList] = useState([]);

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
          const targetItems = document.querySelectorAll(".ant-menu-item");
          const element = document.createElement("DIV");
          element.className = "red-dot";
          targetItems[1].appendChild(element);
          targetItems[1].addEventListener("click", () => {
            targetItems[1].removeChild(element);
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

  // 获取好友聊天列表
  const getChatingList = () => {
    const url = "http://www.talkflow.top:8080/getChatinglist";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        setChatingList(res.data.chatingList);
        console.log(res.data.chatingList, 88888);
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
    getChatingList();

    if (receivedMessage.content !== "Accepted") {
      const targetItems = document.querySelectorAll(".ant-menu-item");
      const element = document.createElement("DIV");
      element.className = "red-dot";
      targetItems[1].appendChild(element);
      targetItems[1].addEventListener("click", () => {
        targetItems[1].removeChild(element);
      });
    }
  };

  const setCurrent = value => {
    setCurrentChating(value);
  };
  const changeComponent = key => {
    setCurrentComponent(key);
  };

  return (
    <div className="home-container">
      <SideNavyBar changeComponent={changeComponent} user={user} />
      {currentComponent === "1" ? (
        <>
          <ChatingList setCurrent={setCurrent} chatingList={chatingList} />
          <MessageBoard
            currentChating={currentChating}
            getChatingList={getChatingList}
            setCurrent={setCurrent}
            user={user}
          />
        </>
      ) : currentComponent === "2" ? (
        <AddReaquest />
      ) : currentComponent === "3" ? (
        <Moment></Moment>
      ) : (
        <Setting getUserInfo={getUserInfo}></Setting>
      )}
    </div>
  );
};

export default Home;
