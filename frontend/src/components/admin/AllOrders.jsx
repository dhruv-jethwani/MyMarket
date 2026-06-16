import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { CardList, CheckCircleFill, ClockFill, Truck, Check2All } from 'react-bootstrap-icons';

function AllOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/order/admin/all', { headers: { Authorization: `Bearer ${token}` } });
                setOrders(res.data.orders);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching global orders:", error);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!isLoading && orders.length > 0) {
            animate('.global-order', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(50),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, orders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.patch(`/order/update_status/${orderId}`, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert("Failed to force update status.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                    <CardList className="text-indigo-500"/> Global Order Log
                </h1>
                <p className="text-slate-400 mt-1 font-medium">Omniscient view of all platform transactions.</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/30 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black uppercase tracking-widest">
                            <th className="p-5 pl-8">Order ID / Date</th>
                            <th className="p-5">Buyer</th>
                            <th className="p-5 text-right">Value</th>
                            <th className="p-5 text-center pr-8">Force Status Override</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const date = new Date(order.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            return (
                                <tr key={order.id} className="global-order opacity-0 border-b border-slate-100 hover:bg-indigo-50/40 transition-colors">
                                    <td className="p-5 pl-8">
                                        <p className="font-mono text-xs text-slate-400 mb-1">{order.id}</p>
                                        <p className="text-sm font-bold text-slate-700">{date}</p>
                                    </td>
                                    <td className="p-5 text-sm font-black text-indigo-600">{order.buyer_name}</td>
                                    <td className="p-5 text-right text-lg font-black text-emerald-600">₹{order.total_amount.toFixed(2)}</td>
                                    <td className="p-5 pr-8 text-center">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`font-bold text-xs uppercase tracking-wide px-3 py-2 rounded-xl border outline-none cursor-pointer transition-all ${
                                                order.status === 'Paid' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                                order.status === 'Shipped' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' : 
                                                'border-emerald-200 text-emerald-700 bg-emerald-50'
                                            }`}
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllOrders;