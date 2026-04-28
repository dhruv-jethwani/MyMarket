import React, { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

// Standard V4 Import
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
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(loginSchema)
    })

    // --- HIGH-END ANIMATION SEQUENCE ---
    useEffect(() => {
        // 1. The Card: Slight scale up with a dynamic tilt
        animate(cardRef.current, {
            scale: [0.85, 1],
            rotate: [-2, 0], // A tiny physical tilt on entry
            opacity: [0, 1],
            duration: 1200,
            easing: 'easeOutElastic(1, .8)'
        });

        // 2. The Header: Drops down gracefully
        animate('.header-anim', {
            translateY: [-30, 0],
            opacity: [0, 1],
            delay: stagger(100, { start: 200 }),
            duration: 1000,
            easing: 'easeOutExpo'
        });

        // 3. The Form: 3D "Unfolding" effect (Notice the rotateX)
        animate('.form-anim', {
            translateY: [40, 0],
            rotateX: [-90, 0], // Starts flipped backwards and swings up
            opacity: [0, 1],
            delay: stagger(150, { start: 500 }),
            duration: 1200,
            easing: 'easeOutBack' // Gives it a slight "bounce" at the end
        });
    }, []);

    // --- MICRO-INTERACTIONS ---
    const handleBtnHover = () => {
        animate(buttonRef.current, {
            scale: 1.04,
            translateY: -4, // Physically lifts up
            boxShadow: '0px 20px 25px -5px rgba(37, 99, 235, 0.4)', // Huge glowing shadow
            duration: 500,
            easing: 'easeOutElastic(1, .6)'
        });
    };

    const handleBtnLeave = () => {
        animate(buttonRef.current, {
            scale: 1,
            translateY: 0,
            boxShadow: '0px 10px 15px -3px rgba(37, 99, 235, 0.2)', // Back to normal shadow
            duration: 400,
            easing: 'easeOutExpo'
        });
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
        // Spin the eye icon every time it's clicked
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
			if (decoded.role == "customer"){
				navigate('/shop')
			}
			else if (decoded.role == "seller"){
				navigate('/add_product')
			}
			else if (decoded.role == "admin"){
				navigate('/admin/users')
			}
			else {
				console.log("Invalid user role")
			}
        } catch (error) {
            console.log(error)
        }
    }

    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300 bg-white text-gray-900 transition-all shadow-sm";
    const labelStyle = "block text-sm font-semibold text-gray-700 mt-6";
    const errorStyle = "text-[11px] font-medium text-red-500 mt-1";

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-144px)] overflow-hidden bg-gray-50">
            <div 
                ref={cardRef}
                /* Added perspective-1000 to the card so the 3D rotateX actually looks 3D */
                className="w-full max-w-[420px] bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 opacity-0"
                style={{ perspective: '1000px' }} 
            >
                {/* Header Group */}
                <div className="header-anim opacity-0">
                    <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                </div>
                <div className="header-anim opacity-0">
                    <p className="text-center text-gray-500 text-sm mt-2 mb-6">Please enter your details to sign in.</p>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Input Group 1 */}
                    <div className="form-anim opacity-0 origin-bottom">
                        <label className={labelStyle}>Username</label>
                        <input 
                            {...register("username")} 
                            className={`${inputStyle} ${errors.username ? 'border-red-500' : ''}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && <p className={errorStyle}>{errors.username.message}</p>}
                    </div>

                    {/* Input Group 2 */}
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

                    {/* Button Group */}
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

                    {/* Footer Group */}
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