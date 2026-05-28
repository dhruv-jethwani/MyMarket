import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../../config';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      const res = await axios.get(API_ROUTES.ORDER_HISTORY, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Paid': return { name: 'checkmark-circle', color: '#22c55e' };
      case 'Shipped': return { name: 'airplane', color: '#3b82f6' };
      case 'Delivered': return { name: 'home', color: '#059669' };
      default: return { name: 'time', color: '#f97316' };
    }
  };

  const renderOrderItem = ({ item }) => {
    const orderDate = new Date(item.timestamp).toLocaleDateString();
    const statusData = getStatusIcon(item.status);

    return (
      <View style={tw`bg-white rounded-2xl border border-slate-100 shadow-sm mb-4 overflow-hidden`}>
        {/* Header */}
        <View style={tw`bg-slate-50 p-4 border-b border-slate-100 flex-row justify-between items-center`}>
          <View>
            <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest`}>Order Placed</Text>
            <Text style={tw`text-sm font-bold text-slate-700`}>{orderDate}</Text>
          </View>
          <View style={tw`items-end`}>
            <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest`}>Total</Text>
            <Text style={tw`text-sm font-black text-blue-600`}>₹{item.total_amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={tw`p-4`}>
          <View style={tw`flex-row items-center bg-slate-50 self-start px-3 py-1.5 rounded-lg border border-slate-100 mb-4`}>
            <Ionicons name={statusData.name} size={16} color={statusData.color} style={tw`mr-2`} />
            <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wide`}>{item.status}</Text>
          </View>

          {item.items.map((prod, idx) => (
            <View key={idx} style={tw`flex-row justify-between items-center mb-3 pb-3 ${idx !== item.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <View style={tw`flex-1 pr-4`}>
                <Text style={tw`text-sm font-bold text-slate-900`} numberOfLines={1}>{prod.name}</Text>
                <Text style={tw`text-xs font-bold text-slate-500`}>Qty: {prod.quantity}</Text>
              </View>
              <Text style={tw`text-sm font-black text-slate-900`}>₹{(prod.price * prod.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) return (
    <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={tw`p-4`}
        ListHeaderComponent={() => (
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Order History</Text>
            <Text style={tw`text-sm text-slate-500`}>Review your past purchases.</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={tw`py-12 items-center justify-center`}>
            <Ionicons name="receipt-outline" size={48} color="#cbd5e1" style={tw`mb-4`} />
            <Text style={tw`text-lg font-bold text-slate-700`}>No Orders Yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}