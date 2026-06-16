import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { Trash, BoxSeam, CartX, ArrowLeft, ShieldCheck, BagCheck } from 'react-bootstrap-icons';

function Cart() {
    const CART_API = '/cart/get_cart';
    const DELETE_API = '/cart/delete_item';
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoving, setIsRemoving] = useState(null);

    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : null;
    const userid = decoded?.user_id || '';

    useEffect(() => {
        const fetchCart = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const res = await axios.get(CART_API, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.cart) {
                    setCart(res.data.cart);
                }
            } catch (error) {
                console.error("Error fetching cart data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCart();
    }, [token, navigate]);

    useEffect(() => {
        if (!isLoading && cart?.items?.length > 0) {
            animate('.cart-item', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
            
            animate('.summary-box', {
                translateX: [20, 0],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, cart]);

    const handleRemoveItem = async (productId) => {
        setIsRemoving(productId);
        try {
            await axios.delete(DELETE_API, {
                data: {
                    user_id: userid,
                    product_id: productId
                }
            });

            setCart(prev => ({
                ...prev,
                items: prev.items.filter(item => {
                    const id = item.product?._id?.$oid || item.product?.$oid || item.product?.id;
                    return id !== productId;
                })
            }));
        } catch (error) {
            console.error("Failed to remove item:", error);
            alert("Could not remove item. Please try again.");
        } finally {
            setIsRemoving(null);
        }
    };

    const { subtotal, totalItems } = useMemo(() => {
        if (!cart?.items) return { subtotal: 0, totalItems: 0 };
        
        let sub = 0;
        let count = 0;
        cart.items.forEach(item => {
            const price = item.product?.price || 0;
            sub += (price * item.quantity);
            count += item.quantity;
        });
        
        return { subtotal: sub.toFixed(2), totalItems: count };
    }, [cart]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-slate-400 font-bold">
                <BoxSeam size={24} className="mr-2 animate-pulse" /> Loading your cart...
            </div>
        );
    }

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto mt-12 bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
                <CartX size={64} className="mx-auto text-slate-300 mb-6" />
                <h2 className="text-3xl font-black text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link 
                    to="/store" 
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <ArrowLeft size={18} /> Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
                <p className="text-slate-500 mt-1">Review your items before proceeding to checkout.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    {cart.items.map((item, index) => {
                        const productId = item.product?._id?.$oid || item.product?.$oid || item.product?.id || index;
                        const product = item.product || {};
                        const itemTotal = (product.price * item.quantity).toFixed(2);
                        const isBeingRemoved = isRemoving === productId;

                        return (
                            <div 
                                key={productId} 
                                className={`cart-item opacity-0 bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 ${isBeingRemoved ? 'scale-95 opacity-50 blur-[2px]' : 'hover:shadow-md'}`}
                            >
                                {/* FIX 5: PREFIXED ROUTE */}
                                <Link to={`/store/product/${productId}`} className="h-28 w-28 bg-slate-50 rounded-2xl p-2 flex-shrink-0 border border-slate-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain drop-shadow-sm" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BoxSeam size={24}/></div>
                                    )}
                                </Link>

                                <div className="flex-1 text-center sm:text-left w-full">
                                    {/* FIX 6: PREFIXED ROUTE */}
                                    <Link to={`/store/product/${productId}`} className="hover:text-blue-600 transition-colors">
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight mb-1">
                                            {product.name || "Unknown Product"}
                                        </h3>
                                    </Link>
                                    <p className="text-xl font-black text-blue-600 mb-3">₹{product.price || 0}</p>
                                    
                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                        <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-bold">
                                            Qty: {item.quantity}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subtotal</p>
                                        <p className="text-lg font-black text-slate-900">₹{itemTotal}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleRemoveItem(productId)}
                                        disabled={isBeingRemoved}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                                    >
                                        <Trash size={18} /> <span className="sm:hidden">Remove</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="w-full lg:w-96 lg:sticky top-8 self-start">
                    <div className="summary-box opacity-0 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Order Summary</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span className="font-medium">Items ({totalItems})</span>
                                <span className="font-bold">₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span className="font-medium">Shipping</span>
                                <span className="font-bold text-green-500">Free</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span className="font-medium">Estimated Tax</span>
                                <span className="font-bold text-slate-400">Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4 mb-8 flex justify-between items-end">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total</span>
                            <span className="text-3xl font-black text-slate-900">₹{subtotal}</span>
                        </div>

                        <Link 
                            to="/checkout"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <BagCheck size={20} /> Proceed to Checkout
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <ShieldCheck size={16} className="text-green-500" /> Secure SSL Encrypted Checkout
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Cart;