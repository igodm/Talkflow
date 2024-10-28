import React, { useState, useEffect } from "react";
import { List, Popup, NavBar, Input, SearchBar, Modal } from "antd-mobile";
import {
  Button,
  Avatar,
  message,
  Popover,
  Image,
  Modal as ModalShow,
} from "antd";
import axios from "axios";
import moment from "moment";
import { v4 as uniqueId } from "uuid";
import {
  SmileOutlined,
  WhatsAppOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  CloseOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import ReceiveContentItem from "./components/ReceiveContentItem";
import SendContentItem from "./components/SendContentItem";
import "./style.css";
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

const Message = props => {
  const [phoneCallFromUser, setPhoneCallFromUser] = useState({});
  const [visible, setVisible] = useState(false);
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false); // 呼叫对话框
  const [visible3, setVisible3] = useState(false); // 接听/拒绝对话框
  const [visible4, setVisible4] = useState(false); // 通话状态栏
  const [currentChating, setCurrentChating] = useState({});
  const [allMessage, setAllMessage] = useState([]);

  const addFriendSocket = window.addFriendSocket;

  const onSearch = e => {
    const uid = e.target ? e.target.value : e;
    const url = "http://www.talkflow.top:8080/getInfo";
    axios
      .get(url, {
        params: {
          uid,
        },
      })
      .then(res => {
        const user = res.data.user;
        console.log(res.data);
        if (user.length === 0) {
          message.warning({ content: "此用户并未注册", duration: 2 });
        } else {
          Modal.confirm({
            content: (
              <List>
                {user.map(item => (
                  <List.Item
                    key={item.uid}
                    prefix={
                      <Avatar
                        style={{ backgroundColor: "blue" }}
                        size="large"
                        shape="square"
                        src={item.avatar}
                      >
                        {item.nickname.substr(0, 5)}
                      </Avatar>
                    }
                    description={item.uid}
                  >
                    {item.nickname}
                  </List.Item>
                ))}
              </List>
            ),
            confirmText: "发送好友请求",
            onConfirm: () => {
              const url = "http://www.talkflow.top:8080/addRequest";
              console.log(user);
              const param = {
                fromId: sessionStorage.getItem("phone"),
                toId: user[0].uid,
              };
              axios.post(url, param).then(res => {
                message.success("好友请求已发送！");
                const request = {
                  fromId: sessionStorage.getItem("phone"),
                  toId: user[0].uid,
                  content: "add request please~",
                };
                addFriendSocket.send(JSON.stringify(request));
                console.log(res.data);
              });
            },
          });
        }
      });
  };

  const setPopup = value => {
    setVisible(value);
  };

  const showEmoticon = value => {
    setVisible1(value);
  };

  const sertCurrent = value => {
    console.log(value);
    setCurrentChating(value);
  };

  const socket = window.socket;
  socket.onmessage = res => {
    const receivedMessage = JSON.parse(res.data);
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
          const data = res.data.user[0];
          if (receivedMessage.type === 1) {
            message.info(
              `${data.coment || data.nickname}: ${receivedMessage.content}`
            );
            currentChating.uid &&
              setAllMessage([...allMessage, receivedMessage]);
          } else if (receivedMessage.type === 2) {
            message.info(`${data.coment || data.nickname}: [表情~~~]`);
            currentChating.uid &&
              setAllMessage([...allMessage, receivedMessage]);
          } else if (receivedMessage.type === 3) {
            setPhoneCallFromUser(data);
            if (receivedMessage.action === "cancel") {
              stop();
              clearTimeout(timer);
              setVisible2(false);
              setVisible3(false);
              setVisible4(false);
              message.error("对方已挂断");
              onLeave();
            } else if (receivedMessage.action === "accept") {
              stop();
              clearTimeout(timer);
              message.success("已接通");
              setVisible2(false);
              setVisible4(true);
            } else {
              play();
              setVisible3(true);
              timer1 = setTimeout(() => {
                stop();
                setVisible3(false);
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

  const messageUrl = "http://www.talkflow.top:8080/getMessage";

  useEffect(() => {
    element = document.getElementById("audio");
    // 获取好友聊天列表
    props.getChatingList();
    preparePhoneCall();
  }, []);

  useEffect(() => {
    axios
      .get(messageUrl, {
        params: {
          fromId: sessionStorage.getItem("phone"),
          toId: currentChating.uid,
        },
      })
      .then(res => {
        console.log(res.data);
        setAllMessage(res.data.allMessage);
      });
  }, [currentChating]);

  useEffect(() => {
    const div = document.getElementById("message");
    if (div) {
      div.scrollTop = div.scrollHeight;
    }
  });

  const play = () => {
    element.play();
  };

  const stop = () => {
    element.pause();
  };

  const sendMessage = () => {
    const url = "http://www.talkflow.top:8080/message/messageSend";
    const element = document.getElementById("message-mobile");
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
    data.toId = currentChating.uid;

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
    data.toId = currentChating.uid;

    socket.send(JSON.stringify(data));

    setAllMessage([...allMessage, data]);

    axios.post(url, data).then(res => {
      console.log(res.data);
      showEmoticon(false);
    });
  };

  const onDelete = () => {
    const url = "http://www.talkflow.top:8080/delete";
    const data = {
      fromId: sessionStorage.getItem("phone"),
      toId: currentChating.uid,
    };
    axios.post(url, data).then(res => {
      setVisible(false);
      message.success("好友已删除");
      console.log(res.data);
      props.getChatingList();
      setAllMessage([]);
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
      toId: currentChating.uid,
      coment,
    };
    axios.post(url, data).then(res => {
      setVisible(false);
      message.success("修改成功~");
      console.log(res.data);
      props.getChatingList();
    });
  };

  const showConfirm = () => {
    Modal.confirm({
      title: "确定要删除这位好友吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "是",
      cancelText: "否",
      onConfirm() {
        onDelete();
      },
    });
  };

  const showModifiy = () => {
    Modal.confirm({
      title: "请输入你的备注内容",
      icon: <FormOutlined />,
      content: <Input style={{ border: "1px solid #ddd" }} id="coment"></Input>,
      confirmText: "完成",
      cancelText: "取消",
      onConfirm() {
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
    setVisible2(true);
    timer = setTimeout(() => {
      stop();
      setVisible2(false);
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
    data.toId = currentChating.uid;

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
    setVisible3(false); // 关闭接受/拒绝对话框
    setVisible4(true); // 显示通话状态栏
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
    setVisible3(false); // 关闭呼叫对话框
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
    data.toId = currentChating.uid;
    socket.send(JSON.stringify(data));
    onLeave();
    setVisible2(false); // 关闭呼叫对话框
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
    setVisible4(false); // 关闭通话状态栏
  };

  const handleKeydown = e => {
    if (e.keyCode === 13) {
      sendMessage();
    }
  };

  const setTextArea = value => {
    const element = document.getElementById("message-mobile");
    element.value += String.fromCodePoint(value);
    setVisible1(false);
  };

  return (
    <div className="list-item-container">
      <SearchBar
        onSearch={onSearch}
        placeholder="搜索添加好友（手机号）"
        style={{ "--background": "#ffffff" }}
      ></SearchBar>
      <List>
        {props.chatingList.map(item => (
          <List.Item
            onClick={() => {
              sertCurrent(item);
              setPopup(true);
            }}
            key={item.name}
            prefix={
              <Avatar
                style={{ backgroundColor: "blue" }}
                size="large"
                shape="square"
                src={item.avatar}
              >
                {item.coment || item.nickname.substr(0, 5)}
              </Avatar>
            }
            description={`${item.uid}`}
          >
            {item.coment || item.nickname}
          </List.Item>
        ))}
      </List>

      <Popup visible={visible} position="right" bodyStyle={{ width: "100vw" }}>
        <NavBar
          className="nav-bar"
          back="返回"
          onBack={() => {
            setPopup(false);
          }}
        >
          {currentChating.coment || currentChating.nickname}
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
                position: "absolute",
                right: "0px",
              }}
              shape="circle"
              icon={<EllipsisOutlined style={{ fontSize: "24px" }} />}
            ></Button>
          </Popover>
        </NavBar>
        <div className="message-board-mobile">
          <div id="message" className="message-flow-mobile">
            {allMessage.map(item => {
              if (
                item.message_from_id === currentChating.uid ||
                item.fromId === currentChating.uid
              ) {
                return (
                  <ReceiveContentItem
                    type={item.message_type || item.type}
                    content={item.message_content || item.content}
                    avatar={currentChating.avatar}
                    title={currentChating.coment || currentChating.nickname}
                  />
                );
              } else {
                return (
                  <SendContentItem
                    type={item.message_type || item.type}
                    content={item.message_content || item.content}
                    avatar={props.user.avatar}
                    title={props.user.coment || props.user.nickname}
                  />
                );
              }
            })}
          </div>
          <div className="input-area">
            <textarea
              className="input-bar"
              id="message-mobile"
              onKeyDown={handleKeydown}
              autoFocus
            ></textarea>
            <Button
              style={{
                border: "none",
                backgroundColor: "transparent",
                boxShadow: "none",
              }}
              onClick={() => showEmoticon(true)}
              shape="circle"
              icon={<SmileOutlined style={{ fontSize: "24px" }} />}
              size="large"
            ></Button>

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
          </div>
        </div>
        <Popup
          visible={visible1}
          onMaskClick={() => showEmoticon(false)}
          position="bottom"
          bodyStyle={{ height: "30vh" }}
        >
          <div className="popup-container-mobile">
            <div className="emoji-container-mobile">
              {emojieSet.map(item => (
                <div
                  className="emoji-item-mobile"
                  onClick={() => {
                    setTextArea(item.code);
                  }}
                >
                  {item.entity}
                </div>
              ))}
            </div>

            <div className="emoticon-container-mobile">
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
        </Popup>
      </Popup>
      <ModalShow
        title={
          <WhatsAppOutlined style={{ fontSize: "36px", color: "green" }} />
        }
        visible={visible2}
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
          {currentChating.coment || currentChating.nickname}
          ......
        </p>
      </ModalShow>

      <ModalShow
        title={
          <WhatsAppOutlined style={{ fontSize: "36px", color: "green" }} />
        }
        visible={visible3}
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
      </ModalShow>
      {visible4 ? (
        <p className="current-comunication-mobile">
          <Button
            type="primary"
            onClick={onHangUp}
            danger
            shape="circle"
            size="large"
            icon={<PhoneOutlined style={{ fontSize: "24px" }} />}
          ></Button>
        </p>
      ) : null}
      <audio
        id="audio"
        src="https://www.talkflow.top/song.mp3"
        type="audio/mpeg"
      ></audio>
    </div>
  );
};

export default Message;
