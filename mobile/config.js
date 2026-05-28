// Remember to use your actual local IPv4 address, e.g., 'http://192.168.1.5:5000'
const BASE_URL = 'http://192.168.31.88:5000'; 

export const API_ROUTES = {
  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  PROFILE: `${BASE_URL}/auth/profile`,
  UPDATE_PROFILE: `${BASE_URL}/auth/update_profile`,
  
  // Shop & Cart
  PRODUCTS: `${BASE_URL}/shop/product`,
  GET_CART: `${BASE_URL}/cart/get_cart`,
  DELETE_CART_ITEM: `${BASE_URL}/cart/delete_item`,
  
  // Orders
  ORDER_HISTORY: `${BASE_URL}/order/history`,

  // Seller Shop & Inventory
  ADD_PRODUCT: `${BASE_URL}/shop/product`,
  SELLER_PRODUCTS: `${BASE_URL}/shop/seller`,
  PRODUCT_BASE: `${BASE_URL}/shop/product`, // Used for DELETE or PATCH /<id>
  
  // Seller Orders & Finance
  SELLER_ORDERS: `${BASE_URL}/order/seller_orders`,
  UPDATE_ORDER_STATUS: `${BASE_URL}/order/update_status`,
  SELLER_ANALYTICS: `${BASE_URL}/order/seller_analytics`,
  SELLER_LEDGER: `${BASE_URL}/shop/seller/ledger`,

};