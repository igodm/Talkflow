import React from "react";
import "./style.css";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { LockOutlined, PhoneOutlined } from "@ant-design/icons";

const Login = () => {
  const onLogin = values => {
    console.log("Received values of form: ", values);

    const url = "http://www.talkflow.top:8080/login";
    const tokenUrl = "http://www.talkflow.top:8080/getCommunicationToken";
    axios.post(url, values).then(res => {
      const result = res.data;
      if (result.code === 200) {
        message.success("登录成功");
        sessionStorage.setItem("phone", values.phone);

        const data = {
          fromId: sessionStorage.getItem("phone"),
        };
        window.socket.send(JSON.stringify(data));

        const request = {
          fromId: sessionStorage.getItem("phone"),
          content: "add request please~",
        };
        window.addFriendSocket.send(JSON.stringify(request));

        location.href = "#/home";

        axios
          .get(tokenUrl, {
            params: {
              uid: sessionStorage.getItem("phone"),
            },
          })
          .then(res => {
            const token = res.data.token;
            sessionStorage.setItem("token", token);
          });
      } else if (result.code === 300) {
        message.error("密码不正确，请再试一次");
      } else {
        message.warning("此用户未注册");
      }
    });
  };
  return (
    <>
      <div className="bubble-background"></div>
      <div className="bubble-background2"></div>
      <div className="bubble-background3"></div>
      <div className="bubble-background4"></div>

      <div className="home-page-header">
        <p
          style={{
            fontSize: "32px",
            height: "32px",
            lineHeight: "60px",
          }}
        >
          TalkFlow
        </p>
        <p
          style={{
            fontSize: "16px",
            height: "16px",
            lineHeight: "32px",
          }}
        >
          ——chat if you want
        </p>
      </div>
      <div className="login-card">
        <h1 className="login-card-title">Login</h1>
        <div className="form-container">
          <Form name="basic" autoComplete="off" onFinish={onLogin}>
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "请输入手机号哦" },
                {
                  max: 11,
                  message: "手机号长度为11位",
                },
                {
                  min: 11,
                  message: "手机号长度为11位",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: "gray" }} />}
                placeholder="手机号"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入您的密码" },
                {
                  min: 8,
                  message: "密码至少要有8位",
                },
                {
                  max: 32,
                  message: "密码最长32位",
                },
                {
                  pattern: /^[^\s]*$/,
                  message: "密码不可以包含空格",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "gray" }} />}
                type="password"
                placeholder="TalkFlow密码"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
            <p>
              <span style={{ color: "gray" }}>还没有TalkFlow账号？</span>{" "}
              <a href="#/register">马上去注册！</a>
            </p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
