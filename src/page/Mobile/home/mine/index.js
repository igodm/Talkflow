import React, { useState, useEffect } from "react";
import { List } from "antd-mobile";
import { Avatar, message, Button } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import axios from "axios";
import "./style.css";

const Mine = () => {
  const [requestList, setRequestList] = useState([]);
  const handleReaquesListURL = "http://www.talkflow.top:8080/handleAddRequest";
  const getRequestList = () => {
    const url = "http://www.talkflow.top:8080/getRequestList";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        console.log(res.data);
        setRequestList(res.data.requestList);
      });
  };

  const addFriendSocket = window.addFriendSocket;
  addFriendSocket.onmessage = res => {
    console.log(res.data);
    getRequestList();
  };

  const onAccept = uid => {
    const data = {
      type: "accept",
      fromId: uid,
      toId: sessionStorage.getItem("phone"),
    };
    axios.post(handleReaquesListURL, data).then(() => {
      getRequestList();
      message.success("已同意请求，你们已经好友了~");
    });

    addFriendSocket.send(
      JSON.stringify({
        fromId: sessionStorage.getItem("phone"),
        toId: uid,
        content: "Accepted",
      })
    );
  };

  const onRefuse = uid => {
    const data = {
      type: "refuse",
      fromId: uid,
      toId: sessionStorage.getItem("phone"),
    };
    axios.post(handleReaquesListURL, data).then(() => {
      getRequestList();
      message.error("已拒绝好友请求");
    });
  };
  useEffect(() => {
    getRequestList();
  }, []);
  return (
    <div className="request-list-item-container">
      {requestList.length !== 0 ? (
        <List>
          {requestList.map(item => (
            <List.Item
              key={item.uid}
              prefix={
                <Avatar
                  style={{ backgroundColor: "blue" }}
                  size="large"
                  shape="square"
                >
                  {item.nickname.substr(0, 5)}
                </Avatar>
              }
              description={item.uid}
            >
              {item.nickname}
              <Button
                type="primary"
                shape="circle"
                icon={<CheckOutlined />}
                style={{ float: "right" }}
                onClick={() => {
                  onAccept(item.uid);
                }}
              ></Button>
              <Button
                type="primary"
                shape="circle"
                style={{ float: "right", marginRight: "10px" }}
                icon={<CloseOutlined />}
                onClick={() => {
                  onRefuse(item.uid);
                }}
                danger
              ></Button>
            </List.Item>
          ))}
        </List>
      ) : (
        <h3 style={{ textAlign: "center", marginTop: "10px" }}>
          暂无好友添加请求~
        </h3>
      )}
    </div>
  );
};

export default Mine;
