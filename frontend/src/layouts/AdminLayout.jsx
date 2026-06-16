import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { 
    Speedometer2, 
    People, 
    CardList, 
    BoxArrowRight, 
    PersonCircle,
    BarChartLine,
    Check2Circle
} from 'react-bootstrap-icons';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('Admin');
    const [globalToast, setGlobalToast] = useState({ visible: false, message: '' });
    const canvasRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.fullname) setAdminName(decoded.fullname);
            } catch (error) {
                console.error("Invalid token");
            }
        }

        if (location.state && location.state.loginToast) {
            setGlobalToast({ visible: true, message: location.state.loginToast });
            window.history.replaceState({}, document.title);
            setTimeout(() => setGlobalToast({ visible: false, message: '' }), 5000); 
        }
    }, [location]);

    // --- PLATFORM-WIDE PERSISTENT SHADER ---
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

        const fragment = `
			precision highp float;
			varying vec2 vUv;
			uniform float uTime;

			void main() {
				vec2 uv = vUv;

				vec3 color1 = vec3(0.98, 0.99, 1.0);
				vec3 color2 = vec3(0.93, 0.96, 1.0);
				vec3 color3 = vec3(0.96, 0.94, 1.0);

				float noise1 =
					sin(uv.x * 2.0 + uTime * 0.15) *
					cos(uv.y * 3.0 + uTime * 0.10);

				float noise2 =
					sin(uv.y * 4.0 - uTime * 0.20) *
					cos(uv.x * 2.0 - uTime * 0.15);

				float mixVal = (noise1 + noise2) * 0.5 + 0.5;

				vec3 finalColor =
					mix(
						mix(color1, color2, mixVal),
						color3,
						sin(uTime * 0.10) * 0.5 + 0.5
					);

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

    const menuItems = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <Speedometer2 size={20} /> },
        { path: '/admin/analytics', name: 'Strategic Analytics', icon: <BarChartLine size={20} /> },
        { path: '/admin/users', name: 'User Access Control', icon: <People size={20} /> },
        { path: '/admin/orders', name: 'Global Order Logs', icon: <CardList size={20} /> }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 overflow-hidden relative font-sans">
            
            {/* CANVAS BACKDROP */}
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90" />

            {/* TOAST SYSTEM */}
            {globalToast.visible && (
                <div className="fixed top-8 right-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-slate-900 font-bold bg-emerald-500 shadow-emerald-950/40 border border-emerald-400/20">
                    <Check2Circle size={24} />
                    {globalToast.message}
                </div>
            )}

            {/* SIDEBAR CONTAINER */}
            <aside className="w-66 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 backdrop-blur-xl border-r border-slate-200 flex flex-col z-10 relative">
                <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2">
                    <Link to="/" className="text-xl font-black text-slate-900 tracking-wider uppercase">
                        MyMarket
                    </Link>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                        Admin
                    </span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold tracking-wide transition-all duration-300 border ${
                                    isActive 
                                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                                    : 'text-slate-600 border-transparent hover:bg-white/5 hover:text-slate-900'
                                }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 font-bold tracking-wide hover:bg-red-500/10 hover:text-red-400 rounded-xl border border-transparent hover:border-red-500/20 transition-all duration-300"
                    >
                        <BoxArrowRight size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN DASHBOARD SHELL */}
            <div className="flex-1 flex flex-col z-10 relative overflow-hidden">
                <header className="h-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center gap-2.5 text-slate-600 font-semibold text-sm tracking-wide">
                        <Speedometer2 className="text-blue-500" size={16} />
                        <span>ADMINISTRATION</span>
                    </div>
                    
                    <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer">
						<div className="text-right hidden sm:block">
							<p className="text-xs font-black text-slate-900">{adminName}</p>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">ACTIVE SESSION</p>
						</div>
						<PersonCircle size={36} className="text-slate-300" />
					</Link>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}