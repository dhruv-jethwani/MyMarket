import React, { useState, useEffect } from 'react';
import API from '../../api';
import { jwtDecode } from 'jwt-decode';
import { animate, stagger } from 'animejs';
import { People, Trash, Eye, X, ShieldLockFill } from 'react-bootstrap-icons';

function UserControl() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdminId, setCurrentAdminId] = useState(null);
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
            const res = await API.get('/auth/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data.users);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (!isLoading && users.length > 0) {
            setTimeout(() => {
                animate('.user-row', {
                    translateY: [25, 0],
                    opacity: [0, 1],
                    delay: stagger(40),
                    duration: 700,
                    easing: 'easeOutExpo'
                });
            }, 50);
        }
    }, [isLoading, users]);

    const handleRoleChange = async (userId, newRole) => {
        const token = localStorage.getItem('token');
        try {
            await API.patch(`/auth/admin/users/${userId}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert(error.response?.data?.error || "Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("WARNING: Force destruction of this user parameter cannot be undone. Continue?")) return;
        const token = localStorage.getItem('token');
        try {
            await API.delete(`/auth/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.filter(u => u.id !== userId));
            if (selectedUser && selectedUser.id === userId) setSelectedUser(null);
        } catch (error) {
            alert(error.response?.data?.error || "Failed to delete user");
        }
    };

    return (
        <div className="max-w-7xl mx-auto relative">
            
            {/* DETAILED GLASSMORPHIC PROFILE MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-wide">{selectedUser.fullname}</h3>
                                <p className="text-sm font-bold text-gray-500 mt-0.5">@{selectedUser.username}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-900 bg-gray-50 border border-gray-200 p-2 rounded-full transition-colors">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">System Node ID</span>
                                <span className="text-xs font-mono bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-700 block w-max">{selectedUser.id}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Communications Relay</span>
                                <span className="text-sm font-bold text-gray-700">{selectedUser.email}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Privilege Map Level</span>
                                <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block border ${
                                    selectedUser.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                    selectedUser.role === 'seller' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                    'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>{selectedUser.role}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Uplink Registered</span>
                                <span className="text-sm font-bold text-gray-700">{new Date(selectedUser.joined).toLocaleString()}</span>
                            </div>
                        </div>

                        {selectedUser.id !== currentAdminId && (
                            <button 
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="w-full bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100/50"
                            >
                                <Trash size={16} /> Deconstruct Identity Node
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-8 text-gray-900">
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3"><People className="text-indigo-500"/> Identity Registry Control</h1>
                <p className="text-gray-500 mt-2 font-medium text-lg">Platform account orchestration and security privilege mapping.</p>
            </div>

            {/* LIGHT THEME SYSTEM DATA GRID */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest">
                            <th className="p-5 pl-8">Account Profile</th>
                            <th className="p-5 hidden sm:table-cell">Relay Endpoint</th>
                            <th className="p-5 text-center">Privilege Authorization</th>
                            <th className="p-5 text-right pr-8">Orchestration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="p-10 text-center text-indigo-500 font-bold animate-pulse">Syncing nodes...</td></tr>
                        ) : users.map((user) => {
                            const isSelf = user.id === currentAdminId;
                            return (
                                <tr key={user.id} className={`user-row opacity-0 border-b border-gray-100 transition-all duration-300 ${isSelf ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-3.5">
                                            {isSelf && <ShieldLockFill className="text-indigo-500" size={16} />}
                                            <div>
                                                <p className="font-black text-gray-900 flex items-center gap-2">
                                                    {user.fullname} 
                                                    {isSelf && <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-widest">Active</span>}
                                                </p>
                                                <p className="text-xs font-bold text-gray-500 mt-0.5">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-bold text-gray-600 hidden sm:table-cell">{user.email}</td>
                                    <td className="p-5 text-center">
                                        <select 
                                            value={user.role} 
                                            disabled={isSelf} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className={`font-black text-xs uppercase tracking-widest px-3 py-1.5 rounded-xl border outline-none bg-white text-center transition-all ${
                                                isSelf ? 'cursor-not-allowed opacity-50 border-gray-200' : 'cursor-pointer hover:border-gray-300 border-gray-200'
                                            } ${
                                                user.role === 'admin' ? 'text-rose-600' :
                                                user.role === 'seller' ? 'text-blue-600' :
                                                'text-gray-600'
                                            }`}
                                        >
                                            <option value="customer" className="bg-white text-gray-900">Customer</option>
                                            <option value="seller" className="bg-white text-gray-900">Seller</option>
                                            <option value="admin" className="bg-white text-gray-900">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-5 pr-8 text-right flex items-center justify-end gap-3.5">
                                        <button 
                                            onClick={() => setSelectedUser(user)} 
                                            className="text-gray-500 hover:text-indigo-500 bg-gray-50 hover:bg-indigo-50 border border-gray-200 px-3 py-2 rounded-xl transition-all"
                                            title="Inspect Metadata"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            disabled={isSelf}
                                            className={`px-3 py-2 rounded-xl border transition-all ${
                                                isSelf 
                                                ? 'text-gray-300 bg-transparent border-transparent cursor-not-allowed' 
                                                : 'text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                            }`}
                                        >
                                            <Trash size={15} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <style jsx="true">{`@keyframes slideUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}

export default UserControl;
