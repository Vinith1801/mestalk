// === components/FriendsList.jsx ===
import { useSocket } from '../context/SocketContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const FriendsList = ({ friends, selectedFriend, onSelect }) => {
  const { onlineUsers } = useSocket();

  return (
    <div className="w-full border rounded-lg p-2 bg-white shadow-sm">
      <h2 className="font-semibold text-lg mb-3">Friends</h2>
      {friends.length === 0 ? (
        <p className="text-sm text-gray-500">No friends yet</p>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend) => {
            const isOnline = onlineUsers.includes(friend._id);
            const lastSeenText = friend.lastSeen
              ? dayjs(friend.lastSeen).fromNow()
              : 'Unknown';

            return (
              <li
                key={friend._id}
                onClick={() => onSelect(friend)}
                className={`cursor-pointer px-3 py-2 rounded-md ${
                  selectedFriend?._id === friend._id
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                      title={isOnline ? 'Online' : `Last seen ${lastSeenText}`}
                    ></div>
                    <span>{friend.username}</span>
                  </div>
                  {!isOnline && (
                    <span className="text-xs text-gray-500">
                      {lastSeenText}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
