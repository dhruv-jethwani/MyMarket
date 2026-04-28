import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { PencilSquare, Trash, TagFill, BoxSeam } from 'react-bootstrap-icons'
import { animate, stagger } from 'animejs'
import { useNavigate, Link } from 'react-router-dom';
// IMPORT THE CHILD COMPONENT
import EditProduct from './EditProduct' 

function ManageInventory() {
    const API = '/shop/seller'
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState(null)
    
    // NEW STATE: Tracks which product we are editing. If null, show grid.
    const [editingProductId, setEditingProductId] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const decoded = jwtDecode(token)
            setUserId(decoded.user_id)
            get_products(decoded.user_id)
        }
    }, [])

    async function get_products(uId) {
        setIsLoading(true)
        try {
            const res = await axios.post(API, { seller_id: uId })
            if (res.data && res.data.products) {
                setProducts(res.data.products)
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // --- DELETE LOGIC ---
    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to permanently delete this product?")) return;

        try {
            await axios.delete(`/shop/product/${productId}`);
            // Instantly remove it from the UI so it feels lightning fast
            setProducts(products.filter(p => (p._id.$oid || p._id) !== productId));
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Could not delete product.");
        }
    };

    // Trigger animations when the grid loads
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
    }, [products, isLoading, editingProductId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 font-bold">
                <BoxSeam size={24} className="mr-2 animate-pulse" /> Loading Inventory...
            </div>
        )
    }

    // ==========================================
    // VIEW SWAP: If editing, show Edit component
    // ==========================================
    if (editingProductId) {
        return (
            <EditProduct 
                productId={editingProductId} 
                onCancel={() => setEditingProductId(null)} 
                onSuccess={() => {
                    // When saved successfully, close the edit screen and refresh the grid
                    setEditingProductId(null);
                    get_products(userId);
                }}
            />
        );
    }

    // ==========================================
    // DEFAULT VIEW: Show the Inventory Grid
    // ==========================================
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900">Manage Inventory</h2>
                    <p className="text-slate-500 mt-1">View, edit, or remove your listed products.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => {
                        const productId = product._id.$oid || product._id;

                        return (
                            <div key={productId} className="inventory-card opacity-0 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                                
                                {/* Wrap the Image in a Link */}
                                <Link to={`/product/${productId}`} className="block h-48 bg-slate-100 overflow-hidden relative cursor-pointer group">
                                    <img 
                                        src={product.image_url} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-700 shadow-sm uppercase tracking-wide">
                                        {product.category}
                                    </div>
                                </Link>

                                <div className="p-5 flex-1 flex flex-col">
										{/* Wrap the Title in a Link */}
										<Link to={`/product/${productId}`} className="hover:text-blue-600 transition-colors">
											<h3 className="text-lg font-bold text-slate-900 line-clamp-1">{product.name}</h3>
										</Link>

										<p className="text-sm text-slate-500 mt-1 line-clamp-2 mb-4 flex-1">
											{product.description}
										</p>

										{/* ... rest of your card ... */}

                                    {product.specifications && product.specifications.length > 0 && (
                                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
                                            <TagFill className="text-slate-300 shrink-0" size={14} />
                                            {product.specifications.slice(0, 2).map((s, idx) => (
                                                <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                    {s.key}: {s.value}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                                            <p className="text-lg font-black text-blue-600">${product.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Stock</p>
                                            <p className={`text-lg font-black ${product.stock_quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                {product.stock_quantity}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex border-t border-slate-100 bg-slate-50">
                                    {/* WIRE UP THE EDIT BUTTON */}
                                    <button 
                                        onClick={() => setEditingProductId(productId)}
                                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <PencilSquare size={16} /> Edit
                                    </button>
                                    <div className="w-px bg-slate-200"></div>
                                    
                                    {/* WIRE UP THE DELETE BUTTON */}
                                    <button 
                                        onClick={() => handleDelete(productId)}
                                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash size={16} /> Delete
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

export default ManageInventory