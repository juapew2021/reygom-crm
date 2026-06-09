import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Si no hay token, redirige al Login
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // Si hay token, deja pasar al contenido
  return children;
}

export default ProtectedRoute;