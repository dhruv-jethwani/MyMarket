import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import tw from 'twrnc'; // The magic import
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons'

const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required")
})

export default function LoginScreen({ navigation }) {

	const [isPasswordSecure, setIsPasswordSecure] = useState(true)
	const API = 'http://192.168.31.87:5000/auth/login'
	const { control, handleSubmit, formState: {errors}, reset} = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: { username: '', password: ''}
	})

	async function onSubmit(data){
		try {
			const res = await axios.post(API, data)
			console.log(res)
			Alert.alert("Success", "Logged In successfully!");
			reset()
		} catch (error) {
			console.log("Error:", error.response?.data || error.message);
		}
	}

  return (
    <ScrollView contentContainerStyle={tw`flex-1 bg-slate-50 justify-center p-6`}>
            <Text style={tw`text-4xl font-black text-slate-900 mb-6`}>Welcome Back.</Text>
            
            <View style={tw`bg-white p-6 rounded-3xl shadow-lg border border-slate-100`}>
                
                {/* USERNAME FIELD */}
                <Text style={tw`font-bold mb-2 text-slate-700`}>Username</Text>
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, value } }) => (
                        <TextInput 
                            style={tw`bg-slate-100 p-4 rounded-xl mb-1 text-slate-900 ${errors.username ? 'border border-red-500' : ''}`} 
                            placeholder="Enter username" 
                            onChangeText={onChange} // This is the "login" magic for mobile
                            value={value}
                        />
                    )}
                />
                {errors.username && <Text style={tw`text-red-500 text-xs mb-3`}>{errors.username.message}</Text>}
                
                {/* PASSWORD FIELD */}
                <Text style={tw`font-bold mb-2 text-slate-700`}>Password</Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
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
                    )}
                />
                {errors.password && <Text style={tw`text-red-500 text-xs mb-3`}>{errors.password.message}</Text>}

                <TouchableOpacity 
                    style={tw`bg-blue-600 p-4 rounded-xl items-center mt-4`} 
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text style={tw`text-white font-bold text-lg`}>Sign In</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
  );
}