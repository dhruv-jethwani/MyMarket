import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../../config';

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'address'
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(null);

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
      
      // In a real app, decode token to get ID, or hit an endpoint like /auth/me
      // Assuming your backend expects /auth/profile/<id> based on your web code.
      // You will need to extract the user_id from the token payload here.
      // For now, let's assume the backend verifies via the Bearer token entirely.
      
      // NOTE: Ensure your Flask route /auth/profile/ accepts just the token, 
      // or securely decode the JWT here to pass the ID.
      // const res = await axios.get(`${API_ROUTES.PROFILE}/${decoded_id}`, ...)
      
      Alert.alert("Notice", "Wire up jwt-decode here to get user_id for the fetch URL.");

    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // await axios.put(`${API_ROUTES.UPDATE_PROFILE}/${userId}`, formData, { headers: { Authorization: `Bearer ${token}` }});
      Alert.alert("Success", "Profile updated.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
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

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={tw`flex-grow p-4 pb-8`}>
          
          <View style={tw`flex-row justify-between items-center mb-6`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Account</Text>
            <TouchableOpacity onPress={handleLogout} style={tw`p-2 bg-red-50 rounded-lg flex-row items-center`}>
               <Ionicons name="log-out-outline" size={16} color="#ef4444" />
               <Text style={tw`text-red-500 font-bold ml-1 text-xs`}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* User Card */}
          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm items-center mb-6`}>
            <Ionicons name="person-circle" size={80} color="#cbd5e1" />
            <Text style={tw`text-xl font-black text-slate-900 mt-2`}>{formData.fullname || 'Your Name'}</Text>
            <View style={tw`mt-2 px-3 py-1 bg-blue-50 rounded-lg`}>
              <Text style={tw`text-xs font-bold text-blue-600 uppercase`}>{formData.role}</Text>
            </View>
          </View>

          {/* Custom Tab Switcher */}
          <View style={tw`flex-row bg-slate-200 p-1 rounded-xl mb-6`}>
            <TouchableOpacity 
              style={tw`flex-1 py-3 rounded-lg items-center ${activeTab === 'personal' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => { setActiveTab('personal'); setIsEditing(false); }}
            >
              <Text style={tw`font-bold ${activeTab === 'personal' ? 'text-blue-600' : 'text-slate-500'}`}>Personal Info</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={tw`flex-1 py-3 rounded-lg items-center ${activeTab === 'address' ? 'bg-white shadow-sm' : ''}`}
              onPress={() => { setActiveTab('address'); setIsEditing(false); }}
            >
              <Text style={tw`font-bold ${activeTab === 'address' ? 'text-blue-600' : 'text-slate-500'}`}>Location</Text>
            </TouchableOpacity>
          </View>

          {/* Form Area */}
          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm`}>
            <View style={tw`flex-row justify-between items-center mb-4 border-b border-slate-100 pb-2`}>
               <Text style={tw`font-bold text-slate-800`}>{activeTab === 'personal' ? 'Credentials' : 'Saved Address'}</Text>
               <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                 <Text style={tw`text-blue-600 font-bold text-sm`}>{isEditing ? 'Cancel' : 'Edit'}</Text>
               </TouchableOpacity>
            </View>

            {activeTab === 'personal' ? (
              <View>
                <Text style={labelStyle}>Full Name</Text>
                <TextInput style={inputStyle} value={formData.fullname} onChangeText={(t) => setFormData({...formData, fullname: t})} editable={isEditing} />
                
                <Text style={labelStyle}>Email Address</Text>
                <TextInput style={inputStyle} value={formData.email} onChangeText={(t) => setFormData({...formData, email: t})} editable={isEditing} />
              </View>
            ) : (
              <View>
                <Text style={labelStyle}>Street Address</Text>
                <TextInput style={inputStyle} value={formData.address.street} onChangeText={(t) => setFormData({...formData, address: {...formData.address, street: t}})} editable={isEditing} />
                
                <Text style={labelStyle}>City</Text>
                <TextInput style={inputStyle} value={formData.address.city} onChangeText={(t) => setFormData({...formData, address: {...formData.address, city: t}})} editable={isEditing} />
                
                <Text style={labelStyle}>Zip Code</Text>
                <TextInput style={inputStyle} value={formData.address.zip_code?.toString()} onChangeText={(t) => setFormData({...formData, address: {...formData.address, zip_code: t}})} editable={isEditing} keyboardType="numeric" />
              </View>
            )}

            {isEditing && (
              <TouchableOpacity 
                style={tw`bg-green-500 py-4 rounded-xl items-center mt-2 shadow-lg shadow-green-200`}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={tw`text-white font-bold`}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}