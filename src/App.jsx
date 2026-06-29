import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LeadsPage from './pages/Leads/LeadsPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PropertiesPage from './pages/Properties/PropertiesPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (

    <Router>

      <Routes>
        <Route
        path="/leads"
        element={
        <ProtectedRoute>
        <LeadsPage />
        </ProtectedRoute>
        }
        />

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <PropertiesPage />
            </ProtectedRoute>
          }
        />

      </Routes>

    </Router>

  );
}

export default App;
