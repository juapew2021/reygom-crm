import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/Leads/LeadsPage";
import Login from "./pages/Login";
import PropertiesListPage from "./pages/Properties/PropertiesListPage";
import PropertyEditorPage from "./pages/Properties/PropertyEditorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

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
              <PropertiesListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties/new"
          element={
            <ProtectedRoute>
              <PropertyEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties/:id"
          element={
            <ProtectedRoute>
              <PropertyEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;