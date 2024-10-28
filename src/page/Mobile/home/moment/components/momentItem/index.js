import React from "react";
import { Avatar, Image, Button, Modal, Input, message } from "antd";
import {
  HeartOutlined,
  CommentOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { v4 as uniqueId } from "uuid";
import axios from "axios";
import moment from "moment";
import "./style.css";

const { confirm } = Modal;

const MomentItem = props => {
  const imgSet = props.momentData.img_set.split("|");

  const onComment = (content, id) => {
    const url = "https://www.talkflow.top:8080/setComment";
    const data = {
      id: uniqueId(),
      momentId: id,
      fromId: sessionStorage.getItem("phone"),
      commentContent: content,
      time: moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss"),
    };
    axios.post(url, data).then(res => {
      if (res.data.code === 200) {
        message.success("评论成功~");
      }
      props.getMomentList();
    });
  };

  const showCommentModal = value => {
    confirm({
      title: "留下你的评论......",
      icon: <CommentOutlined />,
      content: <Input id="comment"></Input>,
      okText: "发布",
      cancelText: "取消",
      onOk() {
        const element = document.getElementById("comment");
        const content = element.value;
        if (!content || content.length === 0) {
          message.warning("内容不可为空");
          return;
        }
        onComment(content, value);
      },
    });
  };

  const onLike = id => {
    for (const item of props.momentData.like) {
      if (item.from_id === sessionStorage.getItem("phone")) {
        message.info("老铁，你已经赞过了~");
        return;
      }
    }
    const url = "https://www.talkflow.top:8080/setMomentLike";
    const data = {
      id: uniqueId(),
      momentId: id,
      fromId: sessionStorage.getItem("phone"),
      time: moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss"),
    };
    axios.post(url, data).then(res => {
      if (res.data.code === 200) {
        message.success("赞！");
      }
      props.getMomentList();
    });
  };

  const deleteMoment = momentId => {
    const url = "https://www.talkflow.top:8080/deleteMoment";
    const data = { momentId };
    confirm({
      title: "操作确认",
      content: "确定要删除这个动态吗？",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        axios.post(url, data).then(res => {
          if (res.data.code === 200) {
            message.success("删除成功");
          }
          props.getMomentList();
        });
      },
    });
  };

  return (
    <div className="outer-item-container-mobile">
      <div className="momnet-item-container-mobile">
        <div className="avatar-container-mobile">
          <Avatar
            style={{ backgroundColor: "orange" }}
            size="large"
            shape="square"
            src={props.momentData.avatar}
          >
            {props.momentData.coment || props.momentData.nickname}
          </Avatar>
        </div>

        <div className="moment-content-container-mobile">
          <p>
            <a>{props.momentData.coment || props.momentData.nickname}</a>
          </p>
          <div className="moment-writing-container-mobile">
            {props.momentData.writing ? props.momentData.writing : ""}
          </div>
          <div className="image-set-container-mobile">
            {imgSet.map(item => (
              <Image width={90} src={item} />
            ))}
          </div>
        </div>
      </div>
      {props.momentData.like.length ? (
        <div
          className="like-container-mobile"
          style={{
            borderBottom: props.momentData.comment.length
              ? "1px solid #ddd"
              : "none",
          }}
        >
          {props.momentData.like.map(item => (
            <a style={{ color: "orange" }}>
              <HeartOutlined />
              &nbsp;
              {item.coment || item.nickname}
              {" 、"}
            </a>
          ))}
        </div>
      ) : null}
      {props.momentData.comment.length ? (
        <div className="comment-container-mobile">
          {props.momentData.comment.map(item => (
            <p>
              <a style={{ color: "green" }}>{item.coment || item.nickname}</a>:{" "}
              {item.comment_content}
            </p>
          ))}
        </div>
      ) : null}
      <p style={{ marginTop: "10px" }}>
        <Button
          style={{ float: "right" }}
          type="primary"
          icon={<HeartOutlined />}
          onClick={() => {
            onLike(props.momentData.moment_id);
          }}
        ></Button>

        <Button
          style={{ float: "right", marginRight: "5px" }}
          icon={<CommentOutlined />}
          onClick={() => {
            showCommentModal(props.momentData.moment_id);
          }}
        ></Button>

        {props.momentData.uid === sessionStorage.getItem("phone") ? (
          <Button
            style={{ float: "right", marginRight: "5px" }}
            icon={<DeleteOutlined />}
            onClick={() => {
              deleteMoment(props.momentData.moment_id);
            }}
          ></Button>
        ) : null}
      </p>
    </div>
  );
};

export default MomentItem;
