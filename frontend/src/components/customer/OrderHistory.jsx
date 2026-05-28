import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { Receipt, BoxSeam, CheckCircleFill, ClockFill, Truck, Check2All } from 'react-bootstrap-icons';

function OrderHistory() {
    const HISTORY_API = '/order/history';
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(HISTORY_API, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.orders) {
                    setOrders(res.data.orders);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [navigate]);

    useEffect(() => {
        if (!isLoading && orders.length > 0) {
            animate('.order-card', {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, orders]);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Paid': return <CheckCircleFill className="text-green-500" />;
            case 'Shipped': return <Truck className="text-blue-500" />;
            case 'Delivered': return <Check2All className="text-emerald-600" />;
            default: return <ClockFill className="text-orange-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-slate-400 font-bold">
                <BoxSeam size={24} className="mr-2 animate-pulse" /> Retrieving your digital receipts...
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-12 bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
                <Receipt size={64} className="mx-auto text-slate-300 mb-6" />
                <h2 className="text-3xl font-black text-slate-900 mb-2">No Order History</h2>
                <p className="text-slate-500 mb-8">When you make a purchase, your digital receipts will appear here.</p>
                <button onClick={() => navigate('/store')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Order History</h1>
                <p className="text-slate-500 mt-1">Review your past purchases and track current shipments.</p>
            </div>

            <div className="space-y-6">
                {orders.map((order) => {
                    const orderDate = new Date(order.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                        <div key={order.id} className="order-card opacity-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                            
                            {/* Order Header */}
                            <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order Placed</p>
                                    <p className="text-sm font-bold text-slate-700">{orderDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-sm font-black text-blue-600">₹{order.total_amount.toFixed(2)}</p>
                                </div>
                                <div className="md:text-right w-full md:w-auto border-t md:border-t-0 border-slate-200 pt-4 md:pt-0 mt-2 md:mt-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order # ID</p>
                                    <p className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">{order.id}</p>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-6 bg-slate-50 inline-flex px-4 py-2 rounded-xl border border-slate-100">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Status: {order.status}</span>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <BoxSeam size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                    <p className="text-xs font-bold text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                <p className="text-[10px] font-bold text-slate-400">₹{item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Gateway Ref */}
                            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <span>Ref: {order.gateway_ref || 'N/A'}</span>
                                <span className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors">Download Invoice</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OrderHistory;