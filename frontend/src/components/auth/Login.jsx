import React, { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Eye, EyeSlash, Check2Circle, XCircle } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { animate, stagger } from 'animejs';

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
})

function Login() {
    const navigate = useNavigate()
    const API = '/auth/login'
    const [showPassword, setShowPassword] = useState(false)
    const cardRef = useRef(null);
    const buttonRef = useRef(null);
    
    // --- NEW TOAST STATE ---
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(loginSchema)
    })

    const showToast = (message, type = 'error') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    // --- HIGH-END ANIMATION SEQUENCE ---
    useEffect(() => {
        animate(cardRef.current, {
            scale: [0.85, 1],
            rotate: [-2, 0],
            opacity: [0, 1],
            duration: 1200,
            easing: 'easeOutElastic(1, .8)'
        });

        animate('.header-anim', {
            translateY: [-30, 0],
            opacity: [0, 1],
            delay: stagger(100, { start: 200 }),
            duration: 1000,
            easing: 'easeOutExpo'
        });

        animate('.form-anim', {
            translateY: [40, 0],
            rotateX: [-90, 0],
            opacity: [0, 1],
            delay: stagger(150, { start: 500 }),
            duration: 1200,
            easing: 'easeOutBack'
        });
    }, []);

    // --- MICRO-INTERACTIONS ---
    const handleBtnHover = () => {
        animate(buttonRef.current, {
            scale: 1.04,
            translateY: -4,
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
            const token = res.data.token; 
            const decoded = jwtDecode(token)
            localStorage.setItem('token', token)
            localStorage.setItem('role', decoded.role)
            reset()
            
            // Generate the personalized welcome message
            const welcomeMsg = `Welcome back, ${decoded.fullname || 'User'}!`;

            // Redirect and inject the success message into the router state
            if (decoded.role === "customer"){
                navigate('/store', { state: { loginToast: welcomeMsg } })
            }
            else if (decoded.role === "seller"){
                navigate('/inventory', { state: { loginToast: welcomeMsg } })
            }
            else if (decoded.role === "admin"){
                navigate('/admin/users', { state: { loginToast: welcomeMsg } })
            }
            else {
                console.log("Invalid user role")
            }
        } catch (error) {
            console.log(error)
            showToast(error.response?.data?.error || "Invalid credentials", "error");
        }
    }

    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300 bg-white text-gray-900 transition-all shadow-sm";
    const labelStyle = "block text-sm font-semibold text-gray-700 mt-6";
    const errorStyle = "text-[11px] font-medium text-red-500 mt-1";

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-144px)] overflow-hidden bg-gray-50">
            
            {/* NEW TOAST SYSTEM */}
            {toast.visible && (
                <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                    {toast.type === 'success' ? <Check2Circle size={24} /> : <XCircle size={24} />}
                    {toast.message}
                </div>
            )}

            <div 
                ref={cardRef}
                className="w-full max-w-[420px] bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 opacity-0"
                style={{ perspective: '1000px' }} 
            >
                <div className="header-anim opacity-0">
                    <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                </div>
                <div className="header-anim opacity-0">
                    <p className="text-center text-gray-500 text-sm mt-2 mb-6">Please enter your details to sign in.</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-anim opacity-0 origin-bottom">
                        <label className={labelStyle}>Username</label>
                        <input 
                            {...register("username")} 
                            className={`${inputStyle} ${errors.username ? 'border-red-500' : ''}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && <p className={errorStyle}>{errors.username.message}</p>}
                    </div>

                    <div className="form-anim opacity-0 origin-bottom">
                        <div className="flex justify-between items-center mt-6">
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</a>
                        </div>
                        
                        <div className="relative flex items-center">
                            <input 
                                {...register("password")} 
                                type={showPassword ? "text" : "password"} 
                                className={`${inputStyle} !mt-1 ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                                style={{ paddingRight: '45px' }}
                            />
                            <button 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 eye-icon" 
                                type="button" 
                                onClick={handleTogglePassword}
                            >
                                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className={errorStyle}>{errors.password.message}</p>}
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
                            Sign In
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-600 form-anim opacity-0 origin-bottom">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login