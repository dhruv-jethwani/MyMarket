import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]"> 
      {/* The min-h calculation above subtracts the 64px (h-16) of your Navbar 
        so the page fits perfectly on the screen without unnecessary scrolling.
      */}

      {/* --- HERO SECTION --- */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
        
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold tracking-wide uppercase">
          Welcome to the Future of Shopping
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6 max-w-4xl">
          Your One-Stop <span className="text-blue-600">Digital Marketplace</span>
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Buy and sell top-quality products with ease. Join thousands of users on MyMarket today and discover amazing deals from trusted sellers worldwide.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          <Link 
            to="/register" 
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center"
          >
            Start Shopping Now
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:-translate-y-1 transition-all flex items-center justify-center"
          >
            Seller Dashboard
          </Link>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">Why choose MyMarket?</h2>
            <p className="text-gray-500 mt-2">Everything you need to buy and sell securely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🛍️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vast Selection</h3>
              <p className="text-gray-500 leading-relaxed">
                Find exactly what you need from our growing community of verified and trusted sellers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Transactions</h3>
              <p className="text-gray-500 leading-relaxed">
                Your payments and personal data are protected by industry-leading, bank-grade security.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Delivery</h3>
              <p className="text-gray-500 leading-relaxed">
                Get your digital products, licenses, and services delivered directly to your inbox instantly.
              </p>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}