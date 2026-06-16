import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { BarChartLine, PieChartFill, Activity, BoxSeam } from 'react-bootstrap-icons';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

function AdminAnalytics() {
    const [data, setData] = useState(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/order/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
                setData(res.data);
            } catch (err) {
                console.error("Failed to load admin analytics");
            }
        };
        fetchData();
    }, []);

    // --- RE-USE DARK CYBER OGL SHADER FOR COHESION ---
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

        const vertex = `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
        const fragment = `precision highp float; varying vec2 vUv; uniform float uTime; void main() { vec2 uv = vUv; vec3 color1 = vec3(0.02, 0.04, 0.08); vec3 color2 = vec3(0.0, 0.15, 0.3); vec3 color3 = vec3(0.08, 0.0, 0.15); float noise1 = sin(uv.x * 2.0 + uTime * 0.3) * cos(uv.y * 3.0 + uTime * 0.2); float noise2 = sin(uv.y * 4.0 - uTime * 0.4) * cos(uv.x * 2.0 - uTime * 0.3); float mixVal = (noise1 + noise2) * 0.5 + 0.5; vec3 finalColor = mix(mix(color1, color2, mixVal), color3, sin(uTime * 0.2) * 0.5 + 0.5); gl_FragColor = vec4(finalColor, 1.0); }`;

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
        if (data) {
            animate('.analytics-card', { translateY: [40, 0], opacity: [0, 1], delay: stagger(150), duration: 1000, easing: 'easeOutExpo' });
        }
    }, [data]);

    return (
        <div className="relative min-h-[calc(100vh-4rem)] p-8">
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10 text-white">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <BarChartLine className="text-purple-400" /> Strategic Analytics
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium text-lg">Deep dive into segments, forecasting, and audit logs.</p>
                </div>

                {!data ? (
                    <div className="text-center text-purple-400 animate-pulse font-bold text-xl mt-32">Aggregating Data...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COL: FORECASTING & AUDIT */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* SIMPLE FORECAST TREND */}
                            <div className="analytics-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                                <h3 className="text-white font-black text-xl mb-6 flex items-center gap-3"><Activity className="text-green-400"/> Short-Term Performance Trend (14 Days)</h3>
                                <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-700 pb-2">
                                    {data.timeline.length === 0 ? <p className="text-slate-500">No data available.</p> : data.timeline.map((d, i) => {
                                        const maxRev = Math.max(...data.timeline.map(x => x.revenue));
                                        const h = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                                        return (
                                            <div key={i} className="flex flex-col items-center w-full group">
                                                <div className="w-full bg-blue-500/80 rounded-t-sm transition-all group-hover:bg-blue-400 relative" style={{height: `${h}%`, minHeight: '5%'}}>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100">₹{d.revenue}</div>
                                                </div>
                                                <span className="text-[9px] text-slate-500 mt-2 rotate-45 transform origin-left">{d.date}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* AUDIT LOGS */}
                            <div className="analytics-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                                <h3 className="text-white font-black text-xl mb-6">System Audit Log</h3>
                                <div className="space-y-3">
                                    {data.audit_logs.map((log, idx) => {
                                        const time = new Date(log.timestamp).toLocaleString();
                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <span className={`w-2 h-2 rounded-full ${log.type === 'auth' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{log.action}</p>
                                                        <p className="text-xs font-medium text-slate-400">Target: {log.entity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500">{time}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COL: PRODUCT SEGMENTS */}
                        <div className="analytics-card opacity-0 bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl h-max">
                            <h3 className="text-white font-black text-xl mb-6 flex items-center gap-3"><PieChartFill className="text-orange-400"/> Top Product Segments</h3>
                            
                            <div className="space-y-6">
                                {data.top_segments.length === 0 ? <p className="text-slate-500">No segment data.</p> : data.top_segments.map((seg, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-white line-clamp-1">{seg.name}</span>
                                            <span className="font-black text-emerald-400 shrink-0 ml-4">₹{seg.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-400" style={{width: `${(seg.revenue / data.top_segments[0].revenue) * 100}%`}}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Vol: {seg.qty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminAnalytics;