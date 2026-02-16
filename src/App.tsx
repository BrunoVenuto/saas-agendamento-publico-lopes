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

// SaaS Admin Pages
import SaasAdminLayout from './components/SaasAdminLayout';
import SaasDashboard from './pages/admin/saas/Dashboard';
import SaasTenants from './pages/admin/saas/Tenants';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, profile, loading, isSuperAdmin } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

    // If not logged in, go to login
    if (!user) return <Navigate to="/login" />;

    // If super admin, they can access /admin routes (though they usually use /saas-admin)
    if (isSuperAdmin) return <>{children}</>;

    // Most admin routes require a tenant_id from the profile for normal users
    if (!profile?.tenant_id) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isSuperAdmin, loading } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    if (!user || !isSuperAdmin) return <Navigate to="/login" />;

    return <>{children}</>;
};

const Home: React.FC = () => {
    const { user, profile, loading, isSuperAdmin } = useAuth();

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

    if (!user) return <Navigate to="/login" />;

    if (isSuperAdmin) return <Navigate to="/saas-admin" />;

    if (profile?.tenant_id) return <Navigate to="/admin" />;

    return <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
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

                    {/* SaaS Admin Routes */}
                    <Route path="/saas-admin" element={
                        <SuperAdminRoute>
                            <SaasAdminLayout />
                        </SuperAdminRoute>
                    }>
                        <Route index element={<SaasDashboard />} />
                        <Route path="tenants" element={<SaasTenants />} />
                        <Route path="users" element={<div className="p-8 text-center text-gray-500">Gestão de usuários em breve...</div>} />
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
