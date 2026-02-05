import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Services from './pages/admin/Services';
import Professionals from './pages/admin/Professionals';
import AdminBookings from './pages/admin/Bookings';

// Public Pages
import BookingFlow from './pages/public/BookingFlow';
import LandingPage from './pages/public/LandingPage';
import Pricing from './pages/public/Pricing';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!user) return <Navigate to="/login" />;

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/agendar/:slug" element={<BookingFlow />} />
                    <Route path="/:slug" element={<LandingPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="servicos" element={<Services />} />
                        <Route path="profissionais" element={<Professionals />} />
                        <Route path="agendamentos" element={<AdminBookings />} />
                    </Route>

                    {/* Root redirect */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
                <Toaster position="top-right" />
            </AuthProvider>
        </Router>
    );
};

export default App;
