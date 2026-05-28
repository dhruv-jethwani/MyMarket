import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../../config';

export default function ManageOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(API_ROUTES.SELLER_ORDERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (orderId, currentStatus) => {
    Alert.alert('Update Shipping Status', 'Select the new status for this order:', [
      { text: 'Packing (Paid)', onPress: () => updateStatus(orderId, 'Paid') },
      { text: 'Shipped', onPress: () => updateStatus(orderId, 'Shipped') },
      { text: 'Delivered', onPress: () => updateStatus(orderId, 'Delivered') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_ROUTES.UPDATE_ORDER_STATUS}/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const renderOrder = ({ item }) => (
    <View style={tw`bg-white rounded-3xl border border-slate-100 shadow-sm mb-6 overflow-hidden`}>
      <View style={tw`bg-slate-50 p-4 border-b border-slate-100 flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest`}>Ref ID</Text>
          <Text style={tw`text-xs font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 mt-1`}>{item.id.substring(0, 8)}...</Text>
        </View>
        <View style={tw`items-end`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest`}>Revenue</Text>
          <Text style={tw`text-base font-black text-green-600`}>₹{item.order_total.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={tw`p-4`}>
        <TouchableOpacity 
          onPress={() => handleStatusChange(item.id, item.status)}
          style={tw`flex-row items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4`}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="paper-plane-outline" size={18} color="#3b82f6" style={tw`mr-2`} />
            <Text style={tw`font-bold text-slate-700`}>Status: <Text style={tw`text-blue-600`}>{item.status}</Text></Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#3b82f6" />
        </TouchableOpacity>

        {item.items.map((prod, idx) => (
          <View key={idx} style={tw`flex-row justify-between items-center mb-2 pb-2 ${idx !== item.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
            <View style={tw`flex-1 pr-4`}>
              <Text style={tw`text-sm font-bold text-slate-900`} numberOfLines={1}>{prod.name}</Text>
            </View>
            <View style={tw`items-end`}>
              <Text style={tw`text-xs font-bold text-slate-500`}>Qty: {prod.quantity}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={tw`p-4`}
        ListHeaderComponent={() => (
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Fulfillment</Text>
            <Text style={tw`text-sm text-slate-500`}>Update shipping statuses.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}