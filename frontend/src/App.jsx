import { Routes, Route } from 'react-router-dom'

// Layouts & Guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import CustomerLayout from './layouts/CustomerLayout'
import SellerLayout from './layouts/SellerLayout'
import AdminLayout from './layouts/AdminLayout'

// Pages
import Home from './components/common/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import AddProduct from './components/seller/AddProduct'
import Shop from './components/customer/Shop'
import Profile from './components/common/Profile'
import OrderHistory from './components/customer/OrderHistory'
import Cart from './components/customer/Cart'
import ManageInventory from './components/seller/ManageInventory'
import ManageOrders from './components/seller/ManageOrders'
import AllOrders from './components/admin/AllOrders'
import UserControl from './components/admin/UserControl'
import ProductDetail from './components/common/ProductDetail'
import Checkout from './components/customer/Checkout'
import SellerAnalytics from './components/seller/SellerAnalytics'
import SellerLedger from './components/seller/SellerLedger'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminAnalytics from './components/admin/AdminAnalytics'

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
	  <Route path='/profile' element={<Profile />} />

      {/* CUSTOMER ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path='/store' element={<Shop />} />
          <Route path='/items' element={<Cart />} />
          <Route path='/history' element={<OrderHistory />} />
          <Route path='/checkout' element={<Checkout />} />
          {/* PREFIXED: Store Product Route */}
		  <Route path='/store/product/:id' element={<ProductDetail />} />
        </Route>
      </Route>

      {/* SELLER ROUTES */}
	  <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
		<Route element={<SellerLayout />}>
			<Route path='/add_product' element={<AddProduct />} />
			<Route path='/inventory' element={<ManageInventory />} />
			<Route path='/manage_orders' element={<ManageOrders />} />
			<Route path='/analytics' element={<SellerAnalytics />} />
			<Route path='/ledger' element={<SellerLedger />} />
            {/* PREFIXED: Seller Product Route */}
			<Route path='/seller/product/:id' element={<ProductDetail />} />
		</Route>
	  </Route>

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
          <Route path='/admin/orders' element={<AllOrders />} />
          <Route path='/admin/users' element={<UserControl />} />
          <Route path='/admin/analytics' element={<AdminAnalytics />} /> {/* Analytics routes back to the main God-Mode Dashboard */}
        </Route>
      </Route>
    </Routes>
  )
}

export default App