import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Obras from './pages/Obras.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/obras"
        element={
          <ProtectedRoute>
            <Obras />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
