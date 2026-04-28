import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ allowedRoles }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. Not logged in at all? Kick them to the login page.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Logged in, but they don't have the right role? 
    // E.g., A customer trying to manually type /admin/users in the URL bar
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        
        // Send them back to their own specific dashboard so they aren't just stuck
        if (userRole === 'customer') return <Navigate to="/shop" replace />;
        if (userRole === 'seller') return <Navigate to="/add_product" replace />;
        if (userRole === 'admin') return <Navigate to="/admin/users" replace />;
        
        // Failsafe fallback
        return <Navigate to="/login" replace />;
    }

    // 3. If they have a token AND the correct role, let them through!
    // <Outlet /> basically says "Render whatever is nested inside this route"
    return <Outlet />;
}

export default ProtectedRoute;