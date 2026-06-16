import React, { useEffect, useState } from 'react';
import API from '../../api';
import { jwtDecode } from 'jwt-decode';
import { PencilSquare, Trash, TagFill, BoxSeam, PlusCircle, Check2Circle, X } from 'react-bootstrap-icons';
import { animate, stagger } from 'animejs';
import { useNavigate, Link } from 'react-router-dom';
import EditProduct from './EditProduct';

function ManageInventory() {
    const API = '/shop/seller';
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    
    const [editingProductId, setEditingProductId] = useState(null);
    
    // --- RESTOCK STATE ---
    const [restockProduct, setRestockProduct] = useState(null);
    const [restockQty, setRestockQty] = useState('');
    const [isRestocking, setIsRestocking] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUserId(decoded.user_id);
            get_products(decoded.user_id);
        }
    }, []);

    async function get_products(uId) {
        setIsLoading(true);
        try {
            const res = await API.post(API, { seller_id: uId });
            if (res.data && res.data.products) setProducts(res.data.products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
        try {
            await API.delete(`/shop/product/${productId}`);
            setProducts(products.filter(p => (p._id.$oid || p._id) !== productId));
        } catch (error) {
            alert("Could not delete product.");
        }
    };

    // --- SUBMIT RESTOCK ---
    const handleRestockSubmit = async (e) => {
        e.preventDefault();
        setIsRestocking(true);
        try {
            const pid = restockProduct._id.$oid || restockProduct._id;
            await API.patch(`/shop/product/${pid}/restock`, { quantity: parseInt(restockQty) });
            
            setProducts(products.map(p => {
                if ((p._id.$oid || p._id) === pid) {
                    return { ...p, stock_quantity: p.stock_quantity + parseInt(restockQty) };
                }
                return p;
            }));
            
            setRestockProduct(null);
            setRestockQty('');
        } catch (error) {
            console.error(error);
            alert("Failed to restock product.");
        } finally {
            setIsRestocking(false);
        }
    };

    useEffect(() => {
        if (!isLoading && products.length > 0 && !editingProductId) {
            animate('.inventory-card', {
                translateY: [30, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }, [products, isLoading, editingProductId]);

    if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400 font-bold"><BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Inventory...</div>;

    if (editingProductId) {
        return (
            <EditProduct 
                productId={editingProductId} 
                onCancel={() => setEditingProductId(null)} 
                onSuccess={() => { setEditingProductId(null); get_products(userId); }}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto relative">
            
            {/* RESTOCK MODAL */}
            {restockProduct && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[slideUp_0.3s_ease-out]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900">Add Stock</h3>
                            <button onClick={() => setRestockProduct(null)} className="text-slate-400 hover:text-slate-700"><X size={24}/></button>
                        </div>
                        
                        <p className="text-slate-600 mb-6 text-sm">
                            Adding stock for <span className="font-bold text-slate-900">{restockProduct.name}</span>. This will be recorded in your financial ledger as an inventory expense based on your cost price (<span className="text-blue-600 font-bold">₹{restockProduct.cost_price}/unit</span>).
                        </p>

                        <form onSubmit={handleRestockSubmit}>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Quantity to Add</label>
                            <input 
                                type="number" 
                                min="1"
                                required
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 text-gray-900 font-bold" 
                                placeholder="e.g., 50"
                            />
                            
                            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-500">Total Expense:</span>
                                <span className="text-lg font-black text-slate-900">
                                    ₹{(restockQty ? (restockQty * restockProduct.cost_price).toFixed(2) : '0.00')}
                                </span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isRestocking || !restockQty}
                                className="w-full mt-6 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                <Check2Circle size={20} /> {isRestocking ? 'Updating Ledger...' : 'Confirm Restock'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Manage Inventory</h2>
                    <p className="text-slate-500 mt-1">View, edit, restock, or remove your listed products.</p>
                </div>
                <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    Total Items: <span className="text-blue-600">{products.length}</span>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                    <BoxSeam size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700">No products found</h3>
                    <p className="text-slate-500 mt-2">You haven't listed any products yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => {
                        const productId = product._id.$oid || product._id;
                        return (
                            <div key={productId} className="inventory-card opacity-0 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                                {/* FIX 1: PREFIXED ROUTE */}
                                <Link to={`/seller/product/${productId}`} className="block h-48 bg-slate-100 overflow-hidden relative cursor-pointer group">
                                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 shadow-sm uppercase tracking-wide">
                                        {product.category}
                                    </div>
                                </Link>

                                <div className="p-5 flex-1 flex flex-col">
                                    {/* FIX 2: PREFIXED ROUTE */}
                                    <Link to={`/seller/product/${productId}`} className="hover:text-blue-600 transition-colors">
                                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                                    </Link>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 mb-4 flex-1">{product.description}</p>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                                            <p className="text-lg font-black text-blue-600">₹{product.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Stock</p>
                                            <p className={`text-lg font-black ${product.stock_quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                {product.stock_quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BAR */}
                                <div className="flex border-t border-slate-100 bg-slate-50">
                                    <button 
                                        onClick={() => setRestockProduct(product)}
                                        className="flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors border-r border-slate-200"
                                    >
                                        <PlusCircle size={14} /> Add Stock
                                    </button>
                                    <button 
                                        onClick={() => setEditingProductId(productId)}
                                        className="flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-200"
                                    >
                                        <PencilSquare size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(productId)}
                                        className="flex-1 py-3 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ManageInventory;