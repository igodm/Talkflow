import React, { useState, useEffect } from "react";
import MomentItem from "./components/momentItem";
import {
  Button,
  Tooltip,
  Form,
  Upload,
  Input,
  message,
  Spin,
  Modal,
} from "antd";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import { v4 as uniqueId } from "uuid";
import axios from "axios";
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

  useEffect(() => {
    getMomentList();
  }, []);

  const onUpload = () => {
    visible ? setVisible(false) : setVisible(true);
  };

  const onFinish = value => {
    console.log(value);
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
    <>
      <div className="moment-left-block"></div>
      <div className="moment-container">
        <Spin spinning={loading} tip="请稍候......">
          {momentList.map(item => (
            <MomentItem getMomentList={getMomentList} momentData={item} />
          ))}
        </Spin>
      </div>
      <div className="moment-right-block">
        <Tooltip placement="left" title="发表动态">
          <Button
            type="primary"
            shape="circle"
            icon={<CameraOutlined />}
            size="large"
            style={{ marginLeft: "10px", marginTop: "10px" }}
            onClick={onUpload}
          />
        </Tooltip>

        {visible ? (
          <div className="upload-field-container">
            <div className="upload-items">
              <Form onFinish={onFinish}>
                <Form.Item name="writing">
                  <Input.TextArea placeholder="想说点儿什么......?" />
                </Form.Item>
                <Form.Item name="upload">
                  <Upload listType="picture" maxCount={9}>
                    <Button icon={<UploadOutlined />}>点击上传照片</Button>
                  </Upload>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    发表动态
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Moment;
