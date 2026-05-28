import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_ROUTES } from '../../config';

export default function AddProductScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', cost_price: '', price: '', stock_quantity: '', category: 'general'
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!formData.name || !formData.price || !imageUri) {
      Alert.alert("Missing Fields", "Name, Price, and Image are strictly required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // Note: You may need a polyfill for jwtDecode in raw React Native, 
      // or simply rely on your backend to extract the seller ID from the token.
      const decoded = jwtDecode(token);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('cost_price', formData.cost_price);
      data.append('price', formData.price);
      data.append('stock_quantity', formData.stock_quantity);
      data.append('category', formData.category);
      data.append('seller', decoded.user_id);
      data.append('specifications', JSON.stringify({})); // Sending empty to satisfy DB

      // Mobile specific file append formatting
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      data.append('image', { uri: imageUri, name: filename, type });

      await axios.post(API_ROUTES.ADD_PRODUCT, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      Alert.alert("Success", "Product published to storefront!");
      setFormData({ name: '', description: '', cost_price: '', price: '', stock_quantity: '', category: 'general' });
      setImageUri(null);

    } catch (error) {
      Alert.alert("Error", "Could not publish product.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 mb-4 font-semibold`;
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
          <TouchableOpacity 
            onPress={pickImage}
            style={tw`w-full h-48 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 items-center justify-center overflow-hidden mb-6`}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <View style={tw`items-center`}>
                <Ionicons name="cloud-upload-outline" size={40} color="#3b82f6" style={tw`mb-2`} />
                <Text style={tw`font-bold text-slate-700`}>Tap to upload image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm`}>
            <Text style={labelStyle}>Product Name</Text>
            <TextInput style={inputStyle} value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} placeholder="Wireless Headphones" />

            <Text style={labelStyle}>Description</Text>
            <TextInput style={[inputStyle, tw`h-24`]} value={formData.description} onChangeText={(t) => setFormData({...formData, description: t})} placeholder="Features and benefits..." multiline />

            <View style={tw`flex-row gap-4`}>
              <View style={tw`flex-1`}>
                <Text style={labelStyle}>Cost (₹)</Text>
                <TextInput style={inputStyle} value={formData.cost_price} onChangeText={(t) => setFormData({...formData, cost_price: t})} keyboardType="numeric" placeholder="0.00" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={labelStyle}>Price (₹)</Text>
                <TextInput style={inputStyle} value={formData.price} onChangeText={(t) => setFormData({...formData, price: t})} keyboardType="numeric" placeholder="0.00" />
              </View>
            </View>

            <View style={tw`flex-row gap-4`}>
              <View style={tw`flex-1`}>
                <Text style={labelStyle}>Stock</Text>
                <TextInput style={inputStyle} value={formData.stock_quantity} onChangeText={(t) => setFormData({...formData, stock_quantity: t})} keyboardType="numeric" placeholder="50" />
              </View>
            </View>

            <TouchableOpacity 
              style={tw`w-full bg-blue-600 py-4 rounded-xl items-center mt-4 shadow-lg shadow-blue-200 ${isSubmitting ? 'opacity-70' : ''}`}
              onPress={handlePublish}
              disabled={isSubmitting}
            >
              <Text style={tw`text-white font-bold text-lg`}>{isSubmitting ? 'Publishing...' : 'Publish Product'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}