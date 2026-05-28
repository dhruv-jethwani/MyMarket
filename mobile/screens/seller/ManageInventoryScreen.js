import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_ROUTES } from '../../config';

export default function ManageInventoryScreen() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      
      const res = await axios.post(API_ROUTES.SELLER_PRODUCTS, { seller_id: decoded.user_id });
      if (res.data && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (productId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to permanently delete this product?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_ROUTES.PRODUCT_BASE}/${productId}`);
            setProducts(products.filter(p => (p._id.$oid || p._id) !== productId));
          } catch (error) {
            Alert.alert("Error", "Could not delete product.");
          }
        }
      }
    ]);
  };

  const renderProduct = ({ item }) => {
    const productId = item._id.$oid || item._id;
    return (
      <View style={tw`bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden`}>
        <View style={tw`flex-row p-4 border-b border-slate-50`}>
          <View style={tw`h-16 w-16 bg-slate-100 rounded-xl overflow-hidden mr-4`}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={tw`w-full h-full`} resizeMode="cover" />
            ) : (
              <View style={tw`flex-1 items-center justify-center`}><Ionicons name="cube" size={24} color="#cbd5e1"/></View>
            )}
          </View>
          <View style={tw`flex-1 justify-center`}>
            <Text style={tw`text-sm font-black text-slate-900`} numberOfLines={1}>{item.name}</Text>
            <View style={tw`flex-row justify-between items-center mt-1`}>
              <Text style={tw`text-base font-black text-blue-600`}>₹{item.price}</Text>
              <Text style={tw`text-xs font-bold ${item.stock_quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                Stock: {item.stock_quantity}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row bg-slate-50`}>
          <TouchableOpacity style={tw`flex-1 py-3 items-center border-r border-slate-200 flex-row justify-center`}>
            <Ionicons name="add-circle-outline" size={16} color="#059669" />
            <Text style={tw`text-xs font-bold text-slate-600 ml-1`}>Restock</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(productId)} style={tw`flex-1 py-3 items-center flex-row justify-center`}>
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={tw`text-xs font-bold text-slate-600 ml-1`}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id.$oid || item._id}
        renderItem={renderProduct}
        contentContainerStyle={tw`p-4`}
        ListHeaderComponent={() => (
          <View style={tw`mb-6 flex-row justify-between items-end`}>
            <View>
              <Text style={tw`text-2xl font-black text-slate-900`}>Inventory</Text>
              <Text style={tw`text-sm text-slate-500`}>Manage your listed products.</Text>
            </View>
            <View style={tw`bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm`}>
              <Text style={tw`text-xs font-bold text-slate-500`}>Total: <Text style={tw`text-blue-600`}>{products.length}</Text></Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}