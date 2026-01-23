import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import ObraNueva from "./pages/ObraNueva.jsx";
import ObraResumen from "./pages/ObraResumen.jsx";
import ObrasList from "./pages/ObrasList.jsx";
import Cuentas from "./pages/Cuentas.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  </ProtectedRoute>
);

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/obras" replace /> : <Login />}
        />
        <Route
          path="/obras"
          element={
            <ProtectedLayout>
              <ObrasList />
            </ProtectedLayout>
          }
        />
        <Route
          path="/obras/nueva"
          element={
            <ProtectedLayout>
              <ObraNueva />
            </ProtectedLayout>
          }
        />
        <Route
          path="/obra"
          element={
            <ProtectedLayout>
              <ObraResumen />
            </ProtectedLayout>
          }
        />
        <Route
          path="/cuentas"
          element={
            <ProtectedLayout>
              <Cuentas />
            </ProtectedLayout>
          }
        />
        <Route path="/app" element={<Navigate to="/obras" replace />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
