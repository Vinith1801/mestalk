// === pages/Login.jsx ===
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.token) navigate('/home');
    else alert(res.message);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-20">
      <input className="border px-4 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="border px-4 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button className="bg-blue-500 text-white px-4 py-2" type="submit">Login</button>
    </form>
  );
};

export default Login;