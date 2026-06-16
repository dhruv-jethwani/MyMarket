import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { GraphUp, CurrencyDollar, BoxSeam, Receipt, Percent } from 'react-bootstrap-icons';

function SellerAnalytics() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const pathRef = useRef(null);
    const areaRef = useRef(null);

    // Tooltip State
    const [hoveredPoint, setHoveredPoint] = useState(null);

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
                delay: stagger(20, { start: 400 }),
                duration: 1000,
                easing: 'easeOutQuart'
            });

            if (pathRef.current && areaRef.current) {
                const length = pathRef.current.getTotalLength();
                pathRef.current.style.strokeDasharray = length;
                pathRef.current.style.strokeDashoffset = length;
                
                areaRef.current.style.opacity = 0;

                animate(pathRef.current, {
                    strokeDashoffset: [length, 0],
                    duration: 1500,
                    easing: 'easeInOutQuart',
                    delay: 1000
                });

                animate(areaRef.current, {
                    opacity: [0, 1],
                    duration: 1000,
                    easing: 'easeOutSine',
                    delay: 1000
                });
                
                animate('.data-point', {
                    scale: [0, 1],
                    opacity: [0, 1],
                    delay: stagger(30, { start: 1800 }),
                    duration: 600,
                    easing: 'easeOutBack'
                });
            }
        }
    }, [isLoading, stats]);

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Compiling Financial Metrics...</div>;

    // --- CHART MATH & SCALING ---
    const chartData = stats?.chart_data || [];
    
    // Y-Axis Boundary Math
    const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => Math.max(d.revenue, d.expenses, d.profit)), 100) : 100;
    const minVal = 0; 
    const range = (maxVal - minVal) || 1;

    // SVG Canvas Dimensions
    const paddingLeft = 100; // Room for Y-Axis labels
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 40;
    const graphWidth = 1000 - paddingLeft - paddingRight;
    const graphHeight = 350 - paddingTop - paddingBottom; 

    // --- NEW: INNER GAP SYSTEM ---
    // This creates the visual gap between the axis lines and the actual chart data
    const innerOffset = 40; 
    const activeWidth = graphWidth - (innerOffset * 2);

    // Dynamic X-Coordinate Generator ensures elements never bleed into the padding
    const getCx = (idx, length) => {
        if (length === 1) return paddingLeft + graphWidth / 2; // Center if only 1 data point
        return paddingLeft + innerOffset + (idx / (length - 1)) * activeWidth;
    };

    // Generate Path Data specifically for the Net Profit overlay line
    const generateProfitPath = (data) => {
        if (data.length === 0) return '';
        if (data.length === 1) {
            const cy = paddingTop + graphHeight - (((data[0].profit - minVal) / range) * graphHeight);
            return `M ${paddingLeft},${cy} L ${paddingLeft + graphWidth},${cy}`; 
        }
        return 'M ' + data.map((d, idx) => {
            const cx = getCx(idx, data.length);
            const cy = paddingTop + graphHeight - (((d.profit - minVal) / range) * graphHeight);
            return `${cx},${cy}`;
        }).join(' L ');
    };

    const profitPathString = generateProfitPath(chartData);
    
    // Create the Area string by closing the path accurately at the exact inner points
    const areaPathString = profitPathString 
        ? `${profitPathString} L ${chartData.length === 1 ? paddingLeft + graphWidth : getCx(chartData.length - 1, chartData.length)},${paddingTop + graphHeight} L ${chartData.length === 1 ? paddingLeft : getCx(0, chartData.length)},${paddingTop + graphHeight} Z`
        : '';

    // Calculate Y-Axis Grid Lines (5 evenly spaced steps)
    const gridSteps = [0, 1, 2, 3, 4].map(i => {
        const val = minVal + (range / 4) * i;
        const cy = paddingTop + graphHeight - (i / 4) * graphHeight;
        return { val, cy };
    });

    // Calculate X-Axis Date Labels
    const xLabels = [];
    if (chartData.length > 0) {
        const steps = Math.min(chartData.length, 6);
        for (let i = 0; i < steps; i++) {
            const idx = Math.floor(i * (chartData.length - 1) / Math.max(steps - 1, 1));
            const cx = getCx(idx, chartData.length);
            xLabels.push({ cx, date: chartData[idx].date });
        }
    }

    // Dynamic bar width calculations
    const groupWidth = chartData.length > 1 ? (activeWidth / (chartData.length - 1)) : activeWidth;
    const barW = Math.min(groupWidth * 0.35, 24); 

    // --- DYNAMIC TOOLTIP CLAMP LOGIC ---
    let tooltipStyles = {};
    let arrowStyles = {};
    
    if (hoveredPoint) {
        const cxPercent = (hoveredPoint.cx / 1000) * 100;
        const arrowPercent = Math.max(15, Math.min(85, cxPercent));

        tooltipStyles = {
            left: `${cxPercent}%`,
            top: `${(hoveredPoint.cy / 350) * 100}%`,
            transform: `translate(-${arrowPercent}%, -110%)`
        };

        arrowStyles = {
            left: `${arrowPercent}%`,
            transform: 'translateX(-50%) rotate(45deg)'
        };
    }

    return (
        <div className="max-w-7xl mx-auto pb-12 relative">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Financial Overview</h1>
                <p className="text-slate-500 mt-1">Comprehensive breakdown of your revenue, costs, and profit margins.</p>
            </div>

            {/* TOP 4 CRITICAL METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CurrencyDollar size={20} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-0.5">Total Income</p>
                        <p className="text-3xl font-black text-slate-900">₹{stats?.total_revenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><Receipt size={18} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expenses</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-0.5">Variable Costs</p>
                        <p className="text-3xl font-black text-red-500">₹{stats?.total_expenses.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><GraphUp size={18} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-slate-500 mb-0.5">Take-home Earnings</p>
                        <p className="text-3xl font-black text-green-600">₹{stats?.total_profit.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card opacity-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Percent size={18} strokeWidth={1} /></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-0.5">Avg Profit Margin</p>
                        <p className="text-3xl font-black text-slate-900">{stats?.overall_margin}%</p>
                    </div>
                </div>
            </div>

            {/* DESCRIPTIVE MIXED CHART DASHBOARD */}
            <div className="stat-card opacity-0 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Income vs. Expenses Timeline</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">Chronological breakdown tracking revenue volume against material costs.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span className="w-3 h-3 rounded bg-blue-400"></span> Revenue (Income)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span className="w-3 h-3 rounded bg-red-400"></span> Expenses (Cost)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <span className="w-4 h-1 rounded-full bg-green-500"></span> Net Profit
                        </div>
                    </div>
                </div>

                {/* --- DYNAMIC FLOATING HTML TOOLTIP --- */}
                {hoveredPoint && (
                    <div 
                        className="absolute z-50 pointer-events-none pb-4 drop-shadow-2xl transition-all duration-100"
                        style={tooltipStyles}
                    >
                        <div className="bg-slate-900 text-white p-4 rounded-2xl min-w-[180px] shadow-2xl relative border border-slate-700">
                            <div className="border-b border-slate-700 pb-2 mb-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{hoveredPoint.data.date}</p>
                            </div>
                            <div className="space-y-2 text-sm font-bold">
                                <div className="flex justify-between gap-4">
                                    <span className="text-blue-400">Revenue:</span>
                                    <span>₹{hoveredPoint.data.revenue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-red-400">Expenses:</span>
                                    <span>-₹{hoveredPoint.data.expenses.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-px bg-slate-700 my-1"></div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-green-400">Net Profit:</span>
                                    <span className="font-black">₹{hoveredPoint.data.profit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between gap-4 pt-1">
                                    <span className="text-slate-400 text-xs uppercase tracking-wide">Margin:</span>
                                    <span className="text-purple-300 text-xs">{hoveredPoint.data.margin}%</span>
                                </div>
                            </div>
                            <div 
                                className="absolute -bottom-1.5 w-4 h-4 bg-slate-900 border-r border-b border-slate-700" 
                                style={arrowStyles}
                            ></div>
                        </div>
                    </div>
                )}

                <div className="relative w-full h-[350px] mt-2">
                    {chartData.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                             <GraphUp size={32} className="mb-2 text-slate-300"/>
                             No financial records generated yet.
                         </div>
                    ) : (
                        <svg viewBox="0 0 1000 350" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                                    <stop offset="80%" stopColor="#22c55e" stopOpacity="0.0" />
                                </linearGradient>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            {/* Y-Axis Grid Lines */}
                            {gridSteps.map((grid, idx) => (
                                <g key={`grid-${idx}`}>
                                    <text x={paddingLeft - 20} y={grid.cy + 4} fill="#64748b" fontSize="11" fontWeight="800" textAnchor="end">
                                        ₹{grid.val >= 1000 ? (grid.val/1000).toFixed(1) + 'k' : grid.val.toFixed(0)}
                                    </text>
                                    <line 
                                        x1={paddingLeft} y1={grid.cy} 
                                        x2={paddingLeft + graphWidth} y2={grid.cy} 
                                        stroke={grid.val === 0 ? "#cbd5e1" : "#f1f5f9"} 
                                        strokeWidth={grid.val === 0 ? "2" : "1.5"} 
                                        strokeDasharray={grid.val === 0 ? "none" : "6,6"} 
                                    />
                                </g>
                            ))}

                            {/* VERTICAL BARS */}
                            {chartData.map((d, idx) => {
                                const cx = getCx(idx, chartData.length);
                                const revH = (d.revenue / range) * graphHeight;
                                const revY = paddingTop + graphHeight - revH;
                                const expH = (d.expenses / range) * graphHeight;
                                const expY = paddingTop + graphHeight - expH;

                                return (
                                    <g key={`bars-${idx}`}>
                                        {d.revenue > 0 && (
                                            <rect 
                                                className="chart-bar"
                                                x={cx - barW - 2} y={revY} width={barW} height={revH} rx="3"
                                                fill="#60a5fa" 
                                                style={{ transformOrigin: `0px ${paddingTop + graphHeight}px` }}
                                            />
                                        )}
                                        {d.expenses > 0 && (
                                            <rect 
                                                className="chart-bar"
                                                x={cx + 2} y={expY} width={barW} height={expH} rx="3"
                                                fill="#f87171" 
                                                style={{ transformOrigin: `0px ${paddingTop + graphHeight}px` }}
                                            />
                                        )}
                                    </g>
                                );
                            })}

                            {/* GRADIENT SHADING AREA */}
                            <path 
                                ref={areaRef}
                                d={areaPathString} 
                                fill="url(#profitGradient)" 
                            />

                            {/* NET PROFIT LINE */}
                            <path 
                                ref={pathRef}
                                d={profitPathString} 
                                fill="none" 
                                stroke="#22c55e" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="drop-shadow-md"
                            />

                            {/* MOUSE INTERACTION BOUNDS */}
                            {chartData.map((d, idx) => {
                                const cx = getCx(idx, chartData.length);
                                const cy = paddingTop + graphHeight - (((d.profit - minVal) / range) * graphHeight);
                                if (d.revenue === 0 && d.expenses === 0 && d.profit === 0) return null;

                                return (
                                    <g 
                                        key={`node-${idx}`} 
                                        className="data-point opacity-0 cursor-pointer group"
                                        onMouseEnter={() => setHoveredPoint({ cx, cy, data: d })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    >
                                        <rect x={cx - groupWidth/2} y={paddingTop} width={groupWidth} height={graphHeight} fill="transparent" />
                                        <circle cx={cx} cy={cy} r="6" fill="#fff" stroke="#16a34a" strokeWidth="3" filter="url(#glow)" className="transition-all duration-300 group-hover:r-[9px] group-hover:stroke-[4px]" />
                                    </g>
                                )
                            })}
                            
                            {/* X-AXIS LABELS */}
                            {xLabels.map((lbl, idx) => (
                                <text 
                                    key={`xlabel-${idx}`} 
                                    x={lbl.cx} y={paddingTop + graphHeight + 25} 
                                    fill="#94a3b8" fontSize="11" fontWeight="800" textAnchor="middle"
                                >
                                    {lbl.date.toUpperCase()}
                                </text>
                            ))}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SellerAnalytics;