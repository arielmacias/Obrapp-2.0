import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AppHome from "./pages/AppHome.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/app" replace /> : <Login />}
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <div className="min-h-screen">
                <Navbar />
                <AppHome />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
