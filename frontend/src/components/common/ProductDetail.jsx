import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import { ArrowLeft, TagFill, BoxSeam, ShieldCheck } from 'react-bootstrap-icons';

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await axios.get(`/shop/product/${id}`);
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
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
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
        <div className="max-w-6xl mx-auto py-8">
            {/* BACK BUTTON */}
            <button 
                onClick={() => navigate(-1)}
                className="detail-anim opacity-0 flex items-center gap-2 font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8"
            >
                <ArrowLeft /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                
                {/* LEFT: IMAGE */}
                <div className="detail-anim opacity-0 h-[400px] md:h-[500px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-4">
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain drop-shadow-md"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                {/* RIGHT: DETAILS */}
                <div className="detail-anim opacity-0 flex flex-col justify-center">
                    
                    <div className="mb-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-wider rounded-md">
                            {product.category}
                        </span>
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
                        {product.name}
                    </h1>
                    
                    <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-slate-100">
                        <span className="text-4xl font-black text-blue-600">${product.price}</span>
                        <span className={`text-sm font-bold uppercase tracking-wide ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                        </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    {/* SPECIFICATIONS */}
                    {product.specifications && product.specifications.length > 0 && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <TagFill className="text-blue-500" /> Technical Specifications
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                {product.specifications.map((spec, idx) => (
                                    <div key={idx} className="flex justify-between border-b border-slate-200 pb-2 last:border-0">
                                        <span className="text-sm font-bold text-slate-400">{spec.key}</span>
                                        <span className="text-sm font-semibold text-slate-800 text-right">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="flex items-center gap-6 mt-auto text-sm font-bold text-slate-400">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-green-500" /> Secure Transaction
                        </div>
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