import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
    Speedometer2, 
    People, 
    CardList, 
    BarChartLine,
    BoxArrowRight, 
    PersonCircle,
    ShieldLockFill,
    Check2Circle
} from 'react-bootstrap-icons';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Administrator');

    // --- GLOBAL PERSISTENT TOAST STATE ---
    const [globalToast, setGlobalToast] = useState({ visible: false, message: '' });

    useEffect(() => {
        // Decode Token for Name
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.fullname) setUserName(decoded.fullname);
            } catch (error) {
                console.error("Invalid token");
            }
        }

        // Check if we arrived here from a successful login
        if (location.state && location.state.loginToast) {
            setGlobalToast({ visible: true, message: location.state.loginToast });
            
            // Clean up the router state so refreshing the page doesn't re-trigger the toast
            window.history.replaceState({}, document.title);

            // Force it to persist for exactly 5 seconds
            setTimeout(() => {
                setGlobalToast({ visible: false, message: '' });
            }, 5000); 
        }
    }, [location]);

    // Admin-specific routing
    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <Speedometer2 size={20} /> },
        { path: '/admin/users', name: 'Manage Users', icon: <People size={20} /> },
        { path: '/admin/orders', name: 'All Orders', icon: <CardList size={20} /> },
        { path: '/admin/analytics', name: 'Analytics', icon: <BarChartLine size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            
            {/* --- GLOBAL PERSISTENT TOAST --- */}
            {globalToast.visible && (
                <div className="fixed top-8 right-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all duration-300 bg-green-500 shadow-green-200">
                    <Check2Circle size={24} />
                    {globalToast.message}
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 flex flex-col shadow-xl z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link to="/admin/dashboard" className="text-2xl font-black text-white tracking-tight">
                        MyMarket
                    </Link>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-100 bg-red-600 rounded-full">
                        Admin
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 font-bold hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors"
                    >
                        <BoxArrowRight size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 flex flex-col">
                {/* TOP HEADER */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <ShieldLockFill size={18} className="text-red-500" />
                        <span>System Administration</span>
                    </div>
                    
                    {/* CLICKABLE PROFILE LINK */}
                    <Link 
                        to="/profile" 
                        className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700">{userName}</p>
                            <p className="text-xs font-bold text-green-500">Superuser Active</p>
                        </div>
                        <PersonCircle size={36} className="text-slate-300" />
                    </Link>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}