import React, { useState, useEffect } from "react";
import { Input, List, Avatar, message, Modal } from "antd";
import axios from "axios";
import "./style.css";

const { Search } = Input;

const ChatingList = props => {
  const [showModal, setShowModal] = useState(false);
  const [userIsSearched, setUserIsSearched] = useState({});

  const addFriendSocket = window.addFriendSocket;

  const onSearch = e => {
    const uid = e.target ? e.target.value : e;
    const url = "http://www.talkflow.top:8080/getInfo";
    axios
      .get(url, {
        params: {
          uid,
        },
      })
      .then(res => {
        const user = res.data.user;
        console.log(res.data);
        if (user.length === 0) {
          message.warning({ content: "此用户并未注册", duration: 2 });
        } else {
          setUserIsSearched(user);
          setShowModal(true);
        }
      });
  };

  const onOk = () => {
    const url = "http://www.talkflow.top:8080/addRequest";
    const param = {
      fromId: sessionStorage.getItem("phone"),
      toId: userIsSearched[0].uid,
    };
    axios.post(url, param).then(res => {
      message.success("好友请求已发送！");
      const request = {
        fromId: sessionStorage.getItem("phone"),
        toId: userIsSearched[0].uid,
        content: "add request please~",
      };
      addFriendSocket.send(JSON.stringify(request));
      setShowModal(false);
      console.log(res.data);
    });
  };

  const onCancel = () => {
    setShowModal(false);
  };
  const sertCurrent = value => {
    console.log(value);
    props.setCurrent(value);
  };

  useEffect(() => {
    const elements = document.querySelectorAll(".ant-list-item");
    for (const element of elements) {
      element.addEventListener(
        "mouseover",
        () => {
          element.classList.add("list-item-hover");
        },
        false
      );
      element.addEventListener(
        "mouseleave",
        () => {
          element.classList.remove("list-item-hover");
        },
        false
      );
      element.addEventListener(
        "click",
        () => {
          for (const el of elements) {
            if (el.classList.contains("list-item-active")) {
              el.classList.remove("list-item-active");
            }
          }
          element.classList.add("list-item-active");
        },
        false
      );
    }
  });

  return (
    <div className="chating-list">
      <div className="search-bar-container">
        <Search
          style={{ margin: "25px 0 10px 0" }}
          placeholder="搜索添加好友（手机号）"
          onSearch={onSearch}
          onPressEnter={onSearch}
        ></Search>
      </div>
      <div className="list-container">
        <List
          dataSource={props.chatingList}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                style={{ padding: "0 10px" }}
                onClick={() => {
                  sertCurrent(item);
                }}
                avatar={
                  <Avatar
                    style={{ backgroundColor: "blue" }}
                    size="large"
                    shape="square"
                    src={item.avatar}
                  >
                    {item.coment || item.nickname.substr(0, 5)}
                  </Avatar>
                }
                title={
                  <a className="list-item-title">
                    {item.coment || item.nickname}
                  </a>
                }
                description={`${item.sign || item.uid}`}
              />
            </List.Item>
          )}
        />
      </div>
      <Modal
        title="添加好友"
        visible={showModal}
        onOk={onOk}
        onCancel={onCancel}
        cancelText="取消"
        okText="发送好友申请"
      >
        <List
          dataSource={userIsSearched}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                style={{ padding: "0 10px" }}
                avatar={
                  <Avatar
                    style={{ backgroundColor: "blue" }}
                    size="large"
                    shape="square"
                    src={item.avatar}
                  >
                    {item.nickname.substr(0, 5)}
                  </Avatar>
                }
                title={<a className="list-item-title">{item.nickname}</a>}
                description={item.uid}
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default ChatingList;
