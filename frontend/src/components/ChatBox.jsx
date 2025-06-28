// === components/ChatBox.jsx ===
import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socket = useSocket();
  const { user } = useAuth();
  const receiverId = '685e97ee8814cb811d3a8283'; // test with another user ID

  useEffect(() => {
    if (!socket) return;
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off('receive-message');
  }, [socket]);

  const sendMessage = () => {
    if (text.trim()) {
      const msg = { senderId: user.id, receiverId, content: text };
      socket.emit('send-message', msg);
      setMessages((prev) => [...prev, { ...msg, createdAt: new Date().toISOString() }]);
      setText('');
    }
  };

  return (
    <div className="border p-4 w-full max-w-xl">
      <div className="h-64 overflow-y-auto border mb-2 p-2">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} own={msg.senderId === user.id} />
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border px-2 py-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage} className="bg-green-500 text-white px-4">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
