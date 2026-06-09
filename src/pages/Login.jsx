import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      navigate('/dashboard');
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-brand-black">
          ReyGom <span className="text-brand-red">CRM</span>
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red outline-none  text-black p-3 rounded font-bold"
            type="text" placeholder="Usuario" 
            onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
          />
          <input 
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-red outline-none text-black p-3 rounded font-bold"
            type="password" placeholder="Contraseña" 
            onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
          />
          <button 
            className="w-full bg-brand-red text-white p-3 rounded font-bold hover:bg-red-700 transition duration-300"
            type="submit"
          >
            INGRESAR AL SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;