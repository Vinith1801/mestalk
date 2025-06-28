// === components/MessageBubble.jsx ===
const MessageBubble = ({ msg, own }) => {
  return (
    <div className={`my-1 ${own ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block px-3 py-2 rounded ${own ? 'bg-blue-400 text-white' : 'bg-gray-200'}`}>
        {msg.content}
      </div>
    </div>
  );
};

export default MessageBubble;