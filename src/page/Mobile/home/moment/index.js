import React, { useState, useEffect } from "react";
import MomentItem from "./components/momentItem";
import axios from "axios";
import { Spin, Button, Form, Input, Upload, message } from "antd";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import { Popup, NavBar } from "antd-mobile";
import { v4 as uniqueId } from "uuid";
import moment from "moment";
import "./style.css";

const Moment = () => {
  const [visible, setVisible] = useState(false);
  const [momentList, setMomentList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMomentList = () => {
    const url = "http://www.talkflow.top:8080/getMoment";
    axios
      .get(url, {
        params: {
          uid: sessionStorage.getItem("phone"),
        },
      })
      .then(res => {
        console.log(res.data, 888888);
        setMomentList(res.data.moment);
      });
  };

  const setPopup = value => {
    setVisible(value);
  };

  useEffect(() => {
    getMomentList();
  }, []);

  const onFinish = value => {
    console.log(value);
    console.log(fileList);
    const url = "http://www.talkflow.top:8080/uploadMoment";
    const fileList = value.upload ? value.upload.fileList : [];
    const writing = value.writing ? value.writing : "";

    if (fileList.length === 0 && writing.length === 0) {
      message.warning("发送内容不可为空");
      return;
    }

    const formData = new FormData();
    formData.append("writing", writing);
    formData.append("uid", sessionStorage.getItem("phone"));
    formData.append(
      "time",
      moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss")
    );
    formData.append("momentId", uniqueId());
    for (const file of fileList) {
      formData.append("fileList", file.originFileObj);
    }
    axios.post(url, formData).then(res => {
      setLoading(true);
      getMomentList();
      setVisible(false);
      setTimeout(() => {
        message.success("发表成功！");
        setLoading(false);
      }, 2000);
      console.log(res.data);
    });
  };

  return (
    <div className="moment-container-mobile">
      <Spin spinning={loading} tip="请稍候......">
        <p style={{ textAlign: "end" }}>
          <Button
            type="primary"
            icon={<CameraOutlined />}
            size="large"
            style={{ marginRight: "10px" }}
            onClick={() => {
              setPopup(true);
            }}
          />
        </p>
        {momentList.map(item => (
          <MomentItem momentData={item} getMomentList={getMomentList} />
        ))}
      </Spin>
      <Popup visible={visible} position="right" bodyStyle={{ width: "100vw" }}>
        <NavBar
          className="nav-bar"
          back="返回"
          onBack={() => {
            setPopup(false);
          }}
        ></NavBar>
        <div className="upload-container-mobile">
          <Form onFinish={onFinish}>
            <Form.Item name="writing">
              <Input.TextArea placeholder="想说点儿什么......?" />
            </Form.Item>
            <Form.Item name="upload" style={{ textAlign: "center" }}>
              <Upload listType="picture" maxCount={9}>
                <Button icon={<UploadOutlined />}>点击上传照片</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <p style={{ textAlign: "center" }}>
                <Button type="primary" htmlType="submit">
                  发表动态
                </Button>
              </p>
            </Form.Item>
          </Form>
        </div>
      </Popup>
    </div>
  );
};

export default Moment;
