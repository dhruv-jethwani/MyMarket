import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import { API_ROUTES } from '../../config';

export default function AddProductScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  
  // Base State
  const [formData, setFormData] = useState({
    name: '', description: '', cost_price: '', price: '', stock_quantity: '', category: 'general'
  });
  
  // Dynamic Specifications State
  const [specs, setSpecs] = useState([]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleAddSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  
  const handleUpdateSpec = (text, index, field) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = text;
    setSpecs(newSpecs);
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  const handlePublish = async () => {
    if (!formData.name || !formData.price || !imageUri) {
      return Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Name, Price, and Image are required.' });
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('cost_price', formData.cost_price);
      data.append('price', formData.price);
      data.append('stock_quantity', formData.stock_quantity);
      data.append('category', formData.category);
      data.append('seller', decoded.user_id);
      
      // Convert specs array to Object, then to JSON String just like the React Web App
      const specsObj = specs.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      data.append('specifications', JSON.stringify(specsObj));

      // Append Image
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      data.append('image', { uri: imageUri, name: filename, type });

      await axios.post(API_ROUTES.ADD_PRODUCT, data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Product published to storefront!' });
      
      // Reset Form
      setFormData({ name: '', description: '', cost_price: '', price: '', stock_quantity: '', category: 'general' });
      setSpecs([]);
      setImageUri(null);

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not publish product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 mb-4 font-bold`;
  const labelStyle = tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-1 pl-1`;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={tw`flex-grow p-4 pb-8`}>
          
          <View style={tw`mb-6`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Add Product</Text>
            <Text style={tw`text-slate-500`}>List a new item in your inventory.</Text>
          </View>

          {/* IMAGE UPLOAD ZONE */}
          <TouchableOpacity onPress={pickImage} style={tw`w-full h-48 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 items-center justify-center overflow-hidden mb-6`}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <View style={tw`items-center`}>
                <Ionicons name="cloud-upload-outline" size={40} color="#3b82f6" style={tw`mb-2`} />
                <Text style={tw`font-bold text-slate-700`}>Tap to upload image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6`}>
            <Text style={labelStyle}>Product Name</Text>
            <TextInput style={inputStyle} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} placeholder="Wireless Headphones" />

            <Text style={labelStyle}>Description</Text>
            <TextInput style={[inputStyle, tw`h-24`]} value={formData.description} onChangeText={(t) => setFormData({...formData, description: t})} placeholder="Features and benefits..." multiline />

            <View style={tw`flex-row gap-4`}>
              <View style={tw`flex-1`}><Text style={labelStyle}>Cost (₹)</Text><TextInput style={inputStyle} value={formData.cost_price} onChangeText={(t) => setFormData({...formData, cost_price: t})} keyboardType="numeric" placeholder="0.00" /></View>
              <View style={tw`flex-1`}><Text style={labelStyle}>Price (₹)</Text><TextInput style={inputStyle} value={formData.price} onChangeText={(t) => setFormData({...formData, price: t})} keyboardType="numeric" placeholder="0.00" /></View>
            </View>
            
            <Text style={labelStyle}>Stock Quantity</Text>
            <TextInput style={inputStyle} value={formData.stock_quantity} onChangeText={(t) => setFormData({...formData, stock_quantity: t})} keyboardType="numeric" placeholder="50" />
          </View>

          {/* DYNAMIC SPECIFICATIONS */}
          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`font-black text-slate-800`}>Specifications</Text>
              <TouchableOpacity onPress={handleAddSpec} style={tw`bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center`}>
                <Ionicons name="add" size={16} color="#2563eb" />
                <Text style={tw`text-blue-600 font-bold text-xs ml-1`}>Add Spec</Text>
              </TouchableOpacity>
            </View>

            {specs.map((spec, index) => (
              <View key={index} style={tw`flex-row items-center gap-2 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100`}>
                <TextInput style={tw`flex-1 bg-white p-3 rounded-lg border border-slate-200 font-bold text-sm`} placeholder="Key (e.g. Brand)" value={spec.key} onChangeText={(t) => handleUpdateSpec(t, index, 'key')} />
                <TextInput style={tw`flex-1 bg-white p-3 rounded-lg border border-slate-200 font-bold text-sm`} placeholder="Value (e.g. Sony)" value={spec.value} onChangeText={(t) => handleUpdateSpec(t, index, 'value')} />
                <TouchableOpacity onPress={() => handleRemoveSpec(index)} style={tw`p-2`}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {specs.length === 0 && <Text style={tw`text-center text-slate-400 font-bold italic py-2 text-sm`}>No specs added yet.</Text>}
          </View>

          <TouchableOpacity 
            style={tw`w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 ${isSubmitting ? 'opacity-70' : ''}`}
            onPress={handlePublish}
            disabled={isSubmitting}
          >
            <Text style={tw`text-white font-bold text-lg`}>{isSubmitting ? 'Publishing...' : 'Publish Product'}</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}