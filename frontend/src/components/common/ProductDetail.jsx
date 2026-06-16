import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { animate, stagger } from 'animejs';
import { ArrowLeft, TagFill, BoxSeam, ShieldCheck } from 'react-bootstrap-icons';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const canvasRef = useRef(null);

    // --- FETCH PRODUCT DATA ---
    useEffect(() => {
        async function fetchProduct() {
            try {
                // Determine if we are in seller or store route based on URL to use correct endpoints if needed
                // Currently defaults to /shop/product/ API
                const res = await API.get(`/shop/product/${id}`);
                setProduct(res.data.product);
            } catch (error) {
                console.error("Failed to load product:", error);
                alert("Product not found!");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProduct();
    }, [id, navigate]);

    // --- PAGE ANIMATIONS ---
    useEffect(() => {
        if (!isLoading && product) {
            animate('.detail-anim', {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, product]);

    // --- OGL (WEBGL) BACKGROUND SHADER INTEGRATION ---
    useEffect(() => {
        if (isLoading || !product || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const renderer = new Renderer({ canvas, alpha: true, antialias: true });
        const gl = renderer.gl;
        const camera = new Camera(gl);
        camera.position.z = 1;

        // Ensure canvas fills the parent container completely
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

        // Simple vertex shader
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

        // Liquid gradient fragment shader matching your slate/blue theme
        const fragment = `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            
            void main() {
                vec2 uv = vUv;
                
                // Theme colors matching tailwind slate-50 / blue-50
                vec3 color1 = vec3(0.973, 0.980, 0.988); // slate-50
                vec3 color2 = vec3(0.937, 0.965, 1.0);   // blue-50
                vec3 color3 = vec3(0.941, 0.953, 0.969); // slate-100
                
                // Create a slow, moving fluid noise effect
                float noise1 = sin(uv.x * 4.0 + uTime * 0.8) * cos(uv.y * 3.0 + uTime * 0.5);
                float noise2 = sin(uv.y * 5.0 - uTime * 0.6) * cos(uv.x * 2.0 - uTime * 0.4);
                
                float mixVal = (noise1 + noise2) * 0.5 + 0.5;
                
                // Blend colors together smoothly based on time and coordinates
                vec3 finalColor = mix(mix(color1, color2, mixVal), color3, sin(uTime * 0.5) * 0.5 + 0.5);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        let animationId;
        function update(t) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001; // Scale time down for slow, premium movement
            renderer.render({ scene, camera });
        }
        animationId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [isLoading, product]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold">
                <BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Details...
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-0">
            
            {/* PREMIUM BACK BUTTON */}
            <div className="mb-8 detail-anim opacity-0">
                <button 
                    onClick={() => navigate(-1)}
                    className="group relative inline-flex items-center justify-center gap-3 bg-white border border-slate-200 px-6 py-2.5 rounded-full text-sm font-black text-slate-600 shadow-sm hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200 transition-all duration-300 overflow-hidden"
                >
                    {/* Background slide effect on hover */}
                    <div className="absolute inset-0 bg-blue-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                    
                    {/* Content */}
                    <span className="relative z-10 flex items-center gap-2 group-hover:text-blue-700 transition-colors duration-300">
                        {/* Arrow slides back visually on hover */}
                        <ArrowLeft className="group-hover:-translate-x-1.5 transition-transform duration-300 ease-out" strokeWidth={1.5} size={18} /> 
                        Return to Previous
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                
                {/* LEFT: IMAGE & OGL SHOWCASE */}
                <div className="detail-anim opacity-0 relative h-[400px] md:h-[550px] rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center p-8 group shadow-inner">
                    
                    {/* OGL WEBGL CANVAS MOUNTS HERE */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10" />
                    
                    {/* Subtle vignette for depth over the webgl */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/5 pointer-events-none -z-10"></div>

                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out z-10"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                {/* RIGHT: DETAILS */}
                <div className="detail-anim opacity-0 flex flex-col justify-center">
                    
                    <div className="mb-4">
                        <span className="px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                            {product.category}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                        {product.name}
                    </h1>
                    
                    <div className="flex items-end gap-5 mb-8 pb-8 border-b border-slate-100">
                        <span className="text-5xl font-black text-blue-600 tracking-tighter">₹{product.price}</span>
                        <span className={`text-sm font-bold uppercase tracking-widest mb-1.5 px-3 py-1 rounded-md ${product.stock_quantity > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                        </span>
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium">
                        {product.description}
                    </p>

                    {/* SPECIFICATIONS */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 shadow-sm">
                            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-5 text-lg">
                                <TagFill className="text-blue-500" /> Technical Specifications
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                {product.specifications.map((spec, idx) => (
                                    <div key={idx} className="flex justify-between border-b border-slate-200 pb-3 last:border-0">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">{spec.key}</span>
                                        <span className="text-sm font-black text-slate-800 text-right">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center gap-6 mt-auto text-sm font-bold text-slate-500 bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-green-500" /> Secure Transaction
                        </div>
                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <BoxSeam size={20} className="text-blue-500" /> Fast Delivery
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ProductDetail;