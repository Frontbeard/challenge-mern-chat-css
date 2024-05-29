import "./App.css";
import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const socket = io("https://challenge-react-chat-server.onrender.com/");

const lightColors = [
  "#FAD7A0",
  "#E6E6FA",
  "#D6EAF8",
  "#D5DBDB",
  "#A9DFBF",
  "#A3E4D7",
  "#AED6F1",
  "#F5B7B1",
  "#F9E79F",
  "#F5CBA7",
  "#FDEBD0",
  "#D2B4DE",
  "#D0ECE7",
  "#E5E7E9",
  "#CCD1D1",
  "#F9EBEA",
  "#F2F3F4",
  "#FADBD8",
  "#EAF2F8",
  "#FEF9E7",
];

const userColors = {};
let colorIndex = 0;

const getUserColor = (username) => {
  if (!userColors[username]) {
    userColors[username] = lightColors[colorIndex];
    colorIndex = (colorIndex + 1) % lightColors.length;
  }
  return userColors[username];
};

function App() {
  const [nickname, setNickname] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [storedMessages, setStoredMessages] = useState([]);
  const [firstTime, setFirstTime] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [isCurrentUserTyping, setIsCurrentUserTyping] = useState(false);
  const chatRef = useRef(null);
  const url = "https://challenge-react-chat-server.onrender.com/api/";

  useEffect(() => {
    const receivedMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    };

    socket.on("message", receivedMessage);

    socket.on("typing", (data) => {
      setIsTyping(data.isTyping);
      setTypingUser(data.user);
    });

    return () => {
      socket.off("message", receivedMessage);
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    if (!firstTime) {
      axios.get(url + "messages").then((res) => {
        setStoredMessages(res.data.messages);
        scrollToBottom();
      });
      setFirstTime(true);
    }
  }, [firstTime, url]);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (nickname !== "") {
      setDisabled(true);
      socket.emit("nickname", nickname);
    }
  };

  const handleDisconnect = () => {
    setNickname("");
    setDisabled(false);
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    setIsTyping(value !== "");
    setIsCurrentUserTyping(value !== "");
    socket.emit("typing", { isTyping: value !== "", user: nickname });
    if (!value) {
      socket.emit("typing", { isTyping: false, user: nickname });
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();

    if (nickname !== "") {
      socket.emit("message", message, nickname);

      const newMessage = {
        body: message,
        from: nickname,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");

      setIsTyping(false);
      setIsCurrentUserTyping(false);

      axios.post(url + "save", {
        message: message,
        from: nickname,
      });

      scrollToBottom();
    } else {
      alert("Si no te logeas con un nickname, no vas a poder mandar mensajes");
    }
  };

  return (
    <div className="full-height-container">
      <div className="header-container">
        <form onSubmit={handleNicknameSubmit} className="form-margin-bottom">
          <div className="form-group mb-3">
            <input
              type="text"
              className="input-nickname"
              id="nickname"
              placeholder="¡Escribí tu nickname deseado acá!"
              disabled={disabled}
              onChange={(e) => setNickname(e.target.value)}
              value={nickname}
              required
            />
            <button
              className="button-action"
              type="button"
              id="button-action"
              onClick={handleDisconnect}
            >
              Desloguear
            </button>
            <button
              className="button-action button-green"
              type="submit"
              id="btn-nickname"
              disabled={disabled}
            >
              Establecer
            </button>
          </div>
        </form>
      </div>

      <div className="chat-container" ref={chatRef}>
        <div className="chat-content">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.from === nickname ? "own-message" : ""
              }`}
              style={{
                backgroundColor:
                  message.from === nickname
                    ? "#cfefff"
                    : getUserColor(message.from),
              }}
            >
              <small className="message-text" style={{ color: "#000000" }}>
                {message.from}: {message.body}
              </small>
            </div>
          ))}
          {storedMessages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.from === nickname ? "own-message" : ""
              }`}
              style={{
                backgroundColor:
                  message.from === nickname
                    ? "#cfefff"
                    : getUserColor(message.from),
              }}
            >
              <small
                className={`message-text ${
                  message.from === nickname ? "" : "message-text-muted"
                }`}
                style={{ color: "#000000" }}
              >
                {message.from}: {message.message}
              </small>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-container">
        <form onSubmit={handleMessageSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="input-message"
              placeholder="Escribí tu mensaje..."
              onChange={handleTyping}
              value={message}
            />
            <div className="typing-indicator">
              {isTyping &&
                !isCurrentUserTyping &&
                `${typingUser ? typingUser : "Alguien"} está escribiendo...`}
            </div>
            <button className="submit-button" type="submit">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
