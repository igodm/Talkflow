import React from "react";
import { Avatar, Image } from "antd";
import "./style.css";

const SendContentItem = props => {
  return (
    <div className="send-content-item-mobile">
      <Avatar
        style={{
          backgroundColor: "#f56a00",
          display: "inline-block",
          verticalAlign: "top",
          float: "right",
          clear: "both",
        }}
        shape="square"
        size="large"
        src={props.avatar}
      >
        {props.title}
      </Avatar>
      <div className="send-mesage-bubble-mobile">
        {props.type === 1 ? (
          <span>{props.content}</span>
        ) : props.type === 2 ? (
          <Image width={100} height={100} src={props.content}></Image>
        ) : null}
      </div>
    </div>
  );
};

export default SendContentItem;
