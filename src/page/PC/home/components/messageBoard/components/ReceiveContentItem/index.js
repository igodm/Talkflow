import React from "react";
import { Avatar, Image } from "antd";
import "./style.css";

const ReceiveContentItem = props => {
  return (
    <div className="receive-content-item">
      <Avatar
        style={{
          backgroundColor: "blue",
          display: "inline-block",
          verticalAlign: "top",
        }}
        shape="square"
        size="large"
        src={props.avatar}
      >
        {props.title}
      </Avatar>
      <div className="received-mesage-bubble">
        {props.type === 1 ? (
          <span>{props.content}</span>
        ) : props.type === 2 ? (
          <Image width={100} height={100} src={props.content}></Image>
        ) : null}
      </div>
    </div>
  );
};

export default ReceiveContentItem;
