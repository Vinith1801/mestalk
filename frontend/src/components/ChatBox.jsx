// === components/ChatBox.jsx ===
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import axios from 'axios';

const ChatBox = ({ receiver }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socket = useSocket();
  const { user, token } = useAuth(); // Ensure `token` is available in AuthContext

  // ✅ Load message history when receiver changes
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
        setMessages(res.data); // Load history
      } catch (err) {
        console.error("❌ Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [receiver, token]);

  // ✅ Real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      console.log('📥 Received:', msg);
      if (msg.sender === receiver._id || msg.receiver === receiver._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    return () => socket.off('receive-message', handleReceiveMessage);
  }, [socket, receiver]);

  // ✅ Sending a message
  const sendMessage = () => {
    if (text.trim() && receiver?._id) {
      const msg = { senderId: user.id, receiverId: receiver._id, content: text };
      socket.emit('send-message', msg);
      setMessages((prev) => [...prev, { ...msg, createdAt: new Date().toISOString() }]);
      setText('');
    }
  };

  return (
    <div className="border p-4 w-full max-w-xl">
      <h2 className="text-lg font-semibold mb-2">Chatting with {receiver?.username}</h2>

      <div className="h-64 overflow-y-auto border mb-2 p-2">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            own={msg.sender === user.id || msg.senderId === user.id} // support both
          />
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 border px-2 py-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
