# 🛒 My Market

**My Market** is a full-stack multi-platform e-commerce application developed for the SBU semester project. It includes a Flask backend, a React web frontend, and an Expo React Native mobile client.

---

## 🚀 What’s Included

- **Backend:** Flask + MongoDB via `mongoengine`
- **Frontend:** React + Vite + client-side role-based routing
- **Mobile:** Expo React Native app with tab navigation
- **Authentication:** JWT-based login and profile management
- **Image upload:** Cloudinary-backed product image storage
- **Deployment-ready:** Vercel configs for backend and frontend

---

## 🧭 Architecture Overview

### Root folders

- `backend/` — Flask API, MongoDB models, authentication, cart, orders, product management
- `frontend/` — React web application with protected pages for customers, sellers, and admins
- `mobile/` — Expo mobile app with bottom tabs and seller/customer flows

---

## 👥 Supported Roles

- **Customer** — browse products, manage cart, checkout, view order history, update profile
- **Seller** — add/edit/delete products, manage inventory, view seller orders, analytics, ledger
- **Admin** — manage users, view all orders, access admin dashboard/analytics

---

## 🧩 Backend Details

### Main backend entry
- `backend/main.py`
- Registers blueprints for `auth`, `shop`, `cart`, and `order`
- Connects to MongoDB using `MONGO_URI`
- Enables CORS for cross-origin access

### Backend routes

- `POST /auth/register` — register new users
- `POST /auth/login` — login and receive JWT
- `GET /auth/profile/<user_id>` — fetch user profile
- `PUT /auth/update_profile/<user_id>` — update user profile
- `GET /auth/admin/users` — list users (admin)
- `PATCH /auth/admin/users/<target_id>` — change role (admin)
- `DELETE /auth/admin/users/<target_id>` — delete user (admin)

- `GET /shop/product` — fetch all products
- `POST /shop/product` — add product with Cloudinary image upload
- `GET /shop/product/<product_id>` — get single product
- `PATCH /shop/product/<product_id>` — update product
- `DELETE /shop/product/<product_id>` — delete product and image
- `POST /shop/seller` — fetch products by seller
- `PATCH /shop/product/<product_id>/restock` — restock product
- `GET /shop/seller/ledger` — seller ledger history

- `POST /cart/add_cart` — add/update cart items
- `POST /cart/clear_cart` — clear cart
- `GET /cart/get_cart` — get cart for authenticated user
- `DELETE /cart/delete_item` — remove a cart item

- `POST /order/place_order` — place an order and clear cart
- `GET /order/history` — fetch authenticated user order history
- `GET /order/seller_orders` — get seller-specific orders
- `PATCH /order/update_status/<order_id>` — update order status
- `GET /order/seller_analytics` — seller metrics
- `GET /order/admin/all` — admin all orders
- `GET /order/admin/dashboard` — admin dashboard stats
- `GET /order/admin/analytics` — admin analytics

---

## 🗄️ Backend Models

- `User` — fullname, username, email, password, role, address
- `Product` — name, description, seller, cost_price, price, category, stock_quantity, image_url, specifications
- `InventoryLog` — seller ledger for restocks and expense tracking
- `Cart` — one cart per user with embedded `CartItem`
- `Order` — order items, total amount, status, gateway reference, timestamp

---

## 🌐 Frontend Details

### Main frontend entry
- `frontend/src/App.jsx`
- Uses `react-router-dom` for routes and role-based protected routes
- Includes layouts: `CustomerLayout`, `SellerLayout`, `AdminLayout`

### Key pages

- Public: `Home`, `Login`, `Register`, `Profile`
- Customer: `Shop`, `Cart`, `Checkout`, `OrderHistory`, `ProductDetail`
- Seller: `AddProduct`, `ManageInventory`, `ManageOrders`, `SellerAnalytics`, `SellerLedger`
- Admin: `AdminDashboard`, `AllOrders`, `UserControl`, `AdminAnalytics`

### Frontend API helper
- `frontend/src/api.js` — Axios instance with optional `VITE_API_URL`

---

## 📱 Mobile Details

### Main mobile entry
- `mobile/App.js`
- Expo app with authentication bootstrap and role-based redirection
- Customer tabs: `Store`, `Cart`, `Checkout`, `History`, `Profile`
- Seller tabs: `Inventory`, `Add`, `Orders`, `Analytics`, `Profile`
- Uses `AsyncStorage`, JWT decoding, and `react-navigation`

### Expo config
- `mobile/app.json`
- `mobile/package.json`

---

## 🛠️ Setup & Run

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with:

```env
MONGO_URI=<your-mongodb-uri>
SECRET_KEY=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
```

Then run:

```powershell
python main.py
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

- Use `VITE_API_URL` in `frontend/.env` when pointing to a deployed backend
- Leave blank for local proxy during development

### 3. Mobile

```powershell
cd mobile
npm install
npm start
```

- Then open the Expo project in the Expo Go app or emulator

---

## 📦 Dependencies

### Backend
- Flask
- Flask-Cors
- mongoengine
- pymongo
- PyJWT
- python-dotenv
- cloudinary

### Frontend
- react
- react-dom
- react-router-dom
- axios
- zod
- animejs
- react-hook-form
- bootstrap
- tailwindcss

### Mobile
- expo
- react-native
- axios
- jwt-decode
- react-hook-form
- react-navigation
- @react-native-async-storage/async-storage
- twrnc

---

## 🚀 Deployment Notes

- `backend/vercel.json` is configured for a serverless Flask deployment
- `frontend/vercel.json` rewrites all routes to `index.html`
- The mobile app is built with Expo and can be published with Expo or EAS

---

## 📌 Notes

- The backend is designed to work in serverless environments with a delayed MongoDB connection
- Product images upload to Cloudinary and are removed when products are deleted or replaced
- Order processing deducts stock and saves price snapshots for each item

---

## 📝 License
This repository is built for academic/project use and is not intended for commercial release.
