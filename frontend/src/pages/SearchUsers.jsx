import { useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axios";
import { useSocket } from "../context/SocketContext";

const SearchUsers = () => {
  const { token, user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const { socket } = useSocket(); 

  // 🧠 Fetch logged-in user's friends once
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axiosInstance.get("/api/friends/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setFriendIds(res.data.map((f) => f._id));
        } else {
          console.error("❌ Unexpected response format for friends list:", res.data);
          setFriendIds([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch friends:", err);
        setFriendIds([]);
      }
    };

    fetchFriends();
  }, [token]);

  // 🔍 Debounced search function
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      const res = await axiosInstance.get(`/api/users/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    }
  };

  const debouncedSearch = debounce(handleSearch, 400);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  // 📤 Send friend request
  const sendRequest = async (targetId) => {
  try {
    await axiosInstance.post(`/api/friends/request/${targetId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSentRequests((prev) => [...prev, targetId]);

    // Emit real-time notification
    socket.emit("friend-request-sent", { from: user.id, to: targetId });
  } catch (err) {
    console.error("Failed to send request:", err.response?.data || err.message);
  }
};

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Search Users</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username or email"
        className="w-full p-2 border rounded mb-4"
      />

      {Array.isArray(results) && results.length === 0 && query.trim() && (
        <p className="text-gray-500">No users found for “{query}”</p>
      )}

      {Array.isArray(results) &&
        results.map((u) => {
          const isSelf = u._id === user.id;
          const isFriend = friendIds.includes(u._id);
          const isRequestSent = sentRequests.includes(u._id);

          return (
            <div key={u._id} className="flex items-center justify-between border-b py-2">
              <div>
                <p className="font-medium">{u.username}</p>
                {/* <p className="text-sm text-gray-600">{u.email}</p> */}
              </div>
              <div>
                {isSelf ? (
                  <span className="text-xs text-gray-400">You</span>
                ) : isFriend ? (
                  <span className="text-green-600 text-sm font-medium">✓ Friend</span>
                ) : isRequestSent ? (
                  <span className="text-blue-500 text-sm font-medium">Request Sent</span>
                ) : (
                  <button
                    onClick={() => sendRequest(u._id)}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
                  >
                    Send Request
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default SearchUsers;
