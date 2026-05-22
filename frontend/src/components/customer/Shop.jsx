import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { animate, stagger } from 'animejs';
import { Search, BoxSeam, Check2Circle, XCircle, Plus, Dash, Filter } from 'react-bootstrap-icons';

function Shop() {
    const API_PRODUCTS = '/shop/product';
    const API_CART = '/cart/add_cart';
    const CART_API = '/cart/get_cart';
    const navigate = useNavigate();
    
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // FILTERS STATE
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    // LOCAL CART STAGING & BASELINE
    const [localCart, setLocalCart] = useState({});
    const [dbCartState, setDbCartState] = useState({}); // NEW: Tracks the original DB state

    // --- FETCH DATA (PRODUCTS & EXISTING CART) ---
    useEffect(() => {
        const loadStoreData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Products
                const prodRes = await axios.get(API_PRODUCTS);
                if (prodRes.data && prodRes.data.products) {
                    setProducts(prodRes.data.products);
                }

                // 2. Fetch Cart (If user is logged in)
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    const cartRes = await axios.get(CART_API, {
                        headers: { Authorization: `Bearer ${currentToken}` }
                    });
                    
                    if (cartRes.data && cartRes.data.cart) {
                        setCart(cartRes.data.cart);
                        
                        // Populate local staging cart so UI instantly reflects database cart
                        if (cartRes.data.cart.items) {
                            const existingCart = {};
                            cartRes.data.cart.items.forEach(item => {
                                const pid = item.product?._id?.$oid || item.product?.$oid || item.product?.id;
                                if (pid) {
                                    existingCart[pid] = item.quantity;
                                }
                            });
                            setLocalCart(existingCart);
                            setDbCartState(existingCart); // Set the baseline
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading store data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoreData();
    }, []);

    // --- ENTRANCE ANIMATIONS ---
    useEffect(() => {
        if (!isLoading && products.length > 0) {
            animate('.product-card', {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(50),
                duration: 800,
                easing: 'easeOutExpo'
            });
            
            animate('.filter-panel', {
                translateY: [-20, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [products, isLoading]);

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    // --- LOCAL CART LOGIC ---
    const handleAddLocal = (productId, stockQuantity, e) => {
        e.preventDefault(); 
        e.stopPropagation();

        setLocalCart(prev => {
            const currentQty = prev[productId] || 0;
            if (currentQty >= stockQuantity) {
                showToast("Cannot add more than available stock", "error");
                return prev;
            }
            return { ...prev, [productId]: currentQty + 1 };
        });
    };

    const handleRemoveLocal = (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        setLocalCart(prev => {
            if (!prev[productId]) return prev;
            
            const newCart = { ...prev };
            newCart[productId] -= 1;
            
            if (newCart[productId] <= 0) {
                delete newCart[productId];
            }
            return newCart;
        });
    };

    const handleConfirmCart = async () => {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.user_id;

            const payload = {
                user: userId,
                items: localCart
            };

            await axios.post(API_CART, payload);
            showToast("Cart updated successfully!", "success");
            
            // Update the baseline so the footer accurately reflects the new saved state
            setDbCartState({...localCart}); 
        } catch (error) {
            console.error(error);
            showToast("Failed to save cart.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- DERIVED DATA & FILTERS ---
    const uniqueCategories = useMemo(() => {
        const categories = products.map(p => p.category);
        return ['All', ...new Set(categories)];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = product.name.toLowerCase().includes(searchLower) || 
                                  product.description.toLowerCase().includes(searchLower);
            
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            
            const matchesMin = minPrice === '' || product.price >= parseFloat(minPrice);
            const matchesMax = maxPrice === '' || product.price <= parseFloat(maxPrice);

            return matchesSearch && matchesCategory && matchesMin && matchesMax;
        });
    }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

    const { totalItems, totalPrice } = useMemo(() => {
        let items = 0;
        let price = 0;
        Object.entries(localCart).forEach(([id, qty]) => {
            const product = products.find(p => (p._id.$oid || p._id) === id);
            if (product) {
                items += qty;
                price += (product.price * qty);
            }
        });
        return { totalItems: items, totalPrice: price.toFixed(2) };
    }, [localCart, products]);

    // NEW LOGIC: Show footer if there are items OR if the local cart differs from the DB cart
    const hasStagedItems = Object.keys(localCart).length > 0;
    const hasUnsavedChanges = JSON.stringify(localCart) !== JSON.stringify(dbCartState);
    const showFooter = hasStagedItems || hasUnsavedChanges;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                <BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Storefront...
            </div>
        );
    }

    return (
        <div className={`max-w-7xl mx-auto relative ${showFooter ? 'pb-32' : 'pb-8'}`}>
            
            {/* TOAST NOTIFICATION */}
            {toast.visible && (
                <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                    {toast.type === 'success' ? <Check2Circle size={24} /> : <XCircle size={24} />}
                    {toast.message}
                </div>
            )}

            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-900">Market</h2>
                <p className="text-slate-500 mt-1">Discover our latest products and deals.</p>
            </div>

            {/* FILTER PANEL */}
            <div className="filter-panel opacity-0 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative w-full lg:flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-slate-400" size={16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all text-sm font-semibold text-slate-700"
                    />
                </div>

                <div className="w-px h-8 bg-slate-200 hidden lg:block"></div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="flex-1 sm:w-48 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="text-slate-400" size={16} />
                        </div>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
                        >
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 flex-1 sm:w-64">
                        <input 
                            type="number" 
                            placeholder="Min ₹" 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all text-sm font-semibold text-slate-700"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input 
                            type="number" 
                            placeholder="Max ₹" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all text-sm font-semibold text-slate-700"
                        />
                    </div>
                </div>
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center mt-8">
                    <Search size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">No products found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setMinPrice(''); setMaxPrice(''); }}
                        className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                        const productId = product._id.$oid || product._id;
                        const qtyInCart = localCart[productId] || 0;

                        return (
                            <div key={productId} className="product-card opacity-0 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative">
                                
                                {/* Badge clearly shows items currently in cart */}
                                {qtyInCart > 0 && (
                                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-black h-8 w-8 flex items-center justify-center rounded-full shadow-lg shadow-blue-200">
                                        {qtyInCart}
                                    </div>
                                )}

                                <Link to={`/product/${productId}`} className="block h-48 bg-slate-50 overflow-hidden relative cursor-pointer p-4 flex items-center justify-center">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name} 
                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-black px-2.5 py-1 rounded-md text-blue-600 shadow-sm uppercase tracking-wider border border-blue-100">
                                        {product.category}
                                    </div>
                                    {product.stock_quantity === 0 && (
                                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                            <span className="bg-red-500 text-white font-black px-3 py-1 rounded-md text-xs uppercase tracking-wider shadow-sm">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}
                                </Link>

                                <div className="p-5 flex-1 flex flex-col justify-between border-t border-slate-50">
                                    <div className="mb-4 text-center">
                                        <Link to={`/product/${productId}`} className="hover:text-blue-600 transition-colors">
                                            <h3 className="text-sm font-black text-slate-900 line-clamp-2">{product.name}</h3>
                                        </Link>
                                        <div className="mt-1">
                                            <span className="text-lg font-black text-blue-600">₹{product.price}</span>
                                        </div>
                                        <p className={`text-xs font-bold mt-1 ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-center gap-3 mt-auto">
                                        <button 
                                            onClick={(e) => handleRemoveLocal(productId, e)}
                                            disabled={qtyInCart === 0}
                                            className="h-10 w-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-90 transition-all disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                                        >
                                            <Dash size={20} strokeWidth={1} />
                                        </button>
                                        
                                        <span className="w-8 text-center font-black text-slate-900">
                                            {qtyInCart}
                                        </span>

                                        <button 
                                            onClick={(e) => handleAddLocal(productId, product.stock_quantity, e)}
                                            disabled={product.stock_quantity === 0 || qtyInCart >= product.stock_quantity}
                                            className="h-10 w-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white active:scale-90 transition-all disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                                        >
                                            <Plus size={20} strokeWidth={1} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* --- STRICTLY CONDITIONAL FOOTER --- */}
            {showFooter && (
                <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] py-4 px-6 md:px-12 z-50 flex flex-col sm:flex-row items-center justify-between animate-[slideUp_0.4s_ease-out_forwards]">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                        <p className={`text-xs font-bold uppercase tracking-wide ${hasUnsavedChanges ? 'text-orange-500' : 'text-slate-400'}`}>
                            {hasUnsavedChanges ? 'Unsaved Changes' : 'Cart Items'}
                        </p>
                        <div className="flex items-baseline gap-6 justify-center sm:justify-start">
                            <span className="text-2xl font-black text-slate-900">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                            <span className="text-lg font-bold text-blue-600">Total: ₹{totalPrice}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full sm:w-auto">
                        {totalItems > 0 && (
                            <button 
                                onClick={() => setLocalCart({})}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button 
                            onClick={handleConfirmCart}
                            disabled={isSubmitting || !hasUnsavedChanges}
                            className={`flex-1 sm:flex-none px-8 py-3 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${hasUnsavedChanges ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                        >
                            {isSubmitting ? 'Saving...' : (totalItems === 0 ? 'Save Empty Cart' : 'Save Cart')}
                        </button>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Shop;