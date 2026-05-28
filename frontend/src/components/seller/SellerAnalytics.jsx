import React, { useEffect } from 'react';
import { animate, stagger } from 'animejs';
import { GraphUp, CurrencyDollar, ArrowUpRight, Box, Activity } from 'react-bootstrap-icons';

function SellerAnalytics() {
    useEffect(() => {
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
    }, []);

    // Mock data for visual chart
    const monthlySales = [45, 80, 30, 90, 120, 65, 110, 140, 85, 100, 150, 130];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Performance Analytics</h1>
                <p className="text-slate-500 mt-1">Track your store's growth and sales momentum.</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-3xl font-black text-slate-900">₹124,500</p>
                        <p className="text-xs font-bold text-green-500 flex items-center gap-1 mt-2"><ArrowUpRight /> +14.5% this month</p>
                    </div>
                    <div className="h-14 w-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center"><CurrencyDollar size={28} /></div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                        <p className="text-3xl font-black text-slate-900">342</p>
                        <p className="text-xs font-bold text-blue-500 flex items-center gap-1 mt-2"><ArrowUpRight /> +8.2% this month</p>
                    </div>
                    <div className="h-14 w-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Box size={24} /></div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p>
                        <p className="text-3xl font-black text-slate-900">4.8%</p>
                        <p className="text-xs font-bold text-orange-500 flex items-center gap-1 mt-2"><Activity /> Steady</p>
                    </div>
                    <div className="h-14 w-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center"><GraphUp size={24} /></div>
                </div>
            </div>

            {/* Visual Chart Area */}
            <div className="stat-card opacity-0 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800">Revenue Overview (Yearly)</h3>
                    <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 px-4 py-2 rounded-xl outline-none">
                        <option>2026</option>
                        <option>2025</option>
                    </select>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {monthlySales.map((height, idx) => (
                        <div key={idx} className="w-full flex flex-col items-center gap-3">
                            <div 
                                className="chart-bar w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-lg opacity-0"
                                style={{ height: `${height}%` }}
                            ></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SellerAnalytics;