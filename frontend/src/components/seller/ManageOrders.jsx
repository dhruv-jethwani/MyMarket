import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { Receipt, BoxSeam, Box, SendCheck } from 'react-bootstrap-icons';

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSellerOrders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/order/seller_orders', {
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

    // --- STATUS UPDATE API CALL ---
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`/order/update_status/${orderId}`, { status: newStatus });
            
            // Instantly update the UI
            setOrders(orders.map(o => {
                if (o.id === orderId) {
                    return { ...o, status: newStatus };
                }
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

                    return (
                        <div key={order.id} className="order-row opacity-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Order Ref ID</span>
                                    <span className="text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">{order.id}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Your Revenue</span>
                                    <span className="text-lg font-black text-green-600">₹{order.order_total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                {/* DYNAMIC STATUS DROPDOWN */}
                                <div className="mb-6 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 w-max">
                                    <div className="flex items-center gap-2">
                                        <SendCheck className="text-blue-500" size={20}/>
                                        <span className="font-bold text-slate-700">Shipping Status:</span>
                                    </div>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`font-bold outline-none cursor-pointer rounded-lg px-3 py-1 text-sm border-2 ${order.status === 'Paid' ? 'border-orange-300 text-orange-600 bg-orange-50' : order.status === 'Shipped' ? 'border-blue-300 text-blue-600 bg-blue-50' : 'border-emerald-300 text-emerald-600 bg-emerald-50'}`}
                                    >
                                        <option value="Paid">Packing (Paid)</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <Box size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                    <p className="text-xs font-bold text-slate-500">Ordered on: {orderDate}</p>
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