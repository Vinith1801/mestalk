// === components/ChatBox.jsx ===
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import axios from 'axios';

const ChatBox = ({ receiver }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const { socket } = useSocket();
  const { user, token } = useAuth();

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // ✅ Load message history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiver?._id || !token) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/with/${receiver._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [receiver, token]);

  useEffect(() => {
  if (!socket) return;

  const handleSeen = ({ messageId }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, seen: true } : msg
      )
    );
  };

  socket.on("message-seen", handleSeen);
  return () => socket.off("message-seen", handleSeen);
}, [socket]);


  // ✅ Real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.sender === receiver._id || msg.receiver === receiver._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => socket.off('receive-message', handleReceiveMessage);
  }, [socket, receiver]);

  // ✅ Typing indicator listener
  useEffect(() => {
    if (!socket || !receiver?._id || messages.length ===0 ) return;

    const unseenMsgIds = messages
    .filter((msg) => msg.receiver === user.id && !msg.seen)
    .map((msg) => msg._id);

     if (unseenMsgIds.length > 0) {
      socket.emit("mark-as-seen", {
        messageIds: unseenMsgIds,
        userId: user.id,
      });
    }

    const handleTyping = ({ senderId }) => {
      if (senderId === receiver._id) setTypingUser(senderId);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === receiver._id) setTypingUser(null);
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [messages, socket, receiver]);

  // ✅ Send message
  const sendMessage = () => {
    if (text.trim() && receiver?._id) {
      const msg = {
        senderId: user.id,
        receiverId: receiver._id,
        content: text
      };
      socket.emit('send-message', msg);
      setText('');
      setIsTyping(false);
      socket.emit("stop-typing", { senderId: user.id, receiverId: receiver._id });
    }
  };

  // ✅ Handle input typing
  const handleTyping = (e) => {
    const newText = e.target.value;
    setText(newText);

    if (!isTyping && receiver?._id) {
      socket.emit("typing", { senderId: user.id, receiverId: receiver._id });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { senderId: user.id, receiverId: receiver._id });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="border p-4 w-full max-w-xl bg-white rounded-md shadow">
      <h2 className="text-lg font-semibold mb-2">Chatting with {receiver?.username}</h2>
      {typingUser && (
        <p className="text-sm text-gray-500 italic mb-2">
          {receiver.username} is typing...
        </p>
      )}

      <div className="h-64 overflow-y-auto border mb-2 p-2 rounded">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            own={msg.sender === user.id || msg.senderId === user.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border px-2 py-1 rounded"
          value={text}
          onChange={handleTyping}
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
