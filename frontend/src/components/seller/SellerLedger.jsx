import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { JournalCheck, BoxSeam } from 'react-bootstrap-icons';

function SellerLedger() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLedger = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/shop/seller/ledger', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLogs(res.data.ledger || []);
            } catch (error) {
                console.error("Error fetching ledger:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLedger();
    }, []);

    useEffect(() => {
        if (!isLoading && logs.length > 0) {
            animate('.ledger-row', {
                translateY: [15, 0],
                opacity: [0, 1],
                delay: stagger(50),
                duration: 500,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, logs]);

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Financial Ledger...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Inventory Ledger</h1>
                <p className="text-slate-500 mt-1">A historical record of all your restock expenses.</p>
            </div>

            {logs.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center">
                    <JournalCheck size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">Clean Ledger</h3>
                    <p className="text-slate-500 mt-2">You haven't purchased any inventory restocks yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <th className="p-5">Date</th>
                                <th className="p-5">Product Restocked</th>
                                <th className="p-5 text-center">Qty Added</th>
                                <th className="p-5 text-right">Cost/Unit</th>
                                <th className="p-5 text-right">Total Expense</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => {
                                const logDate = new Date(log.timestamp).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });

                                return (
                                    <tr key={log.id} className="ledger-row opacity-0 border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-5 text-sm font-bold text-slate-500">{logDate}</td>
                                        <td className="p-5 text-sm font-bold text-slate-900">{log.product_name}</td>
                                        <td className="p-5 text-sm font-black text-blue-600 text-center">+{log.quantity_added}</td>
                                        <td className="p-5 text-sm font-bold text-slate-500 text-right">₹{log.cost_price.toFixed(2)}</td>
                                        <td className="p-5 text-sm font-black text-red-500 text-right">-₹{log.total_expense.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SellerLedger;