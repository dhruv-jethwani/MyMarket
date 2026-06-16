import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import { API_ROUTES } from '../../config';

export default function ManageInventoryScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Restock Modal State
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [isRestocking, setIsRestocking] = useState(false);

  useEffect(() => {
    // We use focus listener to refresh the list automatically when coming back from EditProductScreen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInventory();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchInventory = async () => {
    setIsLoading(true);
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
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch inventory.' });
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
            Toast.show({ type: 'success', text1: 'Deleted', text2: 'Product removed successfully.' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete product.' });
          }
        }
      }
    ]);
  };

  const handleRestockSubmit = async () => {
    if (!restockQty || parseInt(restockQty) <= 0) return;
    setIsRestocking(true);
    try {
      const pid = restockProduct._id.$oid || restockProduct._id;
      const API_RESTOCK = `${API_ROUTES.PRODUCT_BASE}/${pid}/restock`;
      
      await axios.patch(API_RESTOCK, { quantity: parseInt(restockQty) });
      
      setProducts(products.map(p => {
        if ((p._id.$oid || p._id) === pid) {
          return { ...p, stock_quantity: p.stock_quantity + parseInt(restockQty) };
        }
        return p;
      }));
      
      Toast.show({ type: 'success', text1: 'Restocked', text2: `Added ${restockQty} units to inventory.` });
      setRestockProduct(null);
      setRestockQty('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to restock product.' });
    } finally {
      setIsRestocking(false);
    }
  };

  const renderProduct = ({ item }) => {
    const productId = item._id.$oid || item._id;
    return (
      <View style={tw`bg-white rounded-3xl border border-slate-100 shadow-sm mb-4 overflow-hidden`}>
        <View style={tw`flex-row p-4 border-b border-slate-50 items-center`}>
          <View style={tw`h-16 w-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 mr-4`}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={tw`w-full h-full`} resizeMode="contain" />
            ) : (
              <View style={tw`flex-1 items-center justify-center`}><Ionicons name="cube-outline" size={24} color="#cbd5e1"/></View>
            )}
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-base font-black text-slate-900`} numberOfLines={1}>{item.name}</Text>
            <View style={tw`flex-row justify-between items-center mt-1`}>
              <Text style={tw`text-lg font-black text-blue-600`}>₹{item.price}</Text>
              <Text style={tw`text-xs font-bold ${item.stock_quantity < 10 ? 'text-red-500' : 'text-green-600'}`}>
                Stock: {item.stock_quantity}
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`flex-row bg-slate-50`}>
          <TouchableOpacity 
            onPress={() => setRestockProduct(item)}
            style={tw`flex-1 py-3 border-r border-slate-200 items-center justify-center flex-row`}
          >
            <Ionicons name="add-circle-outline" size={16} color="#059669" />
            <Text style={tw`text-xs font-bold text-slate-600 ml-1`}>Restock</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProduct', { productId })}
            style={tw`flex-1 py-3 border-r border-slate-200 items-center justify-center flex-row`}
          >
            <Ionicons name="pencil" size={16} color="#2563eb" />
            <Text style={tw`text-xs font-bold text-slate-600 ml-1`}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(productId)} 
            style={tw`flex-1 py-3 items-center justify-center flex-row`}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={tw`text-xs font-bold text-slate-600 ml-1`}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      
      {/* NATIVE RESTOCK MODAL */}
      <Modal visible={!!restockProduct} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end bg-slate-900/50`}>
          <View style={tw`bg-white rounded-t-3xl p-6 pb-12`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-xl font-black text-slate-900`}>Add Stock</Text>
              <TouchableOpacity onPress={() => setRestockProduct(null)} style={tw`p-2`}><Ionicons name="close" size={24} color="#94a3b8"/></TouchableOpacity>
            </View>
            
            <Text style={tw`text-slate-600 mb-6 text-sm font-medium`}>
              Adding stock for <Text style={tw`font-bold text-slate-900`}>{restockProduct?.name}</Text>. Cost is <Text style={tw`text-blue-600 font-bold`}>₹{restockProduct?.cost_price}/unit</Text>.
            </Text>

            <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2`}>Quantity to Add</Text>
            <TextInput 
              keyboardType="numeric"
              value={restockQty}
              onChangeText={setRestockQty}
              style={tw`w-full px-4 py-4 border border-slate-200 rounded-xl focus:border-blue-500 bg-slate-50 text-slate-900 font-bold text-lg mb-4`} 
              placeholder="e.g., 50"
            />
            
            <View style={tw`bg-slate-50 p-4 rounded-xl border border-slate-100 flex-row justify-between items-center mb-6`}>
                <Text style={tw`text-sm font-bold text-slate-500`}>Total Ledger Expense:</Text>
                <Text style={tw`text-lg font-black text-slate-900`}>₹{(restockQty ? (restockQty * restockProduct?.cost_price).toFixed(2) : '0.00')}</Text>
            </View>

            <TouchableOpacity 
              onPress={handleRestockSubmit}
              disabled={isRestocking || !restockQty}
              style={tw`w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 ${isRestocking || !restockQty ? 'opacity-60' : ''}`}
            >
              <Text style={tw`text-white font-bold text-lg`}>{isRestocking ? 'Updating Ledger...' : 'Confirm Restock'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id.$oid || item._id}
          renderItem={renderProduct}
          contentContainerStyle={tw`p-4 pb-20`}
          ListHeaderComponent={() => (
            <View style={tw`mb-6 flex-row justify-between items-end`}>
              <View>
                <Text style={tw`text-3xl font-black text-slate-900`}>Inventory</Text>
                <Text style={tw`text-sm text-slate-500`}>Manage your listed products.</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}