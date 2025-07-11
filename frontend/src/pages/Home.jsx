// === pages/Home.jsx ===
import { useEffect, useState, useCallback } from 'react';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
import FriendsList from '../components/FriendsList';
import { useSocket } from '../context/SocketContext';

const Home = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // 🔁 Encapsulate the fetch logic so we can reuse it
  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/friends/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFriends(data);
      } else {
        console.warn("⚠️ Unexpected friend list format", data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch friends:", err);
    }
  }, []);

  // 🔁 Initial load
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // ✅ Refresh list in real-time
  useEffect(() => {
    if (!socket || !user) return;

    const handleFriendListUpdate = ({ userId }) => {
      if (userId === user.id) {
        fetchFriends();
      }
    };

    socket.on("friend-list-updated", handleFriendListUpdate);

    return () => {
      socket.off("friend-list-updated", handleFriendListUpdate);
    };
  }, [socket, user, fetchFriends]);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Welcome, {user?.username}</h1>
      <div className="flex gap-4">
        <div className="w-1/3">
          <FriendsList
            friends={friends}
            selectedFriend={selectedFriend}
            onSelect={setSelectedFriend}
          />
        </div>
        <div className="flex-1">
          {selectedFriend ? (
            <ChatBox receiver={selectedFriend} />
          ) : (
            <p>Select a friend to start chatting</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;