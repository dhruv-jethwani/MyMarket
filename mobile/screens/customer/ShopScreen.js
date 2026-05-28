import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_ROUTES } from '../../config';

export default function ShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Replace this with your actual Flask endpoint for getting products
  const FETCH_PRODUCTS_URL = API_ROUTES.LOGIN.replace('/auth/login', '/shop/product'); 

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get(FETCH_PRODUCTS_URL);
        if (res.data && res.data.products) {
          setProducts(res.data.products);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (productId) => {
      Alert.alert("Added", "Product added to staging cart.");
      // Connect this to your cart API logic
  };

  const renderProduct = ({ item }) => (
    <View style={tw`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4`}>
      <View style={tw`h-48 bg-slate-50 relative p-4 items-center justify-center`}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={tw`w-full h-full`} 
            resizeMode="contain" 
          />
        ) : (
          <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
        )}
        <View style={tw`absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md shadow-sm border border-slate-100`}>
          <Text style={tw`text-[10px] font-black text-blue-600 uppercase tracking-wider`}>{item.category}</Text>
        </View>
      </View>

      <View style={tw`p-4 flex-row items-center justify-between`}>
        <View style={tw`flex-1 mr-4`}>
          <Text style={tw`text-sm font-black text-slate-900 mb-1`} numberOfLines={1}>{item.name}</Text>
          <Text style={tw`text-lg font-black text-blue-600`}>₹{item.price}</Text>
          <Text style={tw`text-xs font-bold ${item.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Out of Stock'}
          </Text>
        </View>

        <TouchableOpacity 
          style={tw`h-10 w-10 bg-slate-100 rounded-full items-center justify-center`}
          onPress={() => handleAddToCart(item._id.$oid || item._id)}
          disabled={item.stock_quantity === 0}
        >
          <Ionicons name="add" size={20} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={tw`mt-4 font-bold text-slate-400`}>Loading Inventory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id.$oid || item._id}
        renderItem={renderProduct}
        contentContainerStyle={tw`p-4`}
        ListHeaderComponent={() => (
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Discover</Text>
            <Text style={tw`text-slate-500 font-medium`}>Latest products and deals.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}