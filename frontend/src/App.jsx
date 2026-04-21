import { Routes, Route } from 'react-router-dom'

// Layouts & Guards
import ProtectedRoute from './components/auth/ProtectedRoute'
import CustomerLayout from './layouts/CustomerLayout'
import SellerLayout from './layouts/SellerLayout'
import AdminLayout from './layouts/AdminLayout'

// ... (import your page components here)
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

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* CUSTOMER ROUTES (Requires login + 'customer' role) */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path='/shop' element={<Shop />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/history' element={<OrderHistory />} />
        </Route>
      </Route>

      {/* SELLER ROUTES (Requires login + 'seller' role) */}
      <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
        <Route element={<SellerLayout />}>
          <Route path='/add_product' element={<AddProduct />} />
          <Route path='/inventory' element={<ManageInventory />} />
          <Route path='/manage_orders' element={<ManageOrders />} />
        </Route>
      </Route>

      {/* ADMIN ROUTES (Requires login + 'admin' role) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path='/admin/orders' element={<AllOrders />} />
          <Route path='/admin/users' element={<UserControl />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App