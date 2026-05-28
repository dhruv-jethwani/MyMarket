import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { animate } from 'animejs';
import { CreditCard, ShieldCheck, Check2Circle, XCircle, ArrowLeft, BoxSeam } from 'react-bootstrap-icons';

function Checkout() {
    const GET_CART_API = '/cart/get_cart';
    const PLACE_ORDER_API = '/order/place_order'; 
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    // Payment Form State (Split expiry into Month and Year)
    const [cardData, setCardData] = useState({ number: '', expMonth: '', expYear: '', cvc: '', name: '' });

    const cardContainerRef = useRef(null);

    // Generate Date Picker Options
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    useEffect(() => {
        const loadCheckoutDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                const res = await axios.get(GET_CART_API, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.cart) setCart(res.data.cart);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCheckoutDetails();
    }, [navigate]);

    useEffect(() => {
        if (!isLoading && cart) {
            animate('.checkout-anim', {
                translateY: [40, 0],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading, cart]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    // --- SMART INPUT FORMATTING ---
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Strip all non-digits
        if (value.length > 16) value = value.slice(0, 16); // Strict 16 digit limit
        
        // Add a space after every 4 digits
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardData({ ...cardData, number: formattedValue });
    };

    const handleInputChange = (e) => {
        setCardData({ ...cardData, [e.target.name]: e.target.value });
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Tilt the card visually to signify processing state
        animate(cardContainerRef.current, {
            rotateY: [0, 15, 0],
            duration: 1000,
            loop: true,
            easing: 'easeInOutSine'
        });

        // 1. Simulate Gateway Network Latency
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                
                // Extract just the numbers for gateway validation
                const rawCardNumber = cardData.number.replace(/\s/g, '');

                // MOCK GATEWAY RULE 1: DECLINE
                if (rawCardNumber.startsWith('4000')) {
                    animate(cardContainerRef.current, { translateX: [-10, 10, -10, 10, 0], duration: 400 }); // Shake
                    showToast("Transaction Declined: Card Blocked by Mock Gateway", "error");
                    setIsProcessing(false);
                    return;
                }

                // 2. Submit Transaction payload to backend order engine
                const payload = {
                    user_id: decoded.user_id,
                    items: cart.items,
                    payment_status: "Paid",
                    gateway_ref: "MOCK_GW_" + Math.random().toString(36).substring(2, 9).toUpperCase()
                };

                await axios.post(PLACE_ORDER_API, payload);
                
                // MOCK GATEWAY RULE 2: SPECIFIC SUCCESS
                if (rawCardNumber.startsWith('2000')) {
                    showToast("VIP Payment Captured Successfully!", "success");
                } else {
                    showToast("Payment Captured Successfully!", "success");
                }
                
                setTimeout(() => navigate('/history'), 2000);

            } catch (err) {
                console.error(err);
                showToast("Failed to compile transactional order records.", "error");
                setIsProcessing(false);
            }
        }, 2500);
    };

    const totalPrice = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2) || '0.00';
    const displayExpiry = cardData.expMonth && cardData.expYear ? `${cardData.expMonth}/${cardData.expYear.slice(2)}` : 'MM/YY';

    if (isLoading) return <div className="flex items-center justify-center h-[60vh] text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Evaluating staging parameters...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            {toast.visible && (
                <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                    {toast.type === 'success' ? <Check2Circle size={24} /> : <XCircle size={24} />}
                    {toast.message}
                </div>
            )}

            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"><ArrowLeft size={18}/></button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Secure Sandbox Checkout</h1>
                    <p className="text-slate-500 mt-0.5">Test simulated gateway transaction protocols safely.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 checkout-anim opacity-0">
                    
                    {/* VISUAL MOCK CREDIT CARD */}
                    <div ref={cardContainerRef} className="bg-gradient-to-br from-slate-800 to-slate-950 p-6 rounded-3xl text-white shadow-xl max-w-sm relative overflow-hidden h-48 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <CreditCard size={32} className="text-slate-400"/>
                            <span className="text-xs font-black tracking-widest bg-white/10 px-2 py-1 rounded">SANDBOX GATEWAY</span>
                        </div>
                        <p className="text-xl font-mono tracking-widest my-4">{cardData.number || '•••• •••• •••• ••••'}</p>
                        <div className="flex justify-between text-xs font-mono">
                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Cardholder</p><p className="font-bold tracking-wide uppercase line-clamp-1">{cardData.name || 'Your Name'}</p></div>
                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Expires</p><p className="font-bold">{displayExpiry}</p></div>
                        </div>
                    </div>

                    {/* PAYMENT FORM */}
                    <form onSubmit={handlePaySubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                        
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Name on Card</label>
                            <input type="text" name="name" value={cardData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 font-semibold" placeholder="John Doe" disabled={isProcessing}/>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                            <input type="text" value={cardData.number} onChange={handleCardNumberChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 font-semibold font-mono tracking-wider" placeholder="•••• •••• •••• ••••" disabled={isProcessing}/>
                            <div className="flex gap-4 mt-2">
                                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Start with 2000 for Success</span>
                                <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">Start with 4000 to Decline</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Expiration Date</label>
                                <div className="flex gap-2">
                                    <select name="expMonth" value={cardData.expMonth} onChange={handleInputChange} required disabled={isProcessing} className="w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 font-semibold appearance-none cursor-pointer">
                                        <option value="" disabled>MM</option>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select name="expYear" value={cardData.expYear} onChange={handleInputChange} required disabled={isProcessing} className="w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 font-semibold appearance-none cursor-pointer">
                                        <option value="" disabled>YYYY</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Security Code (CVC)</label>
                                <input type="password" name="cvc" maxLength="3" value={cardData.cvc} onChange={handleInputChange} required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 font-semibold tracking-widest" placeholder="•••" disabled={isProcessing}/>
                            </div>
                        </div>

                        <button type="submit" disabled={isProcessing || cardData.number.replace(/\s/g, '').length !== 16} className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100">
                            {isProcessing ? 'Authorizing Fake Funds...' : `Authorize Mock Payment of ₹${totalPrice}`}
                        </button>
                    </form>
                </div>

                {/* Right Summary Column */}
                <div className="w-full checkout-anim opacity-0 self-start lg:sticky top-8">
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-100 pb-2">Order Breakdown</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto mb-4 pr-1">
                            {cart.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm font-semibold text-slate-600">
                                    <span className="line-clamp-1 flex-1">{item.product.name} <span className="text-blue-500">x{item.quantity}</span></span>
                                    <span className="text-slate-900 ml-2">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wide">Grand Total</span>
                            <span className="text-2xl font-black text-slate-900">₹{totalPrice}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <ShieldCheck size={18} className="text-green-500" /> Isolated Test Shell. No real bank accounts will be connected.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;