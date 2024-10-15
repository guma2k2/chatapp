import React, { useState, useEffect } from 'react';
import './App.css';
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
function App() {
  
  const [publicChats, setPublicChats] = useState([]);
  const [conservation, setConservation] = useState(1);
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: ''
  });

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect = () => {
    let Sock = new SockJS('http://localhost:8080/ws');
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    console.log(stompClient);
    setUserData({ ...userData, "connected": true });
    setConservation(1); // Set your conversation ID here
    if (stompClient) {
      stompClient.subscribe(`/topic/conservation/${conservation}`, onMessageReceived);
      userJoin();
    }
  };

  const userJoin = () => {
    var chatMessage = {
      sender: userData.username,
      message: "joined",
      type: "JOIN"
    };
    stompClient.send(`/app/chat/${conservation}/add`, {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setPublicChats(prev => [...prev,payloadData]);
    console.log(payloadData);
  };

  const onError = (err) => {
    console.log(err);
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, "message": value });
  };

  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        sender: userData.username,
        message: userData.message,
        type: "SENDING"
      };
      console.log(chatMessage);
      stompClient.send(`/app/chat/${conservation}/sendMessage`, {}, JSON.stringify(chatMessage));
      // setPublicChats(prev => [...prev,chatMessage]); 
      setUserData({ ...userData, "message": "" });
    }
  };

  const handleUsername = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, "username": value });
  };

  const registerUser = () => {
    connect();
  };

  return (
    <div className="container">
      {userData.connected ?
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li>ChatRoom</li>
            </ul>
          </div>
          <div className="chat-content">
            <ul className="chat-messages">
              {publicChats.map((chat, index) => (
                <li className={`message ${chat.sender === userData.username && "self"}`} key={index}>
                  {chat.sender !== userData.username && <div className="avatar">{chat.sender}</div>}
                  <div className="message-data">{chat.message}</div>
                  {chat.sender === userData.username && <div className="avatar self">{chat.sender}</div>}
                </li>
              ))}
            </ul>

            <div className="send-message">
              <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
              <button type="button" className="send-button" onClick={sendValue}>send</button>
            </div>
          </div>
        </div>
        :
        <div className="register">
          <input
            id="user-name"
            placeholder="Enter your name"
            name="userName"
            value={userData.username}
            onChange={handleUsername}
            margin="normal"
          />
          <button type="button" onClick={registerUser}>
            connect
          </button>
        </div>}
    </div>
  );
}

export default App;
