import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo/Brand Name */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
                MyMarket
              </Link>
            </div>

            {/* Nav Links */}
            <ul className="flex space-x-8">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}

export default App