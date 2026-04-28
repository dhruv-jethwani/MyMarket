import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';

export default function Home() {

  // --- CREATIVE LANDING PAGE ANIMATIONS ---
  useEffect(() => {
    // 1. Cinematic Zoom-Out Drop for Hero Elements
    animate('.hero-element', {
      scale: [1.15, 1],      // Starts 15% larger and shrinks to normal
      translateY: [-30, 0],  // Drops DOWN instead of sliding up
      opacity: [0, 1],
      delay: stagger(150, { start: 100 }),
      duration: 1400,
      easing: 'easeOutQuart' // A very smooth, deceleration curve
    });

    // 2. The 3D Card Deal for Features
    animate('.feature-card', {
      rotateY: [-90, 0],     // Flips in horizontally from the side
      translateZ: [100, 0],  // Pushes out toward the user, then settles
      opacity: [0, 1],
      delay: stagger(200, { start: 800 }), // Waits for the hero text
      duration: 1200,
      easing: 'easeOutBack'  // Gives that satisfying "snap" into place
    });

  }, []);

  return (
    <div 
      className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('https://res.cloudinary.com/dv06sjxh0/image/upload/v1777333079/photo_2026-04-28_05-05-27_wikb2b.jpg')" }}
    > 
      
      {/* --- HERO SECTION --- */}
      {/* UPDATED: Changed bg-white/70 to bg-white/50 and backdrop-blur-sm to backdrop-blur-[2px] */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-white/50 backdrop-blur-[2px]">
        
        {/* Badge */}
        <div className="hero-element opacity-0 mb-6 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold tracking-wide uppercase shadow-sm">
          Welcome to the Future of Shopping
        </div>

        {/* Headline */}
        <h1 className="hero-element opacity-0 text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6 max-w-4xl drop-shadow-sm">
          Your One-Stop <span className="text-blue-600 relative inline-block">
            Digital Marketplace
            <span className="absolute -bottom-2 left-0 w-full h-2 bg-blue-200 rounded-full opacity-50 -z-10"></span>
          </span>
        </h1>
        
        {/* Sub-headline */}
        <p className="hero-element opacity-0 text-lg md:text-xl text-gray-900 max-w-2xl mb-10 leading-relaxed font-semibold">
          Buy and sell top-quality products with ease. Join thousands of users on MyMarket today and discover amazing deals from trusted sellers worldwide.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="hero-element opacity-0 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
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
            Sign In to Your Account
          </Link>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      {/* UPDATED: Changed bg-white/90 to bg-white/70 and backdrop-blur-md to backdrop-blur-[3px] */}
      <section className="bg-white/70 backdrop-blur-[3px] py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 hero-element opacity-0">
            <h2 className="text-3xl font-black text-gray-900">Why choose MyMarket?</h2>
            <p className="text-gray-800 mt-2 font-medium">Everything you need to buy and sell securely.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" style={{ perspective: '1200px' }}>
            
            {/* Feature 1 */}
            {/* UPDATED: Made the cards slightly more solid (bg-white/90) so text is easy to read over the clearer background */}
            <div className="feature-card opacity-0 p-8 rounded-3xl bg-white/90 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="animate-float w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🛍️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vast Selection</h3>
              <p className="text-gray-700 leading-relaxed">
                Find exactly what you need from our growing community of verified and trusted sellers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card opacity-0 p-8 rounded-3xl bg-white/90 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="animate-float [animation-delay:400ms] w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Transactions</h3>
              <p className="text-gray-700 leading-relaxed">
                Your payments and personal data are protected by industry-leading, bank-grade security.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card opacity-0 p-8 rounded-3xl bg-white/90 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="animate-float [animation-delay:800ms] w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Delivery</h3>
              <p className="text-gray-700 leading-relaxed">
                Get your digital products, licenses, and services delivered directly to your inbox instantly.
              </p>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}