import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-50`}>
      <View style={tw`flex-1 items-center justify-center px-6`}>
        
        {/* Badge */}
        <View style={tw`mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100`}>
          <Text style={tw`text-blue-600 text-xs font-bold uppercase tracking-wide`}>
            Welcome to the Future
          </Text>
        </View>

        {/* Headline */}
        <Text style={tw`text-5xl font-black text-slate-900 text-center tracking-tight mb-4`}>
          MyMarket
        </Text>
        
        <Text style={tw`text-lg text-slate-500 text-center font-medium mb-10`}>
          Your one-stop digital marketplace, now in your pocket.
        </Text>

        {/* Actions */}
        <View style={tw`w-full space-y-4`}>
          <TouchableOpacity 
            style={tw`w-full bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-200 active:bg-blue-700`}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={tw`text-white font-bold text-lg`}>Start Shopping Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={tw`w-full bg-white py-4 rounded-2xl items-center border border-slate-200 shadow-sm active:bg-slate-50 mt-4`}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={tw`text-slate-700 font-bold text-lg`}>Sign In to Account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}