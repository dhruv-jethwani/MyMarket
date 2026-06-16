import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import { API_ROUTES } from '../../config';

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('personal'); 
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', role: 'customer',
    address: { street: '', city: '', zip_code: '' }
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      const decoded = jwtDecode(token);
      
      // Fast optimistic load from token
      setFormData(prev => ({ ...prev, fullname: decoded.fullname || '', role: decoded.role || 'customer' }));

      // Secure fetch from DB using decoded ID
      const res = await axios.get(`${API_ROUTES.PROFILE}/${decoded.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.user) {
        const u = res.data.user;
        setFormData({
          fullname: u.fullname || '',
          username: u.username || '',
          email: u.email || '',
          role: u.role || 'customer',
          address: {
            street: u.address?.street || '',
            city: u.address?.city || '',
            zip_code: u.address?.zip_code?.toString() || ''
          }
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load profile data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);
      
      const res = await axios.put(`${API_ROUTES.UPDATE_PROFILE}/${decoded.user_id}`, formData, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.token) {
        await AsyncStorage.setItem('token', res.data.token); // Refresh token with new data
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile settings synced!' });
      setIsEditing(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Home');
  };

  const inputStyle = tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 mb-4 font-semibold ${!isEditing ? 'opacity-60 bg-slate-100' : ''}`;
  const labelStyle = tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-1 pl-1`;

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={tw`flex-grow p-4 pb-8`}>
          
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <View>
              <Text style={tw`text-2xl font-black text-slate-900`}>Account Settings</Text>
              <Text style={tw`text-slate-500 text-xs mt-1`}>Manage credentials and preferences.</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={tw`p-2 bg-red-50 rounded-lg flex-row items-center`}>
               <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm items-center mb-6`}>
            <Ionicons name="person-circle" size={80} color="#cbd5e1" />
            <Text style={tw`text-xl font-black text-slate-900 mt-2`}>{formData.fullname}</Text>
            <Text style={tw`text-sm font-bold text-slate-400`}>@{formData.username}</Text>
            <View style={tw`mt-3 px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg`}>
              <Text style={tw`text-xs font-black text-blue-600 uppercase tracking-wider`}>Role: {formData.role}</Text>
            </View>
          </View>

          <View style={tw`flex-row bg-slate-200 p-1 rounded-xl mb-6`}>
            <TouchableOpacity 
              style={tw`flex-1 py-3 rounded-lg items-center ${activeTab === 'personal' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => { setActiveTab('personal'); setIsEditing(false); }}
            >
              <Text style={tw`font-bold ${activeTab === 'personal' ? 'text-blue-600' : 'text-slate-500'}`}>Credentials</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={tw`flex-1 py-3 rounded-lg items-center ${activeTab === 'address' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => { setActiveTab('address'); setIsEditing(false); }}
            >
              <Text style={tw`font-bold ${activeTab === 'address' ? 'text-blue-600' : 'text-slate-500'}`}>Location Node</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm`}>
            <View style={tw`flex-row justify-between items-center mb-4 border-b border-slate-100 pb-3`}>
               <Text style={tw`font-bold text-slate-800`}>{activeTab === 'personal' ? 'System Details' : 'Saved Address'}</Text>
               <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={tw`flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg`}>
                 <Ionicons name="pencil" size={14} color="#2563eb" style={tw`mr-1`} />
                 <Text style={tw`text-blue-600 font-bold text-xs`}>{isEditing ? 'Cancel' : 'Edit'}</Text>
               </TouchableOpacity>
            </View>

            {activeTab === 'personal' ? (
              <View>
                <Text style={labelStyle}>Full Name</Text>
                <TextInput style={inputStyle} value={formData.fullname} onChangeText={(t) => setFormData({...formData, fullname: t})} editable={isEditing} />
                
                <Text style={labelStyle}>Email Node</Text>
                <TextInput style={inputStyle} value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} editable={isEditing} keyboardType="email-address" autoCapitalize="none"/>
              </View>
            ) : (
              <View>
                <Text style={labelStyle}>Street Address</Text>
                <TextInput style={inputStyle} value={formData.address.street} onChangeText={(t) => setFormData({...formData, address: {...formData.address, street: t}})} editable={isEditing} />
                
                <Text style={labelStyle}>City Node</Text>
                <TextInput style={inputStyle} value={formData.address.city} onChangeText={(t) => setFormData({...formData, address: {...formData.address, city: t}})} editable={isEditing} />
                
                <Text style={labelStyle}>Postal Zip Code</Text>
                <TextInput style={inputStyle} value={formData.address.zip_code} onChangeText={(t) => setFormData({...formData, address: {...formData.address, zip_code: t}})} editable={isEditing} keyboardType="numeric" />
              </View>
            )}

            {isEditing && (
              <TouchableOpacity 
                style={tw`bg-green-500 py-4 rounded-xl items-center mt-2 shadow-lg shadow-green-200 ${isSaving ? 'opacity-70' : ''}`}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={tw`text-white font-bold`}>{isSaving ? 'Syncing...' : 'Save Updates'}</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}