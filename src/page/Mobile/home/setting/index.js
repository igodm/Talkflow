import React from "react";
import { Form, Upload, Button, message, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import "./style.css";

const Setting = props => {
  const onFinish = value => {
    console.log(value);
    const url = "http://www.talkflow.top:8080/uploadAvatar";
    const fileList = value.upload ? value.upload.fileList : [];

    if (fileList.length === 0) {
      message.warning("请上传一个头像");
      return;
    }

    const formData = new FormData();
    formData.append("uid", sessionStorage.getItem("phone"));
    for (const file of fileList) {
      formData.append("fileList", file.originFileObj);
    }
    axios.post(url, formData).then(res => {
      console.log(res.data);
      props.getUserInfo();
      message.success("更改成功！");
    });
  };

  const onChange = value => {
    console.log(value);
    const url = "http://www.talkflow.top:8080/setInfo";
    const nickName = value.nickname ? value.nickname : "";

    if (nickName.length === 0) {
      message.warning("昵称不可为空");
      return;
    }
    const data = {};
    data.nickName = nickName;
    data.uid = sessionStorage.getItem("phone");
    axios.post(url, data).then(res => {
      console.log(res.data);
      props.getUserInfo();
      message.success("更改成功！");
    });
  };

  const onSignChange = value => {
    console.log(value);
    const url = "http://www.talkflow.top:8080/setSign";
    const sign = value.sign ? value.sign : "";
    if (sign.length === 0) {
      message.warning("签名内容不可为空");
      return;
    }
    const data = { sign, uid: sessionStorage.getItem("phone") };
    axios.post(url, data).then(res => {
      console.log(res.data);
      props.getUserInfo();
      message.success("更改成功！");
    });
  };

  return (
    <div className="setting-container-mobile">
      <div className="avatar-setting-block-mobile">
        <div className="setting-title-mobile">更换头像</div>
        <Form onFinish={onFinish}>
          <Form.Item name="upload" style={{ textAlign: "center" }}>
            <Upload listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>点击上传照片</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              确认更改
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="nickname-setting-block-mobile">
        <div className="setting-title-mobile">换个昵称</div>
        <Form onFinish={onChange}>
          <Form.Item name="nickname">
            <Input placeholder="请输入一个昵称"></Input>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="sign-setting-block-mobile">
        <div className="setting-title-mobile">换个签名</div>
        <Form onFinish={onSignChange}>
          <Form.Item name="sign">
            <Input placeholder="请输入一个签名"></Input>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button type="primary" htmlType="submit">
              确认
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Setting;
