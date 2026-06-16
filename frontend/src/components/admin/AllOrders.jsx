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
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><CardList className="text-blue-600"/> Global Order Log</h1>
                <p className="text-slate-500 mt-1">Omniscient view of all platform transactions.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest">
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
                                <tr key={order.id} className="global-order opacity-0 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-5 pl-8">
                                        <p className="font-mono text-xs text-slate-500 mb-1">{order.id}</p>
                                        <p className="text-sm font-bold text-slate-900">{date}</p>
                                    </td>
                                    <td className="p-5 text-sm font-black text-blue-600">{order.buyer_name}</td>
                                    <td className="p-5 text-right text-lg font-black text-green-600">₹{order.total_amount.toFixed(2)}</td>
                                    <td className="p-5 pr-8 text-center">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className={`font-bold text-xs uppercase tracking-wide px-3 py-2 rounded-lg border outline-none cursor-pointer ${
                                                order.status === 'Paid' ? 'border-orange-300 text-orange-600 bg-orange-50' : 
                                                order.status === 'Shipped' ? 'border-blue-300 text-blue-600 bg-blue-50' : 
                                                'border-emerald-300 text-emerald-600 bg-emerald-50'
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