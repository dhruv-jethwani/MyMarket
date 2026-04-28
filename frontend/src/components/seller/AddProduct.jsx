import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { jwtDecode } from 'jwt-decode';
import { animate, stagger } from 'animejs';
import { CloudUpload, Image as ImageIcon, Trash, Plus, TagFill } from 'react-bootstrap-icons';

const productSchema = z.object({
    name: z.string().min(1, "Product Name is required"),
    description: z.string().min(1, "Description is required"),
    seller: z.string(),
    price: z.coerce.number().positive("Price must be greater than 0."),
    category: z.string().min(1, "Category is required"),
    stock_quantity: z.coerce.number().int().nonnegative("Quantity cannot be negative."),
    // Validating that an actual file was selected
    image: z.any().refine((files) => files?.length > 0, "Product image is required"),
    specifications: z.array(z.object({
        key: z.string().min(1, "Required"),
        value: z.string().min(1, "Required")
    }))
});

function AddProduct() {
    const formRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // Auth & Identity
    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : null;
    const user_id = decoded?.user_id || '';
    
    const { register, control, handleSubmit, watch, formState: { errors }, reset } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            seller: user_id,
            category: 'general',
            specifications: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "specifications"
    });

    // --- LIVE IMAGE PREVIEW LOGIC ---
    const uploadedImage = watch('image');
    
    useEffect(() => {
        if (uploadedImage && uploadedImage.length > 0) {
            const file = uploadedImage[0];
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
            
            // Clean up memory to avoid leaks
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setImagePreview(null);
        }
    }, [uploadedImage]);

    // --- DASHBOARD ANIMATIONS ---
    useEffect(() => {
        animate('.form-section', {
            scale: [0.95, 1],
            opacity: [0, 1],
            delay: stagger(100),
            duration: 800,
            easing: 'easeOutExpo'
        });
    }, []);

    const API = '/shop/product';

    async function onSubmit(data) {
        // Because we are sending a file, we MUST use FormData
        const formData = new FormData();
        
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('category', data.category);
        formData.append('stock_quantity', data.stock_quantity);
        formData.append('seller', data.seller);
        
        // Attach the physical image file
        formData.append('image', data.image[0]);

        // Stringify specs array since FormData only accepts strings/blobs
        const specsObj = data.specifications.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
        formData.append('specifications', JSON.stringify(specsObj));
        
        try {
            await axios.post(API, formData, {
                // Critical header for file uploads
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Product added successfully!");
            reset();
            setImagePreview(null);
        } catch (error) {
            console.error(error);
            alert("Failed to add product. Check console.");
        }
    }

    // Common Tailwind classes
    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-200 bg-slate-50 text-gray-900 transition-all";
    const labelStyle = "block text-sm font-bold text-slate-700 mt-4";
    const errorStyle = "text-[11px] font-bold text-red-500 mt-1 uppercase tracking-wide";

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 form-section opacity-0">
                <h2 className="text-3xl font-black text-slate-900">Add New Product</h2>
                <p className="text-slate-500 mt-1">Fill out the details below to list a new item in your inventory.</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Basic Details */}
                <div className="lg:col-span-2 space-y-2">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 form-section opacity-0">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Basic Information</h3>
                        
                        <label className={labelStyle}>Product Name</label>
                        <input {...register('name')} className={inputStyle} placeholder='e.g., Wireless Headphones' />
                        {errors.name && <p className={errorStyle}>{errors.name.message}</p>}

                        <label className={labelStyle}>Description</label>
                        <textarea 
                            {...register('description')} 
                            className={`${inputStyle} min-h-[120px] resize-y`} 
                            placeholder='Describe the features and benefits...'
                        />
                        {errors.description && <p className={errorStyle}>{errors.description.message}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Price (₹)</label>
                                <input type="number" step="0.01" {...register('price')} className={inputStyle} placeholder='0.00' />
                                {errors.price && <p className={errorStyle}>{errors.price.message}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Stock Quantity</label>
                                <input type="number" {...register('stock_quantity')} className={inputStyle} placeholder='e.g., 50' />
                                {errors.stock_quantity && <p className={errorStyle}>{errors.stock_quantity.message}</p>}
                            </div>
                        </div>

                        <label className={labelStyle}>Category</label>
                        <select {...register('category')} className={inputStyle}>
                            <option value='general'>General / Misc</option>
                            <option value='electronics'>Electronics</option>
                            <option value='food'>Food & Groceries</option>
                        </select>
                        {errors.category && <p className={errorStyle}>{errors.category.message}</p>}
                    </div>

                    {/* SPECIFICATIONS SECTION */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mt-6 form-section opacity-0">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TagFill className="text-blue-500" /> Specifications
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => append({ key: '', value: '' })}
                                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={18} /> Add Spec
                            </button>
                        </div>
                        
                        {fields.length === 0 && (
                            <p className="text-sm text-slate-400 italic text-center py-4">No specifications added yet.</p>
                        )}

                        <div className="space-y-3">
                            {fields.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <input {...register(`specifications.${index}.key`)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Brand" />
                                        {errors.specifications?.[index]?.key && <p className={errorStyle}>{errors.specifications[index].key.message}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <input {...register(`specifications.${index}.value`)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Sony" />
                                        {errors.specifications?.[index]?.value && <p className={errorStyle}>{errors.specifications[index].value.message}</p>}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => remove(index)}
                                        className="p-2 mt-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Image File Upload & Submit */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 form-section opacity-0 sticky top-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Product Image</h3>
                        
                        {/* CUSTOM FILE UPLOAD ZONE */}
                        <div className="relative group">
                            <input 
                                type="file" 
                                {...register('image')} 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            
                            <div className={`w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${errors.image ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 group-hover:bg-blue-50 group-hover:border-blue-300'}`}>
                                
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6 pointer-events-none">
                                        <CloudUpload size={40} className="mx-auto text-blue-500 mb-3" />
                                        <p className="text-sm font-bold text-slate-700">Click or drag image to upload</p>
                                        <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF</p>
                                    </div>
                                )}
                                
                                {/* Overlay for changing image once uploaded */}
                                {imagePreview && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <p className="text-white font-bold flex items-center gap-2">
                                            <ImageIcon /> Change Image
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {errors.image && <p className={errorStyle}>{errors.image.message}</p>}

                        <button 
                            type="submit" 
                            className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            Publish Product
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}

export default AddProduct;