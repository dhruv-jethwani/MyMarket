import React, { useState, useEffect } from 'react';
import API from '../../api';
import { animate, stagger } from 'animejs';
import { Receipt, BoxSeam, Box, SendCheck, PersonCircle, ChevronDown } from 'react-bootstrap-icons';

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSellerOrders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await API.get('/order/seller_orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data.orders || []);
            } catch (error) {
                console.error("Error fetching seller orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSellerOrders();
    }, []);

    useEffect(() => {
        if (!isLoading && orders.length > 0) {
            animate('.order-row', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, orders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await API.patch(`/order/update_status/${orderId}`, { status: newStatus });
            setOrders(orders.map(o => {
                if (o.id === orderId) return { ...o, status: newStatus };
                return o;
            }));
        } catch (error) {
            console.error(error);
            alert("Failed to update status.");
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Incoming Orders...</div>;

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center">
                <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Orders Yet</h3>
                <p className="text-slate-500 mt-2">When customers purchase your products, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Fulfillment Center</h1>
                <p className="text-slate-500 mt-1">Pack your items and update customer shipping statuses.</p>
            </div>

            <div className="space-y-6">
                {orders.map((order) => {
                    const orderDate = new Date(order.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    // Dynamic styles for the premium dropdown
                    const statusConfig = {
                        'Paid': 'border-orange-200 text-orange-600 bg-orange-50 focus:ring-orange-500',
                        'Shipped': 'border-blue-200 text-blue-600 bg-blue-50 focus:ring-blue-500',
                        'Delivered': 'border-emerald-200 text-emerald-600 bg-emerald-50 focus:ring-emerald-500'
                    };

                    return (
                        <div key={order.id} className="order-row opacity-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
                                <div className="flex gap-8">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Order Ref ID</span>
                                        <span className="text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{order.id}</span>
                                    </div>
                                    {/* NEW: Buyer Name Display */}
                                    <div className="hidden sm:block">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Customer</span>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <PersonCircle className="text-blue-500"/> {order.buyer_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Revenue</span>
                                    <span className="text-lg font-black text-green-600">₹{order.order_total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* PREMIUM STYLED DROPDOWN */}
                                <div className="mb-6 flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 w-full sm:w-max shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <SendCheck className="text-slate-400" size={20}/>
                                        <span className="text-sm font-black text-slate-600 uppercase tracking-wide">Update Status:</span>
                                    </div>
                                    
                                    <div className="relative">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`appearance-none font-bold outline-none cursor-pointer rounded-xl pl-4 pr-10 py-2 text-sm border-2 shadow-sm transition-all focus:ring-2 focus:ring-offset-1 ${statusConfig[order.status]}`}
                                        >
                                            <option value="Paid" className="bg-white text-slate-900">📦 Packing (Paid)</option>
                                            <option value="Shipped" className="bg-white text-slate-900">🚚 Shipped</option>
                                            <option value="Delivered" className="bg-white text-slate-900">✅ Delivered</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown size={14} className={order.status === 'Paid' ? 'text-orange-500' : order.status === 'Shipped' ? 'text-blue-500' : 'text-emerald-500'} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">Ordered on: {orderDate}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg mr-4">Qty: {item.quantity}</span>
                                                <span className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ManageOrders;