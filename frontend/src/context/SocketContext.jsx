// === context/SocketContext.jsx ===
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketReady, setSocketReady] = useState(false);

  // Handle individual online/offline status
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    };

    const handleUserOffline = ({ userId, lastSeen }) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    };

    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);

    return () => {
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
    };
  }, [socket]);

  // Handle online users list
  useEffect(() => {
  if (!socket) return;

  const handleIncomingRequest = ({ from }) => {
    console.log("📩 New friend request from", from);
    // Optionally update request state/UI
  };

  const handleAccepted = ({ userId }) => {
    console.log("✅ Friend request accepted, updated friend list");
    // Could trigger a refresh of friends list here
  };

  const handleRejected = ({ to }) => {
    console.log("❌ Friend request rejected by", to);
  };

  socket.on("incoming-friend-request", handleIncomingRequest);
  socket.on("friend-list-updated", handleAccepted);
  socket.on("request-rejected", handleRejected);

  return () => {
    socket.off("incoming-friend-request", handleIncomingRequest);
    socket.off("friend-list-updated", handleAccepted);
    socket.off("request-rejected", handleRejected);
  };
}, [socket]);

  // Connect socket after user login
  useEffect(() => {
    if (user) {
      const s = io('http://localhost:5000');

      s.on('connect', () => {
        console.log('🔌 Socket connected:', s.id);
        s.emit('register-user', user.id);
        setSocketReady(true);
      });

      s.on('online-users', (userIds) => {
        if (Array.isArray(userIds)) {
          setOnlineUsers(userIds);
        } else {
          console.warn('⚠️ Invalid userIds format received:', userIds);
        }
      });

      setSocket(s);
      return () => {
        s.disconnect();
        setSocketReady(false);
        console.log('🔌 Socket disconnected');
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, socketReady }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
