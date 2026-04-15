import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Eye, EyeSlash } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom' // Imported Link for the footer

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
})

function Login() {
    const API = '/auth/login'
    const [showPassword, setShowPassword] = useState(false)
    
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(loginSchema)
    })

    async function onSubmit(data) {
        try {
            const res = await axios.post(API, data)
            console.log(res.data)
            reset()
        } catch (error) {
            console.log(error)
        }
    }

    // YOUR VARIABLES - I just bumped py-2 to py-3 and mt-5 to mt-6 to stretch it out!
    const inputStyle = "w-full px-4 py-3 mt-1 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300 bg-white text-gray-900 transition-all";
    const labelStyle = "block text-sm font-semibold text-gray-700 mt-6";
    const errorStyle = "text-[11px] font-medium text-red-500 mt-1";

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-144px)]">
            {/* Increased max-width slightly to 420px and padding to p-10 for a larger footprint */}
            <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
                {/* Added a subtitle to give the top of the card more height */}
                <p className="text-center text-gray-500 text-sm mt-2 mb-6">Please enter your details to sign in.</p>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Username Field */}
                    <div>
                        <label className={labelStyle}>Username</label>
                        <input 
                            {...register("username")} 
                            className={`${inputStyle} ${errors.username ? 'border-red-500' : ''}`}
                            placeholder="Enter your username"
                        />
                        {errors.username && <p className={errorStyle}>{errors.username.message}</p>}
                    </div>

                    {/* Password Field with Eye Button */}
                    <div>
                        {/* Flexbox to put "Password" and "Forgot password?" on the same line */}
                        <div className="flex justify-between items-center mt-6">
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</a>
                        </div>
                        
                        <div className="relative flex items-center">
                            {/* We use !mt-1 here to override the variable so it doesn't double-stack margins */}
                            <input 
                                {...register("password")} 
                                type={showPassword ? "text" : "password"} 
                                className={`${inputStyle} !mt-1 ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                                style={{ paddingRight: '45px' }}
                            />
                            <button 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className={errorStyle}>{errors.password.message}</p>}
                    </div>

                    <div className="pt-8">
                        <button 
                            type="submit" 
                            className="w-full py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-[0.98]"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Added a footer section to elongate the card and link to your Register page */}
                    <div className="mt-8 text-center text-sm text-gray-600">
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