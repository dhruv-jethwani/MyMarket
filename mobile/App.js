import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

// --- AUTH SCREENS ---
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// --- CUSTOMER SCREENS ---
import ShopScreen from './screens/customer/ShopScreen';
import CartScreen from './screens/customer/CartScreen';
import OrderHistoryScreen from './screens/customer/OrderHistoryScreen';

// --- SELLER SCREENS ---
import AddProductScreen from './screens/seller/AddProductScreen';
import ManageInventoryScreen from './screens/seller/ManageInventoryScreen';
import ManageOrdersScreen from './screens/seller/ManageOrdersScreen';
import SellerAnalyticsScreen from './screens/seller/SellerAnalyticsScreen';

// --- COMMON SCREENS ---
import ProfileScreen from './screens/common/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// 1. CUSTOMER INTERFACE
// ==========================================
function CustomerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Store"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Store') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'History') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Store" component={ShopScreen} options={{ title: 'MyMarket' }} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="History" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// 2. SELLER INTERFACE
// ==========================================
function SellerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inventory" // Forces Inventory to be the Home screen for Sellers
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#059669', // Distinctive green theme for sellers
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inventory') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Orders') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inventory" component={ManageInventoryScreen} />
      <Tab.Screen name="Add" component={AddProductScreen} options={{ title: 'New Product' }} />
      <Tab.Screen name="Orders" component={ManageOrdersScreen} />
      <Tab.Screen name="Analytics" component={SellerAnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// 3. MASTER ROUTER
// ==========================================
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setInitialRoute('Home');
          return;
        }

        // Decode token to find role
        const decoded = jwtDecode(token);
        const userRole = decoded?.sub?.role || decoded?.role || 'customer'; // Adjust based on your Flask JWT payload

        if (userRole === 'seller' || userRole === 'manager') {
          setInitialRoute('SellerTabs');
        } else {
          setInitialRoute('CustomerTabs');
        }
      } catch (e) {
        // If token is invalid or expired
        await AsyncStorage.removeItem('token');
        setInitialRoute('Home');
      }
    };

    bootstrapAsync();
  }, []);

  if (!initialRoute) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-slate-50`}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          {/* PUBLIC ROUTES */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          
          {/* PROTECTED ROUTES */}
          <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
          <Stack.Screen name="SellerTabs" component={SellerTabs} />
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Toast injected at the absolute highest level */}
      <Toast /> 
    </>
  );
}