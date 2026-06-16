import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import { API_ROUTES } from '../../config';

export default function ShopScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Local Staging Cart Logic
  const [localCart, setLocalCart] = useState({});
  const [dbCartState, setDbCartState] = useState({});

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setIsLoading(true);
    try {
      const prodRes = await axios.get(API_ROUTES.PRODUCTS);
      if (prodRes.data && prodRes.data.products) setProducts(prodRes.data.products);

      const token = await AsyncStorage.getItem('token');
      if (token) {
        const cartRes = await axios.get(API_ROUTES.GET_CART, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cartRes.data && cartRes.data.cart?.items) {
          const existingCart = {};
          cartRes.data.cart.items.forEach(item => {
            const pid = item.product?._id?.$oid || item.product?.$oid || item.product?.id;
            if (pid) existingCart[pid] = item.quantity;
          });
          setLocalCart(existingCart);
          setDbCartState(existingCart);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocal = (productId, stockQuantity) => {
    setLocalCart(prev => {
      const currentQty = prev[productId] || 0;
      if (currentQty >= stockQuantity) {
        Toast.show({ type: 'error', text1: 'Limit Reached', text2: 'Cannot add more than available stock.' });
        return prev;
      }
      return { ...prev, [productId]: currentQty + 1 };
    });
  };

  const handleRemoveLocal = (productId) => {
    setLocalCart(prev => {
      if (!prev[productId]) return prev;
      const newCart = { ...prev };
      newCart[productId] -= 1;
      if (newCart[productId] <= 0) delete newCart[productId];
      return newCart;
    });
  };

  const handleConfirmCart = async () => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return navigation.navigate('Login');
      
      const decoded = jwtDecode(token);
      await axios.post(API_ROUTES.LOGIN.replace('/auth/login', '/cart/add_cart'), {
        user: decoded.user_id,
        items: localCart
      });
      
      setDbCartState({...localCart});
      Toast.show({ type: 'success', text1: 'Success', text2: 'Cart synced securely.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to sync cart.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    Object.entries(localCart).forEach(([id, qty]) => {
      const product = products.find(p => (p._id.$oid || p._id) === id);
      if (product) {
        items += qty;
        price += (product.price * qty);
      }
    });
    return { totalItems: items, totalPrice: price.toFixed(2) };
  }, [localCart, products]);

  const hasUnsavedChanges = JSON.stringify(localCart) !== JSON.stringify(dbCartState);

  const renderProduct = ({ item }) => {
    const productId = item._id.$oid || item._id;
    const qtyInCart = localCart[productId] || 0;

    return (
      <View style={tw`bg-white rounded-3xl border border-slate-100 shadow-sm mb-4 overflow-hidden`}>
        {qtyInCart > 0 && (
          <View style={tw`absolute top-3 right-3 z-10 bg-blue-600 h-7 w-7 rounded-full items-center justify-center shadow-md`}>
            <Text style={tw`text-white text-xs font-black`}>{qtyInCart}</Text>
          </View>
        )}
        
        <View style={tw`h-48 bg-slate-50 p-4 items-center justify-center`}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={tw`w-full h-full`} resizeMode="contain" />
          ) : (
            <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
          )}
          <View style={tw`absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-md shadow-sm border border-blue-100`}>
            <Text style={tw`text-[10px] font-black text-blue-600 uppercase tracking-wider`}>{item.category}</Text>
          </View>
        </View>

        <View style={tw`p-5`}>
          <Text style={tw`text-base font-black text-slate-900 mb-1`} numberOfLines={1}>{item.name}</Text>
          <Text style={tw`text-xl font-black text-blue-600 mb-1`}>₹{item.price}</Text>
          <Text style={tw`text-xs font-bold mb-4 ${item.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {item.stock_quantity > 0 ? `${item.stock_quantity} in stock` : 'Sold Out'}
          </Text>

          <View style={tw`flex-row items-center justify-between bg-slate-50 rounded-full p-1 border border-slate-100`}>
            <TouchableOpacity 
              onPress={() => handleRemoveLocal(productId)}
              disabled={qtyInCart === 0}
              style={tw`h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm ${qtyInCart === 0 ? 'opacity-40' : ''}`}
            >
              <Ionicons name="remove" size={20} color={qtyInCart === 0 ? "#94a3b8" : "#ef4444"} />
            </TouchableOpacity>
            
            <Text style={tw`font-black text-slate-900 text-lg px-4`}>{qtyInCart}</Text>
            
            <TouchableOpacity 
              onPress={() => handleAddLocal(productId, item.stock_quantity)}
              disabled={item.stock_quantity === 0 || qtyInCart >= item.stock_quantity}
              style={tw`h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm ${item.stock_quantity === 0 || qtyInCart >= item.stock_quantity ? 'opacity-40' : ''}`}
            >
              <Ionicons name="add" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`px-4 pt-4 pb-2 bg-slate-50`}>
        <View style={tw`flex-row items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm`}>
          <Ionicons name="search" size={20} color="#94a3b8" style={tw`mr-2`} />
          <TextInput 
            style={tw`flex-1 font-bold text-slate-700`}
            placeholder="Search storefront..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id.$oid || item._id}
        renderItem={renderProduct}
        contentContainerStyle={tw`p-4 ${hasUnsavedChanges ? 'pb-24' : 'pb-4'}`}
      />

      {/* Floating Save Cart Action */}
      {hasUnsavedChanges && (
        <View style={tw`absolute bottom-4 left-4 right-4 bg-slate-900 rounded-3xl p-4 flex-row items-center justify-between shadow-2xl`}>
          <View>
             <Text style={tw`text-white font-bold text-sm`}>{totalItems} Items Staged</Text>
             <Text style={tw`text-blue-400 font-black text-lg`}>₹{totalPrice}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleConfirmCart}
            disabled={isSubmitting}
            style={tw`bg-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-blue-500/50`}
          >
            <Text style={tw`text-white font-bold`}>{isSubmitting ? 'Saving...' : 'Sync Cart'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}