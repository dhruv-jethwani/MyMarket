import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom' // Added Link in case you want a "Login instead" footer
import { animate, stagger } from 'animejs';

const registerSchema = z.object({
    fullname: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid Email Address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Include at least one uppercase letter")
        .regex(/[0-9]/, "Include at least one number"),
    address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        zip_code: z.coerce.number().int().positive("Invalid Zip Code")
    }),
    role: z.string()
})

function Register() {
    const [showPassword, setShowPassword] = useState(false)
    const cardRef = useRef(null);
    const buttonRef = useRef(null);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'customer'
        }
    })

    const passwordValue = watch("password", "");

    // Logic for the strength bar
    const calculateStrength = () => {
        let strength = 0;
        if (passwordValue.length >= 8) strength += 33;
        if (/[A-Z]/.test(passwordValue)) strength += 33;
        if (/[0-9]/.test(passwordValue)) strength += 34;
        return strength;
    };

    const strength = calculateStrength();
    const strengthColor = strength < 66 ? 'bg-orange-500' : strength < 100 ? 'bg-yellow-500' : 'bg-green-500';

    const API = '/auth/register'

    // --- HIGH-END ANIMATION SEQUENCE ---
    useEffect(() => {
        // 1. The Card: Slight scale up with a dynamic tilt
        animate(cardRef.current, {
            scale: [0.85, 1],
            rotate: [-2, 0],
            opacity: [0, 1],
            duration: 1200,
            easing: 'easeOutElastic(1, .8)'
        });

        // 2. The Header: Drops down
        animate('.header-anim', {
            translateY: [-30, 0],
            opacity: [0, 1],
            delay: stagger(100, { start: 200 }),
            duration: 1000,
            easing: 'easeOutExpo'
        });

        // 3. The Form: 3D "Unfolding" effect cascading down the fields
        animate('.form-anim', {
            translateY: [40, 0],
            rotateX: [-90, 0], 
            opacity: [0, 1],
            // Slightly faster stagger (100ms) here since there are many fields
            delay: stagger(100, { start: 500 }),
            duration: 1200,
            easing: 'easeOutBack'
        });
    }, []);

    // --- MICRO-INTERACTIONS ---
    const handleBtnHover = () => {
        animate(buttonRef.current, {
            scale: 1.03,
            translateY: -3, 
            boxShadow: '0px 20px 25px -5px rgba(37, 99, 235, 0.4)', 
            duration: 500,
            easing: 'easeOutElastic(1, .6)'
        });
    };

    const handleBtnLeave = () => {
        animate(buttonRef.current, {
            scale: 1,
            translateY: 0,
            boxShadow: '0px 10px 15px -3px rgba(37, 99, 235, 0.2)', 
            duration: 400,
            easing: 'easeOutExpo'
        });
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
        animate('.eye-icon', {
            rotate: [0, 360], 
            duration: 600,
            easing: 'easeOutBack'
        });
    };

    async function onSubmit(data) {
        try {
            const res = await axios.post(API, data)
            console.log(res)
            alert("Registration Successful!")
            reset()
        } catch (error) {
            console.error(error)
            alert("Registration failed. Check console for details.")
        }
    }

    const inputStyle = "w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300 bg-white text-gray-900 transition-all shadow-sm";
    const labelStyle = "block text-sm font-semibold text-gray-700 mt-5";
    const errorStyle = "text-[11px] font-medium text-red-500 mt-1";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="header-anim opacity-0">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Join the Marketplace
                    </h2>
                </div>
                <div className="header-anim opacity-0">
                    <p className="mt-2 text-sm text-slate-500">Create your account to start shopping</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div 
                    ref={cardRef}
                    style={{ perspective: '1000px' }} 
                    className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-12 opacity-0"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 form-anim opacity-0 origin-bottom">
                            <div>
                                <label className={labelStyle}>Full Name</label>
                                <input {...register("fullname")} className={inputStyle} placeholder="John Doe" />
                                {errors.fullname && <p className={errorStyle}>{errors.fullname.message}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Username</label>
                                <input {...register("username")} className={inputStyle} placeholder="johndoe" />
                                {errors.username && <p className={errorStyle}>{errors.username.message}</p>}
                            </div>
                        </div>

                        <div className="form-anim opacity-0 origin-bottom">
                            <label className={labelStyle}>Email Address</label>
                            <input {...register("email")} type="email" className={inputStyle} placeholder="you@example.com" />
                            {errors.email && <p className={errorStyle}>{errors.email.message}</p>}
                        </div>

                        {/* PASSWORD SECTION WITH EYE ICON */}
                        <div className="form-anim opacity-0 origin-bottom">
                            <label className={labelStyle}>Password</label>
                            <div className="relative flex items-center">
                                <input 
                                    {...register("password")} 
                                    type={showPassword ? "text" : "password"} 
                                    className={`${inputStyle} !mt-1 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="••••••••"
                                    style={{ paddingRight: '45px' }}
                                />
                                <button 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 eye-icon mt-0.5" 
                                    type="button" 
                                    onClick={handleTogglePassword}
                                >
                                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            
                            {/* Strength Bar */}
                            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ease-out ${strengthColor}`} 
                                    style={{ width: `${strength}%` }}
                                />
                            </div>

                            {/* Requirement Grid */}
                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                                <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider transition-colors ${passwordValue.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${passwordValue.length >= 8 ? 'bg-green-600' : 'bg-slate-300'}`} />
                                    8+ Characters
                                </div>
                                <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider transition-colors ${/[A-Z]/.test(passwordValue) ? 'text-green-600' : 'text-slate-400'}`}>
                                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(passwordValue) ? 'bg-green-600' : 'bg-slate-300'}`} />
                                    Uppercase
                                </div>
                                <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider transition-colors ${/[0-9]/.test(passwordValue) ? 'text-green-600' : 'text-slate-400'}`}>
                                    <span className={`mr-2 h-1.5 w-1.5 rounded-full ${/[0-9]/.test(passwordValue) ? 'bg-green-600' : 'bg-slate-300'}`} />
                                    One Number
                                </div>
                            </div>
                            {errors.password && <p className={errorStyle}>{errors.password.message}</p>}
                        </div>

                        <div className="relative py-4 form-anim opacity-0 origin-bottom">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Location</span></div>
                        </div>

                        <div className="form-anim opacity-0 origin-bottom">
                            <label className={labelStyle}>Street Address</label>
                            <input {...register("address.street")} className={inputStyle} placeholder="123 Main St" />
                            {errors.address?.street && <p className={errorStyle}>{errors.address.street.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 form-anim opacity-0 origin-bottom">
                            <div>
                                <label className={labelStyle}>City</label>
                                <input {...register("address.city")} className={inputStyle} placeholder="New York" />
                                {errors.address?.city && <p className={errorStyle}>{errors.address.city.message}</p>}
                            </div>
                            <div>
                                <label className={labelStyle}>Zip Code</label>
                                <input {...register("address.zip_code")} type="number" className={inputStyle} placeholder="10001" />
                                {errors.address?.zip_code && <p className={errorStyle}>{errors.address.zip_code.message}</p>}
                            </div>
                        </div>

                        <div className="form-anim opacity-0 origin-bottom">
                            <label className={labelStyle}>Account Role</label>
                            <select {...register("role")} className={inputStyle}>
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>

                        <div className="pt-8 form-anim opacity-0 origin-bottom">
                            <button 
                                ref={buttonRef}
                                onMouseEnter={handleBtnHover}
                                onMouseLeave={handleBtnLeave}
                                type="submit" 
                                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700"
                                style={{ boxShadow: '0px 10px 15px -3px rgba(37, 99, 235, 0.2)' }}
                            >
                                Create Account
                            </button>
                        </div>

                        {/* Optional Footer Link */}
                        <div className="mt-8 text-center text-sm text-gray-600 form-anim opacity-0 origin-bottom">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                                Log in
                            </Link>
                        </div>
                        
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register