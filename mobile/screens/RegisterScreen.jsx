import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';


const registerSchema = z.object({
    fullname: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid Email Address"),
    password: z.string()
        .min(8, "Minimum 8 characters")
        .regex(/[A-Z]/, "Include an uppercase letter")
        .regex(/[0-9]/, "Include a number"),
    address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        zip_code: z.coerce.number().int().positive("Invalid Zip Code")
    }),
    role: z.string()
});

export default function RegisterScreen({ navigation }) {
	const [isPasswordSecure, setIsPasswordSecure] = useState(true)
    const API = 'http://192.168.31.87:5000/auth/register';

    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(registerSchema),
		mode: "onBlur",
        defaultValues: {
            fullname: '', username: '', email: '', password: '',
            address: { street: '', city: '', zip_code: '' },
            role: 'customer'
        }
    });

    const passwordValue = watch("password", "");

    // Strength Bar Logic
    const calculateStrength = () => {
        let strength = 0;
        if (passwordValue.length >= 8) strength += 33;
        if (/[A-Z]/.test(passwordValue)) strength += 33;
        if (/[0-9]/.test(passwordValue)) strength += 34;
        return strength;
    };

    const strength = calculateStrength();
    const strengthColor = strength < 66 ? 'bg-orange-500' : strength < 100 ? 'bg-yellow-500' : 'bg-green-500';

    async function onSubmit(data) {
        try {
            const res = await axios.post(API, data);
            Alert.alert("Success", "Account created successfully!");
            reset();
            navigation.navigate('Login');
        } catch (error) {
            console.log(error);
            Alert.alert("Error", error.response?.data?.message || "Registration failed");
        }
    }

    const labelStyle = tw`text-sm font-bold text-slate-700 mt-4 mb-1`;
    const inputStyle = (error) => tw`bg-white border ${error ? 'border-red-500' : 'border-slate-200'} p-4 rounded-xl text-slate-900`;

    return (
        <ScrollView contentContainerStyle={tw`bg-slate-50 p-6 pb-20`}>
            <View style={tw`mt-10 mb-6`}>
                <Text style={tw`text-3xl font-black text-slate-900`}>Join the Marketplace</Text>
                <Text style={tw`text-slate-500`}>Create your account to start shopping</Text>
            </View>

            <View style={tw`bg-white p-6 rounded-3xl shadow-lg border border-slate-100`}>
                
                {/* Full Name & Username */}
                <Text style={labelStyle}>Full Name</Text>
                <Controller control={control} name="fullname" render={({ field: { onChange, value } }) => (
                    <TextInput style={inputStyle(errors.fullname)} placeholder="John Doe" onChangeText={onChange} value={value} />
                )} />
                {errors.fullname && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.fullname.message}</Text>}

                <Text style={labelStyle}>Username</Text>
                <Controller control={control} name="username" render={({ field: { onChange, value } }) => (
                    <TextInput style={inputStyle(errors.username)} placeholder="johndoe" autoCapitalize="none" onChangeText={onChange} value={value} />
                )} />
                {errors.username && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.username.message}</Text>}

                {/* Email */}
                <Text style={labelStyle}>Email Address</Text>
                <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={inputStyle(errors.email)} placeholder="you@example.com" keyboardType="email-address" onBlur={onBlur} autoCapitalize="none" onChangeText={onChange} value={value} />
                )} />
                {errors.email && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.email.message}</Text>}

                {/* Password & Strength Bar */}
                <Text style={labelStyle}>Password</Text>
                <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
                    <View style={tw`flex-row items-center bg-slate-100 rounded-xl mb-1 ${errors.password ? 'border border-red-500' : ''}`}>
                            <TextInput 
                                style={tw`flex-1 p-4 text-slate-900`} 
                                placeholder="••••••••" 
                                /* This prop toggles the "type" between dots and plain text */
                                secureTextEntry={isPasswordSecure}
                                onChangeText={onChange}
                                value={value}
                            />
                            <TouchableOpacity 
                                style={tw`pr-4`} 
                                onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                            >
                                <Ionicons 
                                    name={isPasswordSecure ? "eye-off" : "eye"} 
                                    size={22} 
                                    color="#64748b" 
                                />
                            </TouchableOpacity>
                        </View>
                )} />
                
                <View style={tw`mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden`}>
                    <View style={[tw`h-full ${strengthColor}`, { width: `${strength}%` }]} />
                </View>
				{/* NEW: Requirement Grid */}
					<View style={tw`mt-3 flex-row flex-wrap`}>
						{/* 8 Characters Requirement */}
						<View style={tw`flex-row items-center mr-4 mb-2`}>
							<View style={tw`h-2 w-2 rounded-full mr-2 ${passwordValue.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
							<Text style={tw`text-[11px] font-bold uppercase tracking-wider ${passwordValue.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
								8+ Characters
							</Text>
						</View>

						{/* Uppercase Requirement */}
						<View style={tw`flex-row items-center mr-4 mb-2`}>
							<View style={tw`h-2 w-2 rounded-full mr-2 ${/[A-Z]/.test(passwordValue) ? 'bg-green-500' : 'bg-slate-300'}`} />
							<Text style={tw`text-[11px] font-bold uppercase tracking-wider ${/[A-Z]/.test(passwordValue) ? 'text-green-600' : 'text-slate-400'}`}>
								Uppercase
							</Text>
						</View>

						{/* Number Requirement */}
						<View style={tw`flex-row items-center mr-4 mb-2`}>
							<View style={tw`h-2 w-2 rounded-full mr-2 ${/[0-9]/.test(passwordValue) ? 'bg-green-500' : 'bg-slate-300'}`} />
							<Text style={tw`text-[11px] font-bold uppercase tracking-wider ${/[0-9]/.test(passwordValue) ? 'text-green-600' : 'text-slate-400'}`}>
								One Number
							</Text>
						</View>
					</View>
                {errors.password && <Text style={tw`text-red-500 text-xs mt-1`}>{errors.password.message}</Text>}

                {/* Location Divider */}
                <View style={tw`flex-row items-center my-6`}>
                    <View style={tw`flex-1 h-px bg-slate-200`} />
                    <Text style={tw`px-3 text-xs font-bold text-slate-400 uppercase`}>Location</Text>
                    <View style={tw`flex-1 h-px bg-slate-200`} />
                </View>

                {/* Address Section */}
                <Text style={labelStyle}>Street Address</Text>
                <Controller control={control} name="address.street" render={({ field: { onChange, value } }) => (
                    <TextInput style={inputStyle(errors.address?.street)} placeholder="123 Main St" onChangeText={onChange} value={value} />
                )} />

                <View style={tw`flex-row gap-4`}>
                    <View style={tw`flex-1`}>
                        <Text style={labelStyle}>City</Text>
                        <Controller control={control} name="address.city" render={({ field: { onChange, value } }) => (
                            <TextInput style={inputStyle(errors.address?.city)} placeholder="New York" onChangeText={onChange} value={value} />
                        )} />
                    </View>
                    <View style={tw`flex-1`}>
                        <Text style={labelStyle}>Zip Code</Text>
                        <Controller control={control} name="address.zip_code" render={({ field: { onChange, value } }) => (
                            <TextInput style={inputStyle(errors.address?.zip_code)} placeholder="10001" keyboardType="numeric" onChangeText={onChange} value={value} />
                        )} />
                    </View>
                </View>

                {/* Account Role (Mobile Selector) */}
                <Text style={labelStyle}>Account Role</Text>
                <Controller control={control} name="role" render={({ field: { onChange, value } }) => (
                    <View style={tw`flex-row bg-slate-100 p-1 rounded-xl`}>
                        <TouchableOpacity 
                            onPress={() => onChange('customer')}
                            style={tw`flex-1 py-3 rounded-lg items-center ${value === 'customer' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text style={tw`${value === 'customer' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => onChange('manager')}
                            style={tw`flex-1 py-3 rounded-lg items-center ${value === 'manager' ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text style={tw`${value === 'manager' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>Manager</Text>
                        </TouchableOpacity>
                    </View>
                )} />

                <TouchableOpacity 
                    onPress={handleSubmit(onSubmit)}
                    style={tw`bg-blue-600 py-4 rounded-2xl items-center mt-8 shadow-lg`}
                >
                    <Text style={tw`text-white font-bold text-lg`}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={tw`mt-4 items-center`}>
                    <Text style={tw`text-slate-500`}>Already have an account? <Text style={tw`text-blue-600 font-bold`}>Login</Text></Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}