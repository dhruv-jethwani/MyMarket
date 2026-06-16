import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { Speedometer2, CurrencyDollar, Receipt, GraphUp, BarChartLine, Layers } from 'react-bootstrap-icons';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/order/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to load admin dashboard");
            }
        };
        fetchStats();
    }, []);

    // --- DARK MODE CYBER-FLUID SHADER ---
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const renderer = new Renderer({ canvas, alpha: true, antialias: true });
        const gl = renderer.gl;
        const camera = new Camera(gl);
        camera.position.z = 1;

        function resize() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        }
        window.addEventListener('resize', resize, false);
        resize();

        const scene = new Transform();
        const geometry = new Plane(gl);

        const vertex = `
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        // Dark Slate to Neon Cyan & Deep Purple mapping
        const fragment = `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            
            void main() {
                vec2 uv = vUv;
                vec3 color1 = vec3(0.02, 0.04, 0.08); // Deep Space
                vec3 color2 = vec3(0.0, 0.15, 0.3);   // Cyber Blue
                vec3 color3 = vec3(0.08, 0.0, 0.15);  // Deep Purple
                
                float noise1 = sin(uv.x * 2.0 + uTime * 0.3) * cos(uv.y * 3.0 + uTime * 0.2);
                float noise2 = sin(uv.y * 4.0 - uTime * 0.4) * cos(uv.x * 2.0 - uTime * 0.3);
                float mixVal = (noise1 + noise2) * 0.5 + 0.5;
                
                vec3 finalColor = mix(mix(color1, color2, mixVal), color3, sin(uTime * 0.2) * 0.5 + 0.5);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

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

    useEffect(() => {
        if (stats) {
            animate('.glass-card', {
                translateY: [40, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 1000,
                easing: 'easeOutExpo'
            });
            animate('.progress-fill', {
                width: [0, (el) => el.dataset.width],
                delay: 600,
                duration: 1500,
                easing: 'easeOutQuart'
            });
        }
    }, [stats]);

    const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

    return (
        <div className="relative min-h-[calc(100vh-4rem)] p-8">
            {/* FIXED BACKGROUND LAYER */}
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10 text-white">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <Speedometer2 className="text-blue-400" /> SBU Financial Overview
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium text-lg">Real-time bottom-line tracking and budget management.</p>
                </div>

                {!stats ? (
                    <div className="text-center text-blue-400 animate-pulse font-bold text-xl mt-32">Syncing with Mainframe...</div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* TOP TIER: PROFITABILITY METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
                                <CurrencyDollar size={32} className="text-blue-400 mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gross Revenue</p>
                                <p className="text-3xl font-black text-white mt-1">{formatCurrency(stats.revenue)}</p>
                            </div>
                            
                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-3xl -z-10 rounded-full"></div>
                                <Receipt size={28} className="text-red-400 mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Costs</p>
                                <p className="text-3xl font-black text-white mt-1">{formatCurrency(stats.costs)}</p>
                            </div>

                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl -z-10 rounded-full"></div>
                                <GraphUp size={28} className="text-green-400 mb-4" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Net Profit</p>
                                <p className="text-3xl font-black text-white mt-1">{formatCurrency(stats.profit)}</p>
                            </div>

                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Efficiency Ratings</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-sm text-slate-500 font-bold block mb-1">Profit Margin</span>
                                        <span className="text-2xl font-black text-emerald-400">{stats.margin}%</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-slate-500 font-bold block mb-1">Return on Inv.</span>
                                        <span className="text-2xl font-black text-purple-400">{stats.roi}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MID TIER: BUDGET VS ACTUAL & EVM */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* BUDGET TRACKER */}
                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                                <h3 className="text-white font-black text-xl mb-6 flex items-center gap-3"><BarChartLine className="text-orange-400"/> Target Revenue Budget</h3>
                                
                                <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                                    <span>Current: {formatCurrency(stats.revenue)}</span>
                                    <span>Target: {formatCurrency(stats.target_budget)}</span>
                                </div>
                                
                                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-6 border border-slate-700 shadow-inner">
                                    <div 
                                        className={`progress-fill h-full rounded-full bg-gradient-to-r ${stats.revenue >= stats.target_budget ? 'from-green-500 to-emerald-400' : 'from-orange-500 to-yellow-400'}`}
                                        data-width={`${Math.min((stats.revenue / stats.target_budget) * 100, 100)}%`}
                                    ></div>
                                </div>

                                <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                                    <span className="text-slate-400 font-bold text-sm">Budget Variance</span>
                                    <span className={`text-xl font-black ${stats.budget_variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stats.budget_variance >= 0 ? '+' : ''}{formatCurrency(stats.budget_variance)}
                                    </span>
                                </div>
                            </div>

                            {/* EVM (EARNED VALUE MANAGEMENT) */}
                            <div className="glass-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                                <h3 className="text-white font-black text-xl mb-6 flex items-center gap-3"><Layers className="text-purple-400"/> Earned Value Management</h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Planned Value (PV)</p>
                                        <p className="text-lg font-bold text-white">{formatCurrency(stats.evm.pv)}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Earned Value (EV)</p>
                                        <p className="text-lg font-bold text-white">{formatCurrency(stats.evm.ev)}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Actual Cost (AC)</p>
                                        <p className="text-lg font-bold text-red-400">{formatCurrency(stats.evm.ac)}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Cost Perf. Index</p>
                                        <p className={`text-lg font-bold ${stats.evm.cpi >= 1 ? 'text-green-400' : 'text-orange-400'}`}>{stats.evm.cpi} <span className="text-[10px] text-slate-600 font-normal ml-1">(&gt;1 is good)</span></p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;