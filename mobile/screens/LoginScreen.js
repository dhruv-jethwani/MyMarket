import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { jwtDecode } from 'jwt-decode';
import tw from 'twrnc';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../config'; 

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export default function LoginScreen({ navigation }) {
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      const res = await axios.post(API_ROUTES.LOGIN, data);
      
      if (res.data.token) {
        await AsyncStorage.setItem('token', res.data.token);
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back to MyMarket!',
          position: 'top',
        });

        const decoded = jwtDecode(res.data.token);
        const userRole = decoded?.sub?.role || decoded?.role || 'customer';

        if (userRole === 'seller' || userRole === 'manager') {
          navigation.replace('SellerTabs');
        } else {
          navigation.replace('CustomerTabs');
        }
      }
    } catch (error) {
      let errorMsg = "An unknown error occurred.";
      
      if (error.response) {
        // Server responded with an operational rejection (wrong password, etc.)
        errorMsg = error.response.data.error || "Invalid credentials.";
      } else if (error.request) {
        // Request was sent but no response came back (Wrong IP, device can't touch backend)
        errorMsg = "Network Error: Cannot connect to backend server at " + API_ROUTES.LOGIN;
      } else {
        errorMsg = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMsg,
        position: 'top',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView 
        style={tw`flex-1`} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={tw`flex-grow justify-center p-6 pb-12`}>
          
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mb-8`}>
              <Ionicons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>

          <Text style={tw`text-4xl font-black text-slate-900 tracking-tight mb-2`}>Welcome Back.</Text>
          <Text style={tw`text-slate-500 mb-8 font-medium`}>Please enter your details to sign in.</Text>
        
          <View style={tw`bg-white p-6 rounded-3xl shadow-sm border border-slate-100`}>
            
            <Text style={tw`text-sm font-bold mb-2 text-slate-700`}>Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <TextInput 
                  style={tw`bg-slate-50 p-4 rounded-xl mb-1 text-slate-900 border ${errors.username ? 'border-red-500' : 'border-slate-200'}`} 
                  placeholder="Enter username" 
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.username && <Text style={tw`text-red-500 text-xs mb-4 font-bold`}>{errors.username.message}</Text>}
            {!errors.username && <View style={tw`mb-4`} />}
            
            <View style={tw`flex-row justify-between mb-2`}>
               <Text style={tw`text-sm font-bold text-slate-700`}>Password</Text>
               <TouchableOpacity><Text style={tw`text-blue-600 text-xs font-bold`}>Forgot?</Text></TouchableOpacity>
            </View>
            
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={tw`flex-row items-center bg-slate-50 border rounded-xl mb-1 ${errors.password ? 'border-red-500' : 'border-slate-200'}`}>
                  <TextInput 
                    style={tw`flex-1 p-4 text-slate-900`} 
                    placeholder="••••••••" 
                    secureTextEntry={isPasswordSecure}
                    onChangeText={onChange}
                    value={value}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity style={tw`pr-4`} onPress={() => setIsPasswordSecure(!isPasswordSecure)}>
                    <Ionicons name={isPasswordSecure ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={tw`text-red-500 text-xs mb-2 font-bold`}>{errors.password.message}</Text>}

            <TouchableOpacity 
              style={tw`bg-blue-600 py-4 rounded-xl items-center mt-6 shadow-lg shadow-blue-200 ${isSubmitting ? 'opacity-70' : ''}`} 
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={tw`text-white font-bold text-lg`}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

          </View>

          <View style={tw`flex-row justify-center mt-8`}>
              <Text style={tw`text-slate-500 font-medium`}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={tw`text-blue-600 font-bold`}>Sign Up</Text>
              </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}