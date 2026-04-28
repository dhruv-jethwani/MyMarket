import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { animate, stagger } from 'animejs';
import { CloudUpload, Image as ImageIcon, Trash, Plus, TagFill, X, Check2Circle } from 'react-bootstrap-icons';

const editSchema = z.object({
    name: z.string().min(1, "Product Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be greater than 0."),
    category: z.string().min(1, "Category is required"),
    stock_quantity: z.coerce.number().int().nonnegative("Quantity cannot be negative."),
    image: z.any().optional(), 
    specifications: z.array(z.object({
        key: z.string().min(1, "Required"),
        value: z.string().min(1, "Required")
    }))
});

// Notice it now takes PROPS instead of using useParams()
function EditProduct({ productId, onCancel, onSuccess }) {
    const formRef = useRef(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const { register, control, handleSubmit, watch, formState: { errors }, reset } = useForm({
        resolver: zodResolver(editSchema),
        defaultValues: { specifications: [] }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "specifications"
    });

    // --- FETCH PRODUCT DATA ---
    useEffect(() => {
        async function fetchProduct() {
            try {
                // Fetch using the prop passed down from ManageInventory
                const res = await axios.get(`/shop/product/${productId}`);
                const product = res.data.product;
                
                const formattedSpecs = product.specifications ? product.specifications.map(s => ({
                    key: s.key, value: s.value
                })) : [];

                reset({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    stock_quantity: product.stock_quantity,
                    specifications: formattedSpecs
                });

                setOriginalImage(product.image_url);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load product", error);
                alert("Failed to load product details.");
                onCancel(); // Send them back to the grid if it fails
            }
        }
        fetchProduct();
    }, [productId, reset, onCancel]);

    // --- LIVE IMAGE PREVIEW ---
    const uploadedImage = watch('image');
    useEffect(() => {
        if (uploadedImage && uploadedImage.length > 0) {
            const file = uploadedImage[0];
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(null);
        }
    }, [uploadedImage]);

    // --- PAGE ANIMATIONS ---
    useEffect(() => {
        if (!isLoading) {
            animate('.edit-section', {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }
    }, [isLoading]);

    const onSubmit = async (data) => {
        setIsSaving(true);
        const formData = new FormData();
        
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('category', data.category);
        formData.append('stock_quantity', data.stock_quantity);

        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        const specsObj = data.specifications.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
        formData.append('specifications', JSON.stringify(specsObj));
        
        try {
            await axios.patch(`/shop/product/${productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Call the success prop to tell the parent (ManageInventory) to refresh the grid
            onSuccess(); 
        } catch (error) {
            console.error(error);
            alert("Failed to update product.");
            setIsSaving(false);
        }
    };

    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 text-gray-900 transition-all";
    const labelStyle = "block text-sm font-bold text-slate-700 mt-4";
    const errorStyle = "text-[11px] font-bold text-red-500 mt-1 uppercase tracking-wide";

    if (isLoading) return <div className="p-8 font-bold text-slate-400 animate-pulse">Loading Product Data...</div>;

    return (
        <div className="w-full">
            <div className="mb-8 edit-section opacity-0 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">Edit Mode</h2>
                    <p className="text-sm text-slate-500 mt-1">Make changes to your product listing.</p>
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} /> Cancel
                    </button>
                    <button 
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95 disabled:opacity-70"
                    >
                        <Check2Circle size={18} /> {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <form ref={formRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Basic Details */}
                <div className="lg:col-span-2 space-y-2">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 edit-section opacity-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Basic Information</h3>
                        
                        <label className={labelStyle}>Product Name</label>
                        <input {...register('name')} className={inputStyle} />
                        {errors.name && <p className={errorStyle}>{errors.name.message}</p>}

                        <label className={labelStyle}>Description</label>
                        <textarea {...register('description')} className={`${inputStyle} min-h-[120px] resize-y`} />
                        {errors.description && <p className={errorStyle}>{errors.description.message}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Price ($)</label>
                                <input type="number" step="0.01" {...register('price')} className={inputStyle} />
                                {errors.price && <p className={errorStyle}>{errors.price.message}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Stock Quantity</label>
                                <input type="number" {...register('stock_quantity')} className={inputStyle} />
                                {errors.stock_quantity && <p className={errorStyle}>{errors.stock_quantity.message}</p>}
                            </div>
                        </div>

                        <label className={labelStyle}>Category</label>
                        <select {...register('category')} className={inputStyle}>
                            <option value='general'>General / Misc</option>
                            <option value='electronics'>Electronics</option>
                            <option value='food'>Food & Groceries</option>
                        </select>
                    </div>

                    {/* SPECIFICATIONS SECTION */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mt-6 edit-section opacity-0">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TagFill className="text-blue-500" /> Specifications
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => append({ key: '', value: '' })}
                                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                            >
                                <Plus size={18} /> Add Spec
                            </button>
                        </div>
                        
                        {fields.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No specifications added yet.</p>}

                        <div className="space-y-3">
                            {fields.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <input {...register(`specifications.${index}.key`)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="flex-1">
                                        <input {...register(`specifications.${index}.value`)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <button type="button" onClick={() => remove(index)} className="p-2 mt-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Image Upload */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 edit-section opacity-0 sticky top-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Product Image</h3>
                        
                        <div className="relative group">
                            <input type="file" {...register('image')} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            
                            <div className="w-full h-64 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden bg-slate-50 group-hover:border-blue-300">
                                {(imagePreview || originalImage) ? (
                                    <img src={imagePreview || originalImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6"><CloudUpload size={40} className="mx-auto text-blue-500 mb-3" /></div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-white font-bold flex items-center gap-2"><ImageIcon /> Change Image</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EditProduct;