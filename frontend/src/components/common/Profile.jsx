import React, { useState, useEffect, useRef } from 'react';
import API from '../../api';
import { jwtDecode } from 'jwt-decode';
import { animate, stagger } from 'animejs';
import { 
    PersonCircle, 
    GeoAltFill, 
    Check2Circle, 
    XCircle, 
    PencilSquare, 
    Save2Fill,
    ClockHistory
} from 'react-bootstrap-icons';

function Profile() {
    const PROFILE_API = '/auth/profile'; 
    const UPDATE_API = '/auth/update_profile';

    // --- STATE ---
    const [activeTab, setActiveTab] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });
    
    // Core User Model Matching users.py Schema
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        role: 'customer',
        address: {
            street: '',
            city: '',
            zip_code: ''
        }
    });

    const formRef = useRef(null);

    // --- FETCH PROFILE DATA ---
    useEffect(() => {
        const loadUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                // Pre-populating basic data from token instantly
                setFormData(prev => ({
                    ...prev,
                    fullname: decoded.fullname || '',
                    role: decoded.role || 'customer'
                }));

                // Fetching comprehensive database record securely
                const res = await API.get(`${PROFILE_API}/${decoded.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.user) {
                    const u = res.data.user;
                    setFormData({
                        fullname: u.fullname || '',
                        username: u.username || '',
                        email: u.email || '',
                        role: u.role || 'customer',
                        address: {
                            street: u.address?.street || '',
                            city: u.address?.city || '',
                            zip_code: u.address?.zip_code || ''
                        }
                    });
                }
            } catch (error) {
                console.error("Could not fetch user profile details:", error);
            }
        };

        loadUserProfile();
    }, []);

    // --- ENTRANCE ANIMATIONS ---
    useEffect(() => {
        animate('.profile-anim-left', {
            translateX: [-40, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });

        animate('.profile-anim-right', {
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });
    }, []);

    // Trigger grid elements cascading shift when tab toggles
    useEffect(() => {
        animate('.field-anim', {
            scale: [0.97, 1],
            opacity: [0, 1],
            delay: stagger(60),
            duration: 500,
            easing: 'easeOutExpo'
        });
    }, [activeTab]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    const handleInputChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section === 'address') {
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const decoded = jwtDecode(token);
            const res = await API.put(`${UPDATE_API}/${decoded.user_id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res){
				localStorage.setItem("token", res.data.token)
			}
            showToast("Profile settings synced successfully!", "success");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            showToast("Failed to sync profile settings.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Shared styling constraints
    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 text-gray-900 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed";
    const labelStyle = "block text-xs font-black text-slate-400 uppercase tracking-wider";

    return (
        <div className="max-w-5xl mx-auto relative mt-12">
            
            {/* TOAST SYSTEM */}
            {toast.visible && (
                <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                    {toast.type === 'success' ? <Check2Circle size={24} /> : <XCircle size={24} />}
                    {toast.message}
                </div>
            )}

            {/* DASHBOARD HEADER */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Account Settings</h2>
                    <p className="text-slate-500 mt-1">Manage your administrative credentials and digital preferences.</p>
                </div>
                
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 font-black px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                        <PencilSquare size={16} /> Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-green-500 text-white font-black px-6 py-2.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 active:scale-95"
                    >
                        <Save2Fill size={16} /> {isSaving ? 'Syncing...' : 'Save Updates'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* --- LEFT HAND PANELS: IDENTITY HUB --- */}
                <div className="space-y-6 profile-anim-left opacity-0">
                    
                    {/* User Identity Card */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                        <div className="relative inline-block mx-auto mb-4">
                            <PersonCircle size={96} className="text-slate-200" />
                            <span className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 border-4 border-white rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{formData.fullname}</h3>
                        <p className="text-sm font-bold text-slate-400 mt-0.5">@{formData.username || 'username'}</p>
                        
                        <div className="mt-4 inline-block px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs font-black text-blue-600 uppercase tracking-wider">
                            System Role: {formData.role}
                        </div>
                    </div>

                    {/* Navigation Tabs List Panel */}
                    <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm space-y-1">
                        <button
                            onClick={() => { setActiveTab('personal'); setIsEditing(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'personal' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
                        >
                            <PersonCircle size={18} /> Credentials
                        </button>
                        <button
                            onClick={() => { setActiveTab('address'); setIsEditing(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'address' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
                        >
                            <GeoAltFill size={18} /> Location Node
                        </button>
                    </div>
                </div>

                {/* --- RIGHT HAND PANELS: DATA TABS WORKSPACE --- */}
                <div className="md:col-span-2 profile-anim-right opacity-0">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[360px] flex flex-col justify-between">
                        
                        <form onSubmit={handleSaveChanges} className="space-y-6">
                            
                            {/* TAB 1: PERSISTED USER CREDENTIALS */}
                            {activeTab === 'personal' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="field-anim opacity-0 sm:col-span-2">
                                        <label className={labelStyle}>Full System Name</label>
                                        <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} disabled={!isEditing} className={inputStyle} />
                                    </div>
                                    <div className="field-anim opacity-0">
                                        <label className={labelStyle}>Account Username</label>
                                        <input type="text" name="username" value={formData.username} disabled={true} className={inputStyle} title="Immutable database keys cannot be customized." />
                                    </div>
                                    <div className="field-anim opacity-0">
                                        <label className={labelStyle}>Email Node</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className={inputStyle} />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: EMBEDDED LOCATION SUBDOCUMENT */}
                            {activeTab === 'address' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="field-anim opacity-0 sm:col-span-2">
                                        <label className={labelStyle}>Street Address</label>
                                        <input type="text" name="street" value={formData.address.street} onChange={(e) => handleInputChange(e, 'address')} disabled={!isEditing} className={inputStyle} placeholder="123 Main St" />
                                    </div>
                                    <div className="field-anim opacity-0">
                                        <label className={labelStyle}>City Node</label>
                                        <input type="text" name="city" value={formData.address.city} onChange={(e) => handleInputChange(e, 'address')} disabled={!isEditing} className={inputStyle} placeholder="New York" />
                                    </div>
                                    <div className="field-anim opacity-0">
                                        <label className={labelStyle}>Postal Zip Code</label>
                                        <input type="number" name="zip_code" value={formData.address.zip_code} onChange={(e) => handleInputChange(e, 'address')} disabled={!isEditing} className={inputStyle} placeholder="10001" />
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Informational Verification Footer Strip */}
                        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <ClockHistory className="text-blue-500" size={14} /> Local Data Store Synchronized
                            </div>
                            <div>
                                Status: Verified
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Profile;