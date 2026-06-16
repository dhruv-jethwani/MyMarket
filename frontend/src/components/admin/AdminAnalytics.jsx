import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { BarChartLine, PieChartFill, Activity, BoxSeam } from 'react-bootstrap-icons';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const canvasRef = useRef(null);
    const pathRef = useRef(null);
    const areaRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/order/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
                setData(res.data);
            } catch (err) {
                console.error("Failed to load admin analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- PREMIUM LIGHT OGL SHADER (Soft Indigo & Cyan Aura) ---
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const renderer = new Renderer({ canvas, alpha: true, antialias: true });
        const gl = renderer.gl;
        const camera = new Camera(gl);
        camera.position.z = 1;

        function resize() {
            const parent = canvas.parentElement;
            if (parent) {
                renderer.setSize(parent.clientWidth, parent.clientHeight);
                camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
            }
        }
        window.addEventListener('resize', resize, false);
        resize();

        const scene = new Transform();
        const geometry = new Plane(gl);

        // Light premium shader: ivory, soft indigo wash, pale cyan
        const vertex = `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
        const fragment = `precision highp float; varying vec2 vUv; uniform float uTime; void main() { vec2 uv = vUv; vec3 color1 = vec3(0.96, 0.96, 1.0); vec3 color2 = vec3(0.88, 0.92, 1.0); vec3 color3 = vec3(0.93, 0.96, 1.0); float noise1 = sin(uv.x * 2.0 + uTime * 0.3) * cos(uv.y * 3.0 + uTime * 0.2); float noise2 = sin(uv.y * 4.0 - uTime * 0.4) * cos(uv.x * 2.0 - uTime * 0.3); float mixVal = (noise1 + noise2) * 0.5 + 0.5; vec3 finalColor = mix(mix(color1, color2, mixVal), color3, sin(uTime * 0.2) * 0.5 + 0.5); gl_FragColor = vec4(finalColor, 1.0); }`;

        const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 } } });
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        let animationId;
        function update(t) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.0005;
            renderer.render({ scene, camera });
        }
        update(0);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // --- ANIMATIONS ---
    useEffect(() => {
        if (!isLoading && data) {
            setTimeout(() => {
                animate('.analytics-card', { translateY: [40, 0], opacity: [0, 1], delay: stagger(150), duration: 1000, easing: 'easeOutExpo' });

                if (pathRef.current && areaRef.current) {
                    const length = pathRef.current.getTotalLength();
                    pathRef.current.style.strokeDasharray = length;
                    pathRef.current.style.strokeDashoffset = length;
                    areaRef.current.style.opacity = 0;

                    animate(pathRef.current, { strokeDashoffset: [length, 0], duration: 1500, easing: 'easeInOutQuart', delay: 500 });
                    animate(areaRef.current, { opacity: [0, 1], duration: 1000, easing: 'easeOutSine', delay: 500 });
                    animate('.data-point', { scale: [0, 1], opacity: [0, 1], delay: stagger(30, { start: 1000 }), duration: 600, easing: 'easeOutBack' });
                }
            }, 50);
        }
    }, [isLoading, data]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-indigo-500 animate-pulse font-bold text-xl">
            <BoxSeam size={24} className="mr-3" /> Aggregating Strategic Data...
        </div>
    );

    // --- CHART MATH & SCALING ---
    const chartData = data?.timeline || [];
    const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), 100) : 100;
    const minVal = 0; 
    const range = (maxVal - minVal) || 1;

    const paddingLeft = 100; 
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 40;
    const graphWidth = 1000 - paddingLeft - paddingRight;
    const graphHeight = 300 - paddingTop - paddingBottom; 
    const innerOffset = 40; 
    const activeWidth = graphWidth - (innerOffset * 2);

    const getCx = (idx, length) => {
        if (length === 1) return paddingLeft + graphWidth / 2;
        return paddingLeft + innerOffset + (idx / (length - 1)) * activeWidth;
    };

    const generatePath = (timeline) => {
        if (timeline.length === 0) return '';
        if (timeline.length === 1) {
            const cy = paddingTop + graphHeight - (((timeline[0].revenue - minVal) / range) * graphHeight);
            return `M ${paddingLeft},${cy} L ${paddingLeft + graphWidth},${cy}`; 
        }
        return 'M ' + timeline.map((d, idx) => {
            const cx = getCx(idx, timeline.length);
            const cy = paddingTop + graphHeight - (((d.revenue - minVal) / range) * graphHeight);
            return `${cx},${cy}`;
        }).join(' L ');
    };

    const linePathString = generatePath(chartData);
    const areaPathString = linePathString 
        ? `${linePathString} L ${chartData.length === 1 ? paddingLeft + graphWidth : getCx(chartData.length - 1, chartData.length)},${paddingTop + graphHeight} L ${chartData.length === 1 ? paddingLeft : getCx(0, chartData.length)},${paddingTop + graphHeight} Z`
        : '';

    const gridSteps = [0, 1, 2, 3, 4].map(i => {
        const val = minVal + (range / 4) * i;
        const cy = paddingTop + graphHeight - (i / 4) * graphHeight;
        return { val, cy };
    });

    const xLabels = [];
    if (chartData.length > 0) {
        const steps = Math.min(chartData.length, 7);
        for (let i = 0; i < steps; i++) {
            const idx = Math.floor(i * (chartData.length - 1) / Math.max(steps - 1, 1));
            const cx = getCx(idx, chartData.length);
            xLabels.push({ cx, date: chartData[idx].date });
        }
    }

    const groupWidth = chartData.length > 1 ? (activeWidth / (chartData.length - 1)) : activeWidth;

    // --- TOOLTIP CLAMP LOGIC ---
    let tooltipStyles = {};
    let arrowStyles = {};
    if (hoveredPoint) {
        const cxPercent = (hoveredPoint.cx / 1000) * 100;
        const arrowPercent = Math.max(15, Math.min(85, cxPercent));
        tooltipStyles = {
            left: `${cxPercent}%`,
            top: `${(hoveredPoint.cy / 300) * 100}%`,
            transform: `translate(-${arrowPercent}%, -110%)`
        };
        arrowStyles = {
            left: `${arrowPercent}%`,
            transform: 'translateX(-50%) rotate(45deg)'
        };
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)] p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 shadow-inner">
            
            {/* ABSOLUTE BACKGROUND LAYER */}
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10 drop-shadow-sm">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4 text-slate-800">
                        <BarChartLine className="text-indigo-500 drop-shadow-md" /> Strategic Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Deep dive into segments, forecasting, and audit logs.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COL: FORECASTING & AUDIT */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* SVG TREND GRAPH */}
                        <div className="analytics-card opacity-0 bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/40 relative">
                            <h3 className="text-slate-800 font-black text-xl mb-6 flex items-center gap-3">
                                <Activity className="text-emerald-500"/> Short-Term Trajectory (14 Days)
                            </h3>
                            
                            {/* FLOATING TOOLTIP */}
                            {hoveredPoint && (
                                <div className="absolute z-50 pointer-events-none pb-4 drop-shadow-2xl transition-all duration-100" style={tooltipStyles}>
                                    <div className="bg-white text-slate-800 p-3 rounded-xl min-w-[120px] shadow-2xl shadow-indigo-100/50 relative border border-indigo-100 text-center">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{hoveredPoint.data.date}</p>
                                        <p className="text-lg font-black text-emerald-600">₹{hoveredPoint.data.revenue.toLocaleString()}</p>
                                        <div className="absolute -bottom-1.5 w-3 h-3 bg-white border-r border-b border-indigo-100" style={arrowStyles}></div>
                                    </div>
                                </div>
                            )}

                            <div className="relative w-full h-[300px] mt-2">
                                <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                    <defs>
                                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>

                                    {gridSteps.map((grid, idx) => (
                                        <g key={`grid-${idx}`}>
                                            <text x={paddingLeft - 20} y={grid.cy + 4} fill="#94a3b8" fontSize="11" fontWeight="800" textAnchor="end">
                                                ₹{grid.val >= 1000 ? (grid.val/1000).toFixed(1) + 'k' : grid.val.toFixed(0)}
                                            </text>
                                            <line x1={paddingLeft} y1={grid.cy} x2={paddingLeft + graphWidth} y2={grid.cy} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6,6" />
                                        </g>
                                    ))}

                                    <path ref={areaRef} d={areaPathString} fill="url(#trendGradient)" />
                                    <path ref={pathRef} d={linePathString} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md" />

                                    {chartData.map((d, idx) => {
                                        const cx = getCx(idx, chartData.length);
                                        const cy = paddingTop + graphHeight - (((d.revenue - minVal) / range) * graphHeight);
                                        return (
                                            <g key={`node-${idx}`} className="data-point opacity-0 cursor-pointer group"
                                                onMouseEnter={() => setHoveredPoint({ cx, cy, data: d })}
                                                onMouseLeave={() => setHoveredPoint(null)}>
                                                <rect x={cx - groupWidth/2} y={paddingTop} width={groupWidth} height={graphHeight} fill="transparent" />
                                                <circle cx={cx} cy={cy} r="5" fill="#fff" stroke="#6366f1" strokeWidth="3" filter="url(#glow)" className="transition-all duration-300 group-hover:r-[8px] group-hover:stroke-[4px]" />
                                            </g>
                                        )
                                    })}
                                    
                                    {xLabels.map((lbl, idx) => (
                                        <text key={`xlabel-${idx}`} x={lbl.cx} y={paddingTop + graphHeight + 25} fill="#94a3b8" fontSize="11" fontWeight="800" textAnchor="middle">
                                            {lbl.date.toUpperCase()}
                                        </text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* AUDIT LOGS */}
                        <div className="analytics-card opacity-0 bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/40">
                            <h3 className="text-slate-800 font-black text-xl mb-6">System Audit Log</h3>
                            <div className="space-y-3">
                                {data.audit_logs.map((log, idx) => {
                                    const time = new Date(log.timestamp).toLocaleString();
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-2 h-2 rounded-full ${log.type === 'auth' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`}></span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-0.5">Target: {log.entity}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400">{time}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COL: PRODUCT SEGMENTS */}
                    <div className="analytics-card opacity-0 bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/40 h-max">
                        <h3 className="text-slate-800 font-black text-xl mb-6 flex items-center gap-3">
                            <PieChartFill className="text-amber-500"/> Top Product Segments
                        </h3>
                        
                        <div className="space-y-6">
                            {data.top_segments.length === 0 ? (
                                <p className="text-slate-400 font-bold">No segment data available yet.</p>
                            ) : data.top_segments.map((seg, idx) => (
                                <div key={idx} className="group cursor-default">
                                    <div className="flex justify-between items-end text-sm mb-2">
                                        <span className="font-bold text-slate-700 line-clamp-1 group-hover:text-amber-600 transition-colors">{seg.name}</span>
                                        <span className="font-black text-emerald-600 shrink-0 ml-4">₹{seg.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400" style={{width: `${(seg.revenue / Math.max(data.top_segments[0].revenue, 1)) * 100}%`}}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vol: {seg.qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AdminAnalytics;