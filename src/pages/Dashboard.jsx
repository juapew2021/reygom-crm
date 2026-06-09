import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/properties');
        setProperties(response.data);
      } catch (error) {
        console.error("Error al cargar propiedades", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-8 bg-brand-black text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard - <span className="text-brand-red">Admin</span></h1>
          <button 
            onClick={handleLogout}
            className="bg-brand-red hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition duration-300"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl mb-4 font-semibold text-brand-black">Inventario de Propiedades</h2>
          
          {/* Aquí aplicamos la clase crm-table */}
          <table className="crm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id}>
                  <td>{p.reference_id}</td>
                  <td>{p.title}</td>
                  <td>${p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;