import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  message,
  notification,
  Popover,
  Modal,
  Image,
} from "antd";
import moment from "moment";
import { v4 as uniqueId } from "uuid";
import {
  SendOutlined,
  SmileOutlined,
  WhatsAppOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  PhoneOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./style.css";
import ReceiveContentItem from "./components/ReceiveContentItem";
import SendContentItem from "./components/SendContentItem";
import AgoraRTC from "agora-rtc-sdk-ng";

const rtc = {
  localAudioTrack: null,
  client: null,
};
const options = {
  appId: "63203bdfee324c48934de0e3bcc4f29f",
  channel: "test",
};

let timer;
let timer1;
let element;

const { confirm } = Modal;

const emojieSet = [
  { entity: "😀", code: "0x1F600" },
  { entity: "😁", code: "0x1F601" },
  { entity: "😂", code: "0x1F602" },
  { entity: "😅", code: "0x1F605" },
  { entity: "😆", code: "0x1F606" },
  { entity: "😈", code: "0x1F608" },
  { entity: "😉", code: "0x1F609" },
  { entity: "😍", code: "0x1F60D" },
  { entity: "😎", code: "0x1F60E" },
  { entity: "😓", code: "0x1F613" },
  { entity: "😔", code: "0x1F614" },
  { entity: "😨", code: "0x1F628" },
  { entity: "😭", code: "0x1F62D" },
  { entity: "😥", code: "0x1F625" },
];

const emoticon = [
  "http://www.talkflow.top/666.jpeg",
  "http://www.talkflow.top/bieshuole.jpeg",
  "http://www.talkflow.top/cat.gif",
  "http://www.talkflow.top/dance.gif",
  "http://www.talkflow.top/guoliangzhao.jpeg",
  "http://www.talkflow.top/jump.gif",
  "http://www.talkflow.top/lasthug.jpeg",
  "http://www.talkflow.top/lookatme.jpeg",
  "http://www.talkflow.top/nalaibani.jpeg",
  "http://www.talkflow.top/nipangla.jpeg",
  "http://www.talkflow.top/shocked.jpeg",
  "http://www.talkflow.top/spin.gif",
];

const MessageBoard = props => {
  const [allMessage, setAllMessage] = useState([]);
  const [phoneCallFromUser, setPhoneCallFromUser] = useState({});
  const [visible, setVisible] = useState(false); // 接听/拒绝对话框
  const [visible1, setVisible1] = useState(false); // 呼叫对话框
  const [visible2, setVisible2] = useState(false); //通话状态栏

  const messageUrl = "http://www.talkflow.top:8080/getMessage";

  const socket = window.socket;
  socket.onmessage = msg => {
    const receivedMessage = JSON.parse(msg.data);

    if (receivedMessage.content) {
      const url = "http://www.talkflow.top:8080/searchUser";
      axios
        .get(url, {
          params: {
            friendId: receivedMessage.fromId,
            myId: sessionStorage.getItem("phone"),
          },
        })
        .then(res => {
          console.log(res.data);
          const data = res.data.user[0];
          if (receivedMessage.type === 1) {
            notification.open({
              message: data.coment || data.nickname,
              description: receivedMessage.content,
            });
            props.currentChating.uid &&
              setAllMessage([...allMessage, receivedMessage]);
          } else if (receivedMessage.type === 2) {
            notification.open({
              message: data.coment || data.nickname,
              description: "[表情~~~]",
            });
            props.currentChating.uid &&
              setAllMessage([...allMessage, receivedMessage]);
          } else if (receivedMessage.type === 3) {
            setPhoneCallFromUser(data);
            if (receivedMessage.action === "cancel") {
              stop();
              clearTimeout(timer);
              setVisible(false);
              setVisible1(false);
              setVisible2(false);
              message.error("对方已挂断");
              onLeave();
            } else if (receivedMessage.action === "accept") {
              stop();
              clearTimeout(timer);
              message.success("已接通");
              setVisible1(false);
              setVisible2(true);
            } else {
              play();
              setVisible(true);
              timer1 = setTimeout(() => {
                stop();
                setVisible(false);
              }, 30000);
            }
          }
        });
    }
    console.log("received: ", receivedMessage.content);
  };

  const preparePhoneCall = async () => {
    // Create an AgoraRTCClient object.
    rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    // Listen for the "user-published" event, from which you can get an AgoraRTCRemoteUser object.
    rtc.client.on("user-published", async (user, mediaType) => {
      // Subscribe to the remote user when the SDK triggers the "user-published" event
      await rtc.client.subscribe(user, mediaType);
      console.log("subscribe success");
      // If the remote user publishes an audio track.
      if (mediaType === "audio") {
        // Get the RemoteAudioTrack object in the AgoraRTCRemoteUser object.
        const remoteAudioTrack = user.audioTrack;
        // Play the remote audio track.
        remoteAudioTrack.play();
      }
      // Listen for the "user-unpublished" event
      rtc.client.on("user-unpublished", async user => {
        // Unsubscribe from the tracks of the remote user.
        await rtc.client.unsubscribe(user);
      });
    });
  };

  useEffect(() => {
    element = document.getElementById("audio");
    props.getChatingList();
    preparePhoneCall();
  }, []);

  useEffect(() => {
    axios
      .get(messageUrl, {
        params: {
          fromId: sessionStorage.getItem("phone"),
          toId: props.currentChating.uid,
        },
      })
      .then(res => {
        console.log(res.data);
        setAllMessage(res.data.allMessage);
      });
  }, [props.currentChating.uid]);

  useEffect(() => {
    const div = document.getElementById("message-flow");
    div.scrollTop = div.scrollHeight;
  });

  const play = () => {
    element.play();
  };

  const stop = () => {
    element.pause();
  };

  const sendMessage = () => {
    const url = "http://www.talkflow.top:8080/message/messageSend";
    const element = document.getElementById("message");
    console.log(element.value);
    if (element.value === "") {
      message.warning("消息不可为空");
      return;
    }
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 1;
    data.content = element.value;
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = props.currentChating.uid;

    socket.send(JSON.stringify(data));

    setTimeout(() => {
      element.value = "";
      element.innerText = "";
      element.focus();
    }, 0);

    setAllMessage([...allMessage, data]);

    axios.post(url, data).then(res => {
      console.log(res.data);
    });
  };

  const sendEmoticon = index => {
    console.log(emoticon[index]);
    const url = "http://www.talkflow.top:8080/message/messageSend";

    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 2;
    data.content = emoticon[index];
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = props.currentChating.uid;

    socket.send(JSON.stringify(data));

    setAllMessage([...allMessage, data]);

    axios.post(url, data).then(res => {
      console.log(res.data);
    });
  };

  const onDelete = () => {
    const url = "http://www.talkflow.top:8080/delete";
    const data = {
      fromId: sessionStorage.getItem("phone"),
      toId: props.currentChating.uid,
    };
    axios.post(url, data).then(res => {
      message.success("好友已删除");
      console.log(res.data);
      props.getChatingList();
      setAllMessage([]);
      props.setCurrent({});
    });
  };

  const onModify = coment => {
    if (coment.length === 0) {
      message.warning("备注不可为空");
      return;
    }
    const url = "http://www.talkflow.top:8080/modifyComent";
    const data = {
      fromId: sessionStorage.getItem("phone"),
      toId: props.currentChating.uid,
      coment,
    };
    axios.post(url, data).then(res => {
      message.success("修改成功~");
      console.log(res.data);
      props.getChatingList();
      props.setCurrent({});
    });
  };

  const showConfirm = () => {
    confirm({
      title: "确定要删除这位好友吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "是",
      cancelText: "否",
      onOk() {
        onDelete();
      },
    });
  };

  const showModifiy = () => {
    confirm({
      title: "请输入你的备注内容",
      icon: <FormOutlined />,
      content: <Input id="coment"></Input>,
      okText: "完成",
      cancelText: "取消",
      onOk() {
        const element = document.getElementById("coment");
        const coment = element.value;
        onModify(coment);
      },
    });
  };

  const onLeave = async () => {
    // Destroy the local audio track.
    rtc.localAudioTrack.close();
    // Leave the channel.
    await rtc.client.leave();
  };

  // 发送通话请求
  const onSendPhoneCall = async () => {
    play();
    setVisible1(true);
    timer = setTimeout(() => {
      stop();
      setVisible1(false);
      message.error("对方暂时无法接听");
      onLeave();
    }, 30000);
    // 发送Websocket请求
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 3;
    data.content = "calling";
    data.action = "calling";
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = props.currentChating.uid;

    socket.send(JSON.stringify(data));
    // Join an RTC channel.
    await rtc.client.join(
      options.appId,
      options.channel,
      // options.token,
      // options.uid
      sessionStorage.getItem("token"),
      sessionStorage.getItem("phone")
    );
    // Create a local audio track from the audio sampled by a microphone.
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Publish the local audio tracks to the RTC channel.
    await rtc.client.publish([rtc.localAudioTrack]);

    console.log("publish success!");
  };

  const handleAccept = async () => {
    stop();
    clearTimeout(timer1);
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 3;
    data.content = "accept";
    data.action = "accept";
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = phoneCallFromUser.uid;

    socket.send(JSON.stringify(data));
    // Join an RTC channel.
    await rtc.client.join(
      options.appId,
      options.channel,
      sessionStorage.getItem("token"),
      sessionStorage.getItem("phone")
    );
    // Create a local audio track from the audio sampled by a microphone.
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Publish the local audio tracks to the RTC channel.
    await rtc.client.publish([rtc.localAudioTrack]);

    console.log("publish success!");
    setVisible(false);
    setVisible2(true);
  };

  // 通话接收方挂断
  const handleReject = () => {
    stop();
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 3;
    data.content = "cancel";
    data.action = "cancel";
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = phoneCallFromUser.uid;
    socket.send(JSON.stringify(data));
    // onLeave();
    setVisible(false);
  };

  // 通话发送方取消
  const onCancel = () => {
    stop();
    clearTimeout(timer);
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 3;
    data.content = "cancel";
    data.action = "cancel";
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = props.currentChating.uid;
    socket.send(JSON.stringify(data));
    onLeave();
    setVisible1(false);
  };

  // 接通后挂断
  const onHangUp = () => {
    stop();
    const data = {}; // 发送到Message表
    data.id = uniqueId();
    data.type = 3;
    data.content = "cancel";
    data.action = "cancel";
    data.time = moment(new Date().getTime()).format("YYYY-MM-DD HH:mm:ss");
    data.fromId = sessionStorage.getItem("phone");
    data.toId = phoneCallFromUser.uid;
    socket.send(JSON.stringify(data));
    onLeave();
    setVisible1(false);
    setVisible2(false);
  };

  const handleKeydown = e => {
    if (e.keyCode === 13) {
      sendMessage();
    }
  };

  const setTextArea = value => {
    const element = document.getElementById("message");
    element.value += String.fromCodePoint(value);
  };

  return (
    <div className="message-board">
      <div className="message-title-bar">
        <div className="message-title">
          {props.currentChating.coment || props.currentChating.nickname}
        </div>
        {props.currentChating.uid ? (
          <Popover
            placement="bottom"
            content={
              <div>
                <p>
                  <Button onClick={showConfirm} type="primary" danger>
                    删除好友
                  </Button>
                </p>
                <p>
                  <Button onClick={showModifiy} type="primary">
                    好友备注
                  </Button>
                </p>
              </div>
            }
            trigger="click"
          >
            <Button
              style={{
                border: "none",
                backgroundColor: "transparent",
                boxShadow: "none",
                marginRight: "45px",
              }}
              shape="circle"
              icon={<EllipsisOutlined style={{ fontSize: "24px" }} />}
            ></Button>
          </Popover>
        ) : null}
      </div>

      <div id="message-flow" className="message-flow">
        {allMessage.length === 0 && !props.currentChating.uid ? (
          <h1 style={{ color: "#ccc", textAlign: "center" }}>
            have a nice day!
          </h1>
        ) : (
          allMessage.map(item => {
            if (
              item.message_from_id === props.currentChating.uid ||
              item.fromId === props.currentChating.uid
            ) {
              return (
                <ReceiveContentItem
                  type={item.message_type || item.type}
                  content={item.message_content || item.content}
                  avatar={props.currentChating.avatar}
                  title={
                    props.currentChating.coment || props.currentChating.nickname
                  }
                />
              );
            } else {
              return (
                <SendContentItem
                  type={item.message_type || item.type}
                  content={item.message_content || item.content}
                  avatar={props.user.avatar}
                  title={props.user.nickname}
                />
              );
            }
          })
        )}
      </div>
      {props.currentChating.uid ? (
        <div className="text-area-container">
          <Popover
            content={
              <div className="popover-container">
                <div className="emoji-container">
                  {emojieSet.map(item => (
                    <div
                      className="emoji-item"
                      onClick={() => {
                        setTextArea(item.code);
                      }}
                    >
                      {item.entity}
                    </div>
                  ))}
                </div>
                <div className="emoticon-container">
                  {emoticon.map((item, index) => (
                    <Image
                      preview={false}
                      width={100}
                      src={item}
                      index={index}
                      className="emoticon-item"
                      onClick={() => {
                        sendEmoticon(index);
                      }}
                    ></Image>
                  ))}
                </div>
              </div>
            }
            title="表情包"
          >
            <Button
              style={{
                border: "none",
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
              shape="circle"
              icon={<SmileOutlined style={{ fontSize: "24px" }} />}
              size="large"
            ></Button>
          </Popover>

          <Button
            style={{
              border: "none",
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            shape="circle"
            icon={<WhatsAppOutlined style={{ fontSize: "24px" }} />}
            size="large"
            onClick={onSendPhoneCall}
          ></Button>

          <textarea
            className="text-area"
            id="message"
            onKeyDown={handleKeydown}
            autoFocus
          ></textarea>
          <Button
            icon={<SendOutlined />}
            style={{ float: "right" }}
            type="primary"
            onClick={sendMessage}
          >
            发送（Enter）
          </Button>
        </div>
      ) : null}
      <Modal
        title={
          <WhatsAppOutlined style={{ fontSize: "36px", color: "green" }} />
        }
        visible={visible}
        onOk={handleAccept}
        onCancel={handleReject}
        footer={[
          <Button
            key="reject"
            icon={<CloseOutlined style={{ fontSize: "24px" }} />}
            type="primary"
            danger
            shape="circle"
            size="large"
            onClick={handleReject}
          ></Button>,
          <Button
            key="accept"
            type="primary"
            icon={<PhoneOutlined style={{ fontSize: "24px" }} />}
            shape="circle"
            size="large"
            onClick={handleAccept}
          ></Button>,
        ]}
      >
        <p style={{ fontSize: "16px" }}>
          来自{phoneCallFromUser.coment || phoneCallFromUser.nickname}
          的通话邀请......
        </p>
      </Modal>

      <Modal
        title={
          <WhatsAppOutlined style={{ fontSize: "36px", color: "green" }} />
        }
        visible={visible1}
        onCancel={onCancel}
        footer={[
          <Button
            key="reject"
            icon={<CloseOutlined style={{ fontSize: "24px" }} />}
            type="primary"
            danger
            shape="circle"
            size="large"
            onClick={onCancel}
          ></Button>,
        ]}
      >
        <p style={{ fontSize: "16px" }}>
          正在呼叫
          {props.currentChating.coment || props.currentChating.nickname}
          ......
        </p>
      </Modal>
      {visible2 ? (
        <div className="current-comunication">
          正在与 {phoneCallFromUser.coment || phoneCallFromUser.nickname}通话...
          <Button
            style={{ marginLeft: "20px" }}
            type="primary"
            onClick={onHangUp}
            danger
          >
            挂断
          </Button>
        </div>
      ) : null}
      <audio
        id="audio"
        src="https://www.talkflow.top/song.mp3"
        type="audio/mpeg"
      ></audio>
    </div>
  );
};

export default MessageBoard;
