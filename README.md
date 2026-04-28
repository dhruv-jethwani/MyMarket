# 🛒 My Market - SBU E-Commerce Application

**My Market** is a professional, small-scale Strategic Business Unit (SBU) e-commerce application. Built with a modern integrated stack, it features a robust role-based access system for Customers, Staff, and Administrators to manage products, orders, and users seamlessly.

---

## 🚀 Tech Stack

* **Frontend:** React (JSX)
* **Backend:** Python (Flask)
* **Database:** MongoDB (Flexible Document Schema)
* **Authentication:** JWT (JSON Web Tokens)
* **Styling:** CSS3 / Tailwind / animejs(For Animations)

---

## 👥 User Roles & Permissions

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Customer** | Storefront | Browse products, manage cart, checkout, and view personal order history. |
| **Staff/Manager** | Operations | Manage inventory (CRUD), update stock levels, and fulfill customer orders. |
| **Admin** | Full System | All Staff permissions + user management (assigning roles) and site analytics. |

---

## 📁 Project Structure (Components)

The project follows a hybrid architecture: **Common** components remain in the root directory, while **Specific** components are nested within role-based folders for maximum security and organization.

```text
src/
 ┣ components/
 ┃ ┣ admin/
 ┃ ┃ ┣ AllOrders.jsx
 ┃ ┃ ┣ UserControl.jsx
 ┃ ┃ ┗ ManageProducts.jsx     
 ┃ ┣ auth/
 ┃ ┃ ┣ Login.jsx
 ┃ ┃ ┣ Register.jsx
 ┃ ┃ ┗ ProtectedRoute.jsx     <-- NEW: Your Security Gatekeeper
 ┃ ┣ common/
 ┃ ┃ ┣ Home.jsx
 ┃ ┃ ┣ ProductDetail.jsx
 ┃ ┃ ┣ Profile.jsx
 ┃ ┃ ┗ ProductCard.jsx        
 ┃ ┣ customer/
 ┃ ┃ ┣ Shop.jsx               
 ┃ ┃ ┣ Cart.jsx
 ┃ ┃ ┣ Checkout.jsx
 ┃ ┃ ┗ OrderHistory.jsx
 ┃ ┗ seller/
 ┃   ┣ AddProduct.jsx
 ┃   ┣ ManageInventory.jsx
 ┃   ┗ ManageOrders.jsx
 ┣ layouts/                   <-- NEW FOLDER: UI Wrappers
 ┃ ┣ AdminLayout.jsx          (Contains Admin Navbar & Sidebar)
 ┃ ┣ CustomerLayout.jsx       (Contains Customer Navbar & Cart Icon)
 ┃ ┗ SellerLayout.jsx         (Contains Seller Navbar & Stats)
 ┣ App.css
 ┣ App.jsx                    <-- Where your routes and layouts combine
 ┣ index.css
 ┗ main.jsx
```
---

## 🛠️ Key Features

### **1. Flexible Product Management**
Utilizing **MongoDB**, "My Market" supports diverse product categories with varying attributes (sizes, colors, technical specs) without the constraints of a rigid relational table.

### **2. Role-Based Protected Routing**
The React frontend uses conditional rendering and higher-order components to ensure users only see the interface relevant to their role. The Flask backend enforces this by using JWT-based decorators to protect sensitive API endpoints.

### **3. Live Order Fulfillment**
* **Customers:** Track real-time progress of purchases (Pending → Shipped → Delivered).
* **Staff/Managers:** A dedicated workspace to manage global inventory and process incoming orders efficiently.

### **4. Secure Authentication & Data Integrity**
* **Encryption:** Passwords are never stored in plain text; they are hashed using `Bcrypt`.
* **Price Snapshots:** Orders capture the product price at the exact moment of purchase, protecting the record from future price fluctuations.

---

## 🗄️ Database Schema Design (MongoDB)

* **Users:** `_id, fullname, username, email, password, role, address, created_at`
* **Products:** `_id, name, description, seller, price, category, stock_quantity, image_url, specifications (flexible object)`
* **Carts:** `_id, user_id, items: [{product_id, quantity}], updated_at`
* **Orders:** `_id, user_id, items: [{name, price_at_purchase, quantity}], total_amount, status, timestamp`

---

## ⚙️ Installation & Setup

### **Backend (Flask)**
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate environment:
    * Windows: `venv\Scripts\activate`
    * Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python app.py`

### **Frontend (React)**
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

---

## 📄 License
This project is developed for the SBU E-Commerce "My Market" requirement. Internal Use Only.
