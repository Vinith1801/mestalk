// === components/MessageBubble.jsx ===
const MessageBubble = ({ msg, own }) => {
  return (
    <div className={`my-1 ${own ? 'text-right' : 'text-left'}`}>
      <div className={`inline-block px-3 py-2 rounded ${own ? 'bg-blue-400 text-white' : 'bg-gray-200'}`}>
        {msg.content}
        {own && msg.seen && (
          // <span className="text-xs text-green-500 ml-2">Seen</span>
          <span className="text-xs ml-2 text-white-500">✓✓</span>
        )}

      </div>
    </div>
  );
};

export default MessageBubble;