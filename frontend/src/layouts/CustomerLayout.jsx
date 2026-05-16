import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // <-- Added import
import { 
    Bag,           
    Cart3, 
    ClockHistory, 
    BoxArrowRight, 
    PersonCircle
} from 'react-bootstrap-icons';

function CustomerLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('Shopper'); // <-- Added state

    // Decode the token on load to get the name
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.fullname) setUserName(decoded.fullname);
            } catch (error) {
                console.error("Invalid token");
            }
        }
    }, []);

    const menuItems = [
        { path: '/store', name: 'Shop', icon: <Bag size={20} /> },
        { path: '/items', name: 'Cart', icon: <Cart3 size={20} /> },
        { path: '/history', name: 'Order History', icon: <ClockHistory size={20} /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight">
                        MyMarket
                    </Link>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 rounded-full">
                        Customer
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
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
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Bag size={18} className="text-blue-500" />
                        <span>Customer Dashboard</span>
                    </div>
                    
                    {/* CLICKABLE PROFILE LINK */}
                    <Link 
                        to="/profile" 
                        className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
                    >
                        <div className="text-right hidden sm:block">
                            {/* Dynamically displays the user's name */}
                            <p className="text-sm font-bold text-slate-700">{userName}</p>
                            <p className="text-xs text-slate-400">Active Session</p>
                        </div>
                        <PersonCircle size={36} className="text-slate-300" />
                    </Link>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default CustomerLayout;