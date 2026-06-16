import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { animate, stagger } from 'animejs';
import { People, Trash, Eye, X, ShieldLockFill } from 'react-bootstrap-icons';

function UserControl() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdminId, setCurrentAdminId] = useState(null);

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setCurrentAdminId(decoded.user_id);
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('/auth/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data.users);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (!isLoading && users.length > 0) {
            animate('.user-row', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(50),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, users]);

    const handleRoleChange = async (userId, newRole) => {
        const token = localStorage.getItem('token');
        try {
            await axios.patch(`/auth/admin/users/${userId}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("WARNING: This will permanently delete the user. Continue?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/auth/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.filter(u => u.id !== userId));
            if (selectedUser && selectedUser.id === userId) setSelectedUser(null);
        } catch (error) {
            alert(error.response?.data?.error || "Failed to delete user");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 relative">
            
            {/* USER DETAILS MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{selectedUser.fullname}</h3>
                                <p className="text-sm font-bold text-slate-400">@{selectedUser.username}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full"><X size={24}/></button>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">System ID</span>
                                <span className="text-xs font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded text-slate-600">{selectedUser.id}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</span>
                                <span className="text-sm font-bold text-slate-700">{selectedUser.email}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Role</span>
                                <span className={`text-xs font-black uppercase tracking-wide px-3 py-1 rounded-md inline-block ${
                                    selectedUser.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    selectedUser.role === 'seller' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>{selectedUser.role}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Created On</span>
                                <span className="text-sm font-bold text-slate-700">{new Date(selectedUser.joined).toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedUser.id !== currentAdminId && (
                            <button 
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash size={18} /> Terminate Account
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><People className="text-blue-600"/> Identity Access Management</h1>
                <p className="text-slate-500 mt-1">Global registry of all platform accounts and security roles.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
                            <th className="p-5 pl-8 rounded-tl-3xl">User Profile</th>
                            <th className="p-5 hidden sm:table-cell">Email</th>
                            <th className="p-5 text-center">Global Role</th>
                            <th className="p-5 text-right pr-8 rounded-tr-3xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isSelf = user.id === currentAdminId;
                            return (
                                <tr key={user.id} className={`user-row opacity-0 border-b border-slate-100 transition-colors ${isSelf ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-3">
                                            {isSelf && <ShieldLockFill className="text-blue-500" title="This is you" />}
                                            <div>
                                                <p className="font-black text-slate-900 flex items-center gap-2">
                                                    {user.fullname} {isSelf && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-bold text-slate-600 hidden sm:table-cell">{user.email}</td>
                                    <td className="p-5 text-center">
                                        <select 
                                            value={user.role} 
                                            disabled={isSelf} // <-- PREVENTS ADMIN DEMOTING THEMSELVES
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`font-bold text-xs uppercase tracking-wide px-3 py-1.5 rounded-lg border-2 outline-none ${
                                                isSelf ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-sm'
                                            } ${
                                                user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' :
                                                user.role === 'seller' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="seller">Seller</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-5 pr-8 text-right flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setSelectedUser(user)} 
                                            className="text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-100 px-3 py-2 rounded-lg transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            disabled={isSelf}
                                            className={`px-3 py-2 rounded-lg transition-all ${isSelf ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100'}`}
                                            title={isSelf ? "Cannot delete yourself" : "Delete User"}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx="true">{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}

export default UserControl;