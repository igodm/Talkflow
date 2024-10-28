import React from "react";
import "./style.css";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import {
  LockOutlined,
  FormOutlined,
  PhoneOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const Register = () => {
  const onRegister = (values: any) => {
    const url = "http://www.talkflow.top:8080/register";
    axios.post(url, values).then(res => {
      console.log(res.data);
      message.success("注册成功！请登录");
      location.href = "#/login";
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

      <div className="register-card">
        <h1 className="register-card-title">Register</h1>
        <div className="form-container">
          <Form name="basic" autoComplete="off" onFinish={onRegister}>
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
                placeholder="请输入手机号"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "请输入密码哦",
                },
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
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "gray" }} />}
                type="password"
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "请再次输入密码哦",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致哦"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<FormOutlined style={{ color: "gray" }} />}
                type="password"
                placeholder="请再次输入密码"
              />
            </Form.Item>

            <Form.Item
              name="nickName"
              rules={[
                { required: true, message: "请填写一个昵称~" },
                {
                  max: 16,
                  message: "昵称最长为16位",
                },
              ]}
            >
              <Input
                prefix={<SmileOutlined style={{ color: "gray" }} />}
                placeholder="你希望的昵称"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                size="large"
              >
                注册
              </Button>
            </Form.Item>
            <p>
              <span style={{ color: "gray" }}>已经有TalkFlow账号？</span>{" "}
              <a href="#/login">去登录！</a>
            </p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Register;
