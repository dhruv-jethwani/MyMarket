import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

export default function HomeScreen({ navigation }) {
  return (
    <View style={tw`flex-1 items-center justify-center bg-slate-50 p-6`}>
      
      {/* Logo / Title */}
      <Text style={tw`text-4xl font-black text-blue-600`}>MyMarket</Text>
      <Text style={tw`text-slate-500 mt-2 mb-10 text-center text-lg`}>
        Your mobile marketplace is ready.
      </Text>

      {/* Register Button */}
      <TouchableOpacity 
        style={tw`w-full bg-blue-600 py-4 rounded-2xl items-center shadow-lg active:bg-blue-700`}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={tw`text-white font-bold text-lg`}>Get Started</Text>
      </TouchableOpacity>
      
      {/* Login Link */}
      <TouchableOpacity 
        style={tw`mt-6 p-2`}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={tw`text-slate-500 font-medium text-base`}>
          Already have an account? <Text style={tw`text-blue-600 font-bold`}>Login</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}