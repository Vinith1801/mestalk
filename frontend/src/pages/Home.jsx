// === pages/Home.jsx ===
import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await fetch('http://localhost:5000/api/friends/list', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setFriends(data);
    };
    fetchFriends();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Welcome, {user?.username}</h1>
      <div className="flex gap-4">
        <div className="w-1/3 border p-2">
          <h2 className="font-bold mb-2">Friends</h2>
          {friends.map((friend) => (
            <div
              key={friend._id}
              className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedFriend?._id === friend._id ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedFriend(friend)}
            >
              {friend.username}
            </div>
          ))}
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
