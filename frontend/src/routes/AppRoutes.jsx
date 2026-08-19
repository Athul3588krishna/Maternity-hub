import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CenterList from "../pages/CenterList";
import CenterDetails from "../pages/CenterDetails";
import MyBookings from "../pages/MyBookings";
import AdminDashboard from "../pages/AdminDashboard";
import ProviderDashboard from "../pages/ProviderDashboard";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading user session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/centers" element={<CenterList />} />
      <Route path="/centers/:id" element={<CenterDetails />} />
      
      <Route path="/my-bookings" element={
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      } />

      <Route path="/provider-dashboard" element={
        <ProtectedRoute>
          <ProviderDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
