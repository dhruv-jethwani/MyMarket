import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../../config';

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const res = await axios.get(API_ROUTES.GET_CART, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      // For mobile, you might need to decode the token to get the user_id, 
      // or adjust your backend to extract user_id directly from the Bearer token like you do in GET_CART.
      // Assuming your backend handles the token securely:
      await axios.delete(API_ROUTES.DELETE_CART_ITEM, {
        headers: { Authorization: `Bearer ${token}` },
        data: { product_id: productId } // Adjust based on how your backend expects the user_id
      });
      
      // Optimistic UI Update
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => {
          const id = item.product?._id?.$oid || item.product?.$oid || item.product?.id;
          return id !== productId;
        })
      }));
    } catch (error) {
      Alert.alert("Error", "Could not remove item.");
    }
  };

  const { subtotal, totalItems } = useMemo(() => {
    if (!cart?.items) return { subtotal: 0, totalItems: 0 };
    let sub = 0;
    let count = 0;
    cart.items.forEach(item => {
      const price = item.product?.price || 0;
      sub += (price * item.quantity);
      count += item.quantity;
    });
    return { subtotal: sub.toFixed(2), totalItems: count };
  }, [cart]);

  const renderCartItem = ({ item }) => {
    const product = item.product || {};
    const productId = product._id?.$oid || product._id || product.id;
    const itemTotal = (product.price * item.quantity).toFixed(2);

    return (
      <View style={tw`bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm flex-row items-center`}>
        <View style={tw`h-20 w-20 bg-slate-50 rounded-xl p-2 border border-slate-100 mr-4`}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={tw`w-full h-full`} resizeMode="contain" />
          ) : (
            <View style={tw`flex-1 items-center justify-center`}><Ionicons name="cube-outline" size={24} color="#cbd5e1"/></View>
          )}
        </View>

        <View style={tw`flex-1`}>
          <Text style={tw`text-sm font-bold text-slate-900 mb-1`} numberOfLines={2}>{product.name || "Unknown Product"}</Text>
          <Text style={tw`text-base font-black text-blue-600 mb-2`}>₹{product.price}</Text>
          <View style={tw`bg-slate-100 self-start px-2 py-1 rounded-md`}>
            <Text style={tw`text-xs font-bold text-slate-700`}>Qty: {item.quantity}</Text>
          </View>
        </View>

        <View style={tw`items-end justify-between h-full py-1 pl-2`}>
          <TouchableOpacity onPress={() => handleRemoveItem(productId)} style={tw`p-2 bg-red-50 rounded-full`}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
          <Text style={tw`text-sm font-black text-slate-900 mt-4`}>₹{itemTotal}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) return (
    <View style={tw`flex-1 items-center justify-center bg-slate-50`}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  if (!cart?.items || cart.items.length === 0) return (
    <SafeAreaView style={tw`flex-1 bg-slate-50 items-center justify-center p-6`}>
      <Ionicons name="cart-outline" size={64} color="#cbd5e1" style={tw`mb-4`} />
      <Text style={tw`text-2xl font-black text-slate-900 mb-2`}>Your cart is empty</Text>
      <Text style={tw`text-slate-500 text-center mb-8`}>Looks like you haven't added anything yet.</Text>
      <TouchableOpacity 
        style={tw`bg-blue-600 px-8 py-4 rounded-xl shadow-lg`}
        onPress={() => navigation.navigate('Store')}
      >
        <Text style={tw`text-white font-bold`}>Continue Shopping</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <FlatList
        data={cart.items}
        keyExtractor={(item, index) => item.product?._id?.$oid || index.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={tw`p-4 pb-32`}
        ListHeaderComponent={() => (
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Shopping Cart</Text>
          </View>
        )}
      />

      {/* Sticky Bottom Summary */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-slate-200 shadow-lg`}>
        <View style={tw`flex-row justify-between mb-4`}>
          <Text style={tw`text-slate-600 font-bold`}>Total ({totalItems} items)</Text>
          <Text style={tw`text-2xl font-black text-slate-900`}>₹{subtotal}</Text>
        </View>
        <TouchableOpacity style={tw`w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg`}>
          <Text style={tw`text-white font-bold text-lg`}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}