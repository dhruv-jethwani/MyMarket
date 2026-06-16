import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import { API_ROUTES } from '../../config';

export default function CheckoutScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expMonth: '', expYear: '', cvc: '', name: '' });

  useEffect(() => {
    loadCheckout();
  }, []);

  const loadCheckout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return navigation.replace('Login');
      
      const res = await axios.get(API_ROUTES.GET_CART, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.cart) setCart(res.data.cart);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load checkout details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardNumberChange = (text) => {
    let value = text.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formattedValue });
  };

  const handlePaySubmit = async () => {
    setIsProcessing(true);
    
    // Simulate Gateway Latency
    setTimeout(async () => {
      try {
        const rawCardNumber = cardData.number.replace(/\s/g, '');
        
        // MOCK RULE 1: DECLINE
        if (rawCardNumber.startsWith('4000')) {
          Toast.show({ type: 'error', text1: 'Declined', text2: 'Card Blocked by Mock Gateway' });
          setIsProcessing(false);
          return;
        }

        const token = await AsyncStorage.getItem('token');
        const decoded = jwtDecode(token);
        
        const payload = {
          user_id: decoded.user_id,
          items: cart.items,
          payment_status: "Paid",
          gateway_ref: "MOCK_GW_" + Math.random().toString(36).substring(2, 9).toUpperCase()
        };

        const PLACE_ORDER_API = API_ROUTES.LOGIN.replace('/auth/login', '/order/place_order');
        await axios.post(PLACE_ORDER_API, payload);
        
        // MOCK RULE 2: VIP SUCCESS
        if (rawCardNumber.startsWith('2000')) {
          Toast.show({ type: 'success', text1: 'Success', text2: 'VIP Payment Captured!' });
        } else {
          Toast.show({ type: 'success', text1: 'Success', text2: 'Payment Captured Successfully!' });
        }
        
        navigation.navigate('History');
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to compile transaction.' });
        setIsProcessing(false);
      }
    }, 2000);
  };

  const totalPrice = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2) || '0.00';
  const displayExpiry = cardData.expMonth && cardData.expYear ? `${cardData.expMonth}/${cardData.expYear}` : 'MM/YY';

  if (isLoading) return <View style={tw`flex-1 items-center justify-center bg-slate-50`}><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={tw`flex-grow p-4 pb-12`}>
          
          <View style={tw`mb-8`}>
            <Text style={tw`text-2xl font-black text-slate-900`}>Secure Checkout</Text>
            <Text style={tw`text-slate-500`}>Test simulated gateway protocols.</Text>
          </View>

          {/* VISUAL MOCK CREDIT CARD */}
          <View style={tw`bg-slate-900 p-6 rounded-3xl shadow-xl mb-6 h-48 justify-between`}>
            <View style={tw`flex-row justify-between items-start`}>
              <Ionicons name="card" size={32} color="#94a3b8" />
              <View style={tw`bg-white/10 px-2 py-1 rounded`}><Text style={tw`text-white text-[10px] font-black tracking-widest`}>SANDBOX GATEWAY</Text></View>
            </View>
            <Text style={tw`text-white text-2xl font-mono tracking-widest my-2`}>{cardData.number || '•••• •••• •••• ••••'}</Text>
            <View style={tw`flex-row justify-between`}>
              <View><Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Cardholder</Text><Text style={tw`text-white font-bold uppercase`}>{cardData.name || 'Your Name'}</Text></View>
              <View><Text style={tw`text-[10px] text-slate-400 font-bold uppercase`}>Expires</Text><Text style={tw`text-white font-bold`}>{displayExpiry}</Text></View>
            </View>
          </View>

          <View style={tw`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm`}>
            <Text style={tw`text-xs font-black text-slate-400 uppercase mb-1`}>Name on Card</Text>
            <TextInput style={tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 mb-4 font-bold`} value={cardData.name} onChangeText={(t) => setCardData({...cardData, name: t})} editable={!isProcessing} />

            <Text style={tw`text-xs font-black text-slate-400 uppercase mb-1`}>Card Number</Text>
            <TextInput style={tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 mb-2 font-mono font-bold`} value={cardData.number} onChangeText={handleCardNumberChange} keyboardType="numeric" editable={!isProcessing} maxLength={19} placeholder="•••• •••• •••• ••••" />
            
            <View style={tw`flex-row gap-2 mb-4`}>
              <View style={tw`bg-green-50 px-2 py-1 rounded`}><Text style={tw`text-[10px] text-green-600 font-bold`}>Start 2000 = Success</Text></View>
              <View style={tw`bg-red-50 px-2 py-1 rounded`}><Text style={tw`text-[10px] text-red-500 font-bold`}>Start 4000 = Decline</Text></View>
            </View>

            <View style={tw`flex-row gap-4`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-black text-slate-400 uppercase mb-1`}>Expiry (MM/YY)</Text>
                <View style={tw`flex-row gap-2`}>
                   <TextInput style={tw`flex-1 bg-slate-50 px-2 py-3 rounded-xl border border-slate-200 text-center font-bold`} placeholder="MM" maxLength={2} keyboardType="numeric" value={cardData.expMonth} onChangeText={(t) => setCardData({...cardData, expMonth: t})} editable={!isProcessing} />
                   <TextInput style={tw`flex-1 bg-slate-50 px-2 py-3 rounded-xl border border-slate-200 text-center font-bold`} placeholder="YY" maxLength={2} keyboardType="numeric" value={cardData.expYear} onChangeText={(t) => setCardData({...cardData, expYear: t})} editable={!isProcessing} />
                </View>
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs font-black text-slate-400 uppercase mb-1`}>CVC</Text>
                <TextInput style={tw`w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 font-bold text-center`} maxLength={3} keyboardType="numeric" secureTextEntry value={cardData.cvc} onChangeText={(t) => setCardData({...cardData, cvc: t})} editable={!isProcessing} placeholder="•••" />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handlePaySubmit}
              disabled={isProcessing || cardData.number.replace(/\s/g, '').length !== 16}
              style={tw`w-full mt-8 bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 ${isProcessing || cardData.number.replace(/\s/g, '').length !== 16 ? 'opacity-60' : ''}`}
            >
              <Text style={tw`text-white font-bold text-lg`}>{isProcessing ? 'Authorizing...' : `Pay ₹${totalPrice}`}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}