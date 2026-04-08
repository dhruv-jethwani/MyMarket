import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tw from 'twrnc'; // The magic import

export default function LoginScreen({ navigation }) {
  return (
    <View style={tw`flex-1 bg-slate-50 justify-center p-6`}>
      
      {/* Header */}
      <Text style={tw`text-4xl font-black text-slate-900 mb-6`}>
        Welcome Back.
      </Text>
      
      {/* Card */}
      <View style={tw`bg-white p-6 rounded-3xl shadow-lg border border-slate-100`}>
        
        <Text style={tw`font-bold mb-2 text-slate-700`}>Email Address</Text>
        <TextInput 
          style={tw`bg-slate-100 p-4 rounded-xl mb-4 text-slate-900`} 
          placeholder="name@example.com" 
          placeholderTextColor="#94a3b8"
        />
        
        <Text style={tw`font-bold mb-2 text-slate-700`}>Password</Text>
        <TextInput 
          style={tw`bg-slate-100 p-4 rounded-xl mb-6 text-slate-900`} 
          placeholder="••••••••" 
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        
        <TouchableOpacity 
          style={tw`bg-blue-600 p-4 rounded-xl items-center`} 
          onPress={() => console.log("Login")}
        >
          <Text style={tw`text-white font-bold text-lg`}>Sign In</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}