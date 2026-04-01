# 🛒 My Market - SBU E-Commerce Application

**My Market** is a professional, small-scale Strategic Business Unit (SBU) e-commerce application. Built with a modern integrated stack, it features a robust role-based access system for Customers, Staff, and Administrators to manage products, orders, and users seamlessly.

---

## 🚀 Tech Stack

* **Frontend:** React (JSX)
* **Backend:** Python (Flask)
* **Database:** MongoDB (Flexible Document Schema)
* **Authentication:** JWT (JSON Web Tokens)
* **Styling:** CSS3 / Tailwind

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
src/components/
├── admin/                 # Role Specific: Admin Only
│   └── UserControl.jsx    # Manage user roles & accounts
├── staff/                 # Role Specific: Staff/Manager Only
│   ├── InventoryMgt.jsx   # Product CRUD & Stock updates
│   └── OrderFulfillment.jsx # Global order tracking & status updates
├── customer/              # Role Specific: Customer Only
│   ├── Cart.jsx           # Shopping cart logic
│   ├── Checkout.jsx       # Payment & Shipping forms
│   └── OrderHistory.jsx   # Personal purchase records
├── Home.jsx               # COMMON (Everyone)
├── Shop.jsx               # COMMON (Everyone)
├── ProductDetail.jsx      # COMMON (Everyone)
├── Profile.jsx            # COMMON (Everyone)
├── Login.jsx              # COMMON (Everyone)
└── Register.jsx           # COMMON (Everyone)
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

* **Users:** `_id, username, email, password_hash, role (customer/staff/admin), address, created_at`
* **Products:** `_id, name, price, description, category, stock_quantity, image_url, specifications (flexible object)`
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
3. Start the development server: `npm start`

---

## 📄 License
This project is developed for the SBU E-Commerce "My Market" requirement. Internal Use Only.
