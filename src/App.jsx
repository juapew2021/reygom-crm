import RentalSearchAccess from "./components/RentalSearchAccess";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import PersonalizationPage from "./pages/Personalization/PersonalizationPage";
import MailPage from "./pages/Mail/MailPage";
import AccessPage from "./pages/Access/AccessPage";
import HistoryPage from "./pages/History/HistoryPage";
import OfficeAdministrationPage from "./pages/Offices/OfficeAdministrationPage";
import PublishPropertyPage from "./pages/Publications/PublishPropertyPage";
import VerifySubmissionPage from "./pages/Publications/VerifySubmissionPage";
import SubmissionsReviewPage from "./pages/Publications/SubmissionsReviewPage";
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
import AlquileresPage from "./pages/Alquileres/AlquileresPage";

function App() {
  return (
    <Router>
      <Routes>
<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
<Route path="/personalization" element={<ProtectedRoute><PersonalizationPage /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><PersonalizationPage profile /></ProtectedRoute>} />
<Route path="/mail" element={<ProtectedRoute><MailPage /></ProtectedRoute>} />
<Route path="/access" element={<ProtectedRoute><AccessPage /></ProtectedRoute>} />
<Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
<Route path="/administration" element={<ProtectedRoute><OfficeAdministrationPage /></ProtectedRoute>} />
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

        <Route
          path="/alquileres"
          element={
            <ProtectedRoute>
              <RentalSearchAccess><AlquileresPage /></RentalSearchAccess>
            </ProtectedRoute>
          }
        />
      <Route path="/publicar" element={<PublishPropertyPage />} />
<Route path="/publicar/verificar" element={<VerifySubmissionPage />} />
<Route path="/submissions" element={<ProtectedRoute><SubmissionsReviewPage /></ProtectedRoute>} />
</Routes>
    </Router>
  );
}

export default App;