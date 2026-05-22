import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

function Cart() {

	const CART_API = '/cart/get_cart'
	const DELETE_API = '/cart/delete_cart_item'
	const token = localStorage.getItem('token');
	const decoded = token ? jwtDecode(token) : null;
	const userid = decoded?.user_id || '';
	const [cart, setCart] = useState([])

	const fetchcart = async () => {
    // If there's no token, they aren't logged in
		if (!token) return; 
		
		try {
			const res = await axios.get(CART_API, {
				// Send the token securely in the headers
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
			if (res.data && res.data.cart){
				setCart(res.data.cart)
			}
		} catch (error) {
			console.error("Error fetching cart data:", error)
		}
	}

	const handleRemoveItem = async (productid) => {
		try {
			const res = await axios.delete(DELETE_API, {
				data: {
					user_id: userid,
					product_id: productid
				}
			})
		} catch (error) {
			console.log(error)
		}
	}
	useEffect(()=>{
		fetchcart();
	},[])
  return (
	<div>
		{!cart?.items || cart.items.length === 0 ? (
			<p>Your cart is empty.</p>
		) : (
        <div>
          {cart.items.map((item, index) => {
			// Safely extract the product ID from MongoEngine's JSON format, 
			// falling back to index if it's completely missing.
			const productId = item.product?._id?.$oid || item.product?.$oid || item.product?.id || index;

			return (
				<div key={productId} className="cart-item" style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
				<h4>{item.product?.name || "Unknown Product"}</h4>
				<p>Price: ${item.product?.price || 0}</p>
				<p>Quantity: {item.quantity}</p>
				<p>Subtotal: ${item.item_total || (item.product?.price * item.quantity) || 0}</p>
				
				{/* Make sure your click handler passes this extracted ID string */}
				<button onClick={() => handleRemoveItem(productId)}>Remove</button>
				</div>
			);
})}
		</div>
		)}
	</div>
  )
}

export default Cart