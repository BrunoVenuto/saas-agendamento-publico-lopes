import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Building2,
    Users,
    LogOut,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/ui';

const SaasAdminLayout: React.FC = () => {
    const { signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/saas-admin', icon: LayoutDashboard },
        { name: 'Estabelecimentos', href: '/saas-admin/tenants', icon: Building2 },
        { name: 'Usuários', href: '/saas-admin/users', icon: Users },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
                <div className="p-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Agendify <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded ml-1 uppercase">SaaS</span></span>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header Mobile */}
                <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white uppercase tracking-wider">Agendify Admin</span>
                    </div>
                    <button className="text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                                    location.pathname === item.href ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-400"
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

export default SaasAdminLayout;
