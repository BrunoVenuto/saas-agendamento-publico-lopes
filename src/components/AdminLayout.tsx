import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Scissors,
    Users,
    Calendar,
    LogOut,
    Menu,
    X,
    Activity,
    Dog,
    Dumbbell
} from 'lucide-react';
import { cn } from '../utils/ui';

const AdminLayout: React.FC = () => {
    const { profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [tenantNiche, setTenantNiche] = React.useState<string | null>(null);

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Serviços', href: '/admin/servicos', icon: Scissors },
        { name: 'Profissionais', href: '/admin/profissionais', icon: Users },
        { name: 'Agendamentos', icon: Calendar, href: '/admin/agendamentos' },
    ];

    React.useEffect(() => {
        if (profile?.tenant_id) {
            fetchTenant(profile.tenant_id);
        }
    }, [profile]);

    const fetchTenant = async (id: string) => {
        const { data } = await supabase.from('tenants').select('primary_color, niche').eq('id', id).single();
        if (data?.primary_color) {
            document.documentElement.style.setProperty('--primary-color', data.primary_color);
        }
        setTenantNiche(data?.niche);
    };

    const getNicheIcon = () => {
        switch (tenantNiche) {
            case 'CLINIC': return <Activity className="w-5 h-5 text-white" />;
            case 'PETSHOP': return <Dog className="w-5 h-5 text-white" />;
            case 'PERSONAL': return <Dumbbell className="w-5 h-5 text-white" />;
            default: return <Scissors className="w-5 h-5 text-white" />;
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
                <div className="p-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        {getNicheIcon()}
                    </div>
                    <span className="text-xl font-bold text-gray-900">Agendify</span>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header Mobile */}
                <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            {getNicheIcon()}
                        </div>
                        <span className="text-xl font-bold text-gray-900">Agendify</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                                    location.pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-600"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                )}

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
