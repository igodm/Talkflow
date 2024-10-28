import React, { useState, useEffect } from "react";
import { Menu, Avatar } from "antd";
import {
  MessageOutlined,
  InstagramOutlined,
  SettingFilled,
  UserAddOutlined,
} from "@ant-design/icons";
import "./style.css";

const SideNavyBar = props => {
  const changeComponent = value => {
    props.changeComponent(value.key);
  };

  return (
    <Menu
      defaultSelectedKeys={["1"]}
      mode="inline"
      theme="dark"
      inlineCollapsed={true}
      style={{
        height: "100%",
        flex: "0 0 auto",
        width: "55px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Avatar
        style={{
          backgroundColor: "#f56a00",
          margin: "40px auto 30px auto",
          display: "block",
        }}
        size="large"
        shape="square"
        src={props.user.avatar}
      >
        {props.user.nickname && props.user.nickname.substr(0, 5)}
      </Avatar>
      <Menu.Item
        key="1"
        icon={
          <MessageOutlined style={{ fontSize: "24px", marginLeft: "-4px" }} />
        }
        onClick={changeComponent}
      >
        聊天
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={
          <UserAddOutlined style={{ fontSize: "24px", marginLeft: "-4px" }} />
        }
        onClick={changeComponent}
      >
        好友请求
      </Menu.Item>
      <Menu.Item
        style={{ marginBottom: "auto" }}
        key="3"
        icon={
          <InstagramOutlined style={{ fontSize: "24px", marginLeft: "-4px" }} />
        }
        onClick={changeComponent}
      >
        朋友圈
      </Menu.Item>
      <Menu.Item
        key="4"
        icon={
          <SettingFilled style={{ fontSize: "24px", marginLeft: "-4px" }} />
        }
        onClick={changeComponent}
      >
        设置
      </Menu.Item>
    </Menu>
  );
};

export default SideNavyBar;
