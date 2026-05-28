import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { GraphUp, CurrencyDollar, BoxSeam, Box } from 'react-bootstrap-icons';

function SellerAnalytics() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('/order/seller_analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (!isLoading && stats) {
            animate('.stat-card', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800,
                easing: 'easeOutExpo'
            });

            animate('.chart-bar', {
                scaleY: [0, 1],
                opacity: [0, 1],
                delay: stagger(50, { start: 400 }),
                duration: 1000,
                easing: 'easeOutElastic(1, .8)',
                transformOrigin: 'bottom'
            });
        }
    }, [isLoading, stats]);

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Compiling Financial Data...</div>;

    // Calculate maximum bar height for scaling the graph visually
    const maxSales = Math.max(...stats.monthly_sales, 1); 

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Performance Analytics</h1>
                <p className="text-slate-500 mt-1">Real-time data based on actual customer orders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
                        <p className="text-3xl font-black text-slate-900">₹{stats.total_revenue.toLocaleString()}</p>
                    </div>
                    <div className="h-14 w-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><CurrencyDollar size={28} /></div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Profit</p>
                        <p className="text-3xl font-black text-green-600">₹{stats.total_profit.toLocaleString()}</p>
                    </div>
                    <div className="h-14 w-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><GraphUp size={24} /></div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Items Sold</p>
                        <p className="text-3xl font-black text-slate-900">{stats.total_items_sold}</p>
                    </div>
                    <div className="h-14 w-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center"><Box size={24} /></div>
                </div>
            </div>

            <div className="stat-card opacity-0 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800">Revenue Overview (Current Year)</h3>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {stats.monthly_sales.map((val, idx) => {
                        const heightPercentage = (val / maxSales) * 100;
                        return (
                            <div key={idx} className="w-full flex flex-col items-center gap-3">
                                <div 
                                    className="chart-bar w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-lg opacity-0 relative group"
                                    style={{ height: `${heightPercentage}%`, minHeight: val > 0 ? '5%' : '2%' }}
                                >
                                    {val > 0 && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{val}</span>}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx]}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default SellerAnalytics;