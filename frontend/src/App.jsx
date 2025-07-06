// === App.jsx ===
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchUsers from './pages/SearchUsers';
import FriendRequests from './pages/FriendRequests';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<SearchUsers />} />
            <Route path="/requests" element={<FriendRequests />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;