import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROUTES } from '../../config';

export default function SellerAnalyticsScreen() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(API_ROUTES.SELLER_ANALYTICS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`mb-6`}>
          <Text style={tw`text-2xl font-black text-slate-900`}>Analytics</Text>
          <Text style={tw`text-sm text-slate-500`}>Real-time storefront performance.</Text>
        </View>

        <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-row items-center justify-between mb-4`}>
          <View>
            <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1`}>Gross Revenue</Text>
            <Text style={tw`text-3xl font-black text-slate-900`}>₹{stats?.total_revenue.toLocaleString()}</Text>
          </View>
          <View style={tw`h-12 w-12 bg-blue-50 rounded-xl items-center justify-center`}><Ionicons name="cash-outline" size={24} color="#3b82f6"/></View>
        </View>

        <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-row items-center justify-between mb-4`}>
          <View>
            <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1`}>Net Profit</Text>
            <Text style={tw`text-3xl font-black text-green-600`}>₹{stats?.total_profit.toLocaleString()}</Text>
          </View>
          <View style={tw`h-12 w-12 bg-green-50 rounded-xl items-center justify-center`}><Ionicons name="trending-up" size={24} color="#16a34a"/></View>
        </View>

        <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1`}>Items Sold</Text>
            <Text style={tw`text-3xl font-black text-slate-900`}>{stats?.total_items_sold}</Text>
          </View>
          <View style={tw`h-12 w-12 bg-orange-50 rounded-xl items-center justify-center`}><Ionicons name="cube-outline" size={24} color="#f97316"/></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}