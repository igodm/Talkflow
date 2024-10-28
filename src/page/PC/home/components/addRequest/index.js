import React, { useState, useEffect } from "react";
import { List, Avatar, message, Button } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import axios from "axios";
import "./style.css";

const AddReaquest = () => {
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
      addFriendSocket.send(
        JSON.stringify({
          fromId: sessionStorage.getItem("phone"),
          toId: uid,
          content: "Accepted",
        })
      );
    });
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
    <div className="add-request-list">
      <div className="title-contianer">好友添加请求</div>
      <div className="add-request-list-container">
        <List
          dataSource={requestList}
          renderItem={item => (
            <List.Item style={{ padding: "10px 10px" }}>
              <List.Item.Meta
                style={{ padding: "0 10px" }}
                avatar={
                  <Avatar
                    style={{ backgroundColor: "blue" }}
                    size="large"
                    shape="square"
                  >
                    {item.nickname.substr(0, 5)}
                  </Avatar>
                }
                title={
                  <a className="add-request-list-item-title">{item.nickname}</a>
                }
                description={item.uid}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<CloseOutlined />}
                onClick={() => {
                  onRefuse(item.uid);
                }}
                danger
              ></Button>
              <Button
                type="primary"
                shape="circle"
                icon={<CheckOutlined />}
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  onAccept(item.uid);
                }}
              ></Button>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default AddReaquest;
