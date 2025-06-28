// === pages/Home.jsx ===
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Welcome, {user?.username}</h1>
      <ChatBox />
    </div>
  );
};

export default Home;