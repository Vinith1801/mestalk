import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const FriendRequests = () => {
  const { token, user } = useAuth();
  const { socket, socketReady } = useSocket();
  const [requests, setRequests] = useState([]);

  // 🔁 Initial fetch
  useEffect(() => {
    if (!socketReady) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get("/api/friends/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to load friend requests", err);
      }
    };

    fetchRequests();
  }, [token, socketReady]);

  // ⚡ Listen for incoming real-time requests
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({ from }) => {
      // Prevent duplicate entries
      setRequests((prev) => {
        const alreadyExists = prev.some((r) => r.from._id === from._id);
        if (alreadyExists) return prev;
        return [
          ...prev,
          {
            _id: `temp-${Date.now()}`, // temporary ID until refresh
            from,
            status: "pending",
            createdAt: new Date(),
          },
        ];
      });
    };

    socket.on("incoming-friend-request", handleIncoming);

    return () => {
      socket.off("incoming-friend-request", handleIncoming);
    };
  }, [socket]);

  // ✅ Accept
  const acceptRequest = async (id) => {
    try {
      const req = requests.find((r) => r._id === id);
      if (!req) return;

      await axios.post(`/api/friends/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prev) => prev.filter((r) => r._id !== id));

      socket.emit("friend-request-accepted", {
        from: req.from._id,
        to: user.id,
      });
    } catch (err) {
      console.error("Accept failed:", err.response?.data || err.message);
    }
  };

  // ❌ Reject
  const rejectRequest = async (id) => {
    try {
      const req = requests.find((r) => r._id === id);
      if (!req) return;

      await axios.post(`/api/friends/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests((prev) => prev.filter((r) => r._id !== id));

      socket.emit("friend-request-rejected", {
        from: req.from._id,
        to: user.id,
      });
    } catch (err) {
      console.error("Reject failed:", err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Incoming Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="flex items-center justify-between border-b py-3"
          >
            <div>
              <p className="font-medium">{req.from.username}</p>
              {/* <p className="text-sm text-gray-600">{req.from.email}</p> */}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => acceptRequest(req._id)}
                className="bg-transparent text-green-600 border-2 border-green-300 px-3 py-1 rounded text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => rejectRequest(req._id)}
                className="bg-transparent text-red-600 px-3 py-1 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
