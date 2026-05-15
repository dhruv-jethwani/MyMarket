import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Bag,           // Replaced Seller icons with Customer ones
    Cart3, 
    ClockHistory, 
    BoxArrowRight, 
    PersonCircle
} from 'react-bootstrap-icons';

function CustomerLayout() {
    const location = useLocation();
    const navigate = useNavigate();

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
                {/* Brand Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight">
                        MyMarket
                    </Link>
                    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 rounded-full">
                        Customer
                    </span>
                </div>

                {/* Navigation Links */}
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

                {/* Sidebar Footer (Logout) */}
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
                    
                    {/* User Profile Mockup */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            {/* FIX 3: Changed "Staff Portal" to "Shopper" */}
                            <p className="text-sm font-bold text-slate-700">Shopper</p>
                            <p className="text-xs text-slate-400">Active Session</p>
                        </div>
                        <PersonCircle size={36} className="text-slate-300" />
                    </div>
                </header>

                {/* PAGE CONTENT (The Outlet) */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
                
            </div>
        </div>
    );
}

export default CustomerLayout;