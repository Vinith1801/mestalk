// === context/SocketContext.jsx ===
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  // Connect socket after user login
  useEffect(() => {
    if (user) {
      const s = io('http://localhost:5000');

      s.on('connect', () => {
        console.log('🔌 Socket connected:', s.id);
        s.emit('register-user', user.id);
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
        console.log('🔌 Socket disconnected');
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
