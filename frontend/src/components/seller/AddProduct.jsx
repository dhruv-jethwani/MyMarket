import React from 'react'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { jwtDecode } from 'jwt-decode'

const productSchema = z.object({
	name: z.string().min(1, "Product Name is required"), 
	description: z.string().min(1, "Product Description is required"), 
	seller: z.string(), 
	price: z.coerce.number().positive("Invalid Price."), 
	category: z.string().min(1, "Category is required"), 
	stock_quantity: z.coerce.number().int().nonnegative("Invalid Quantity."), 
	image_url: z.any().refine((files) => files?.length > 0, "Image is required"),
	specifications: z.array(z.object({
		key: z.string().min(1, "Key is required"),
		value: z.string().min(1, "Value is required")
	}))
})

function AddProduct() {
	const token = localStorage.getItem('token')
	const decoded = token ? jwtDecode(token) : null
	const user_id = decoded?.user_id || ''
	
	const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
		resolver: zodResolver(productSchema),
		defaultValues: {
			seller: user_id,
            category: 'general',
            specifications: []
		}
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: "specifications"
	})

	const API = '/shop/product'

	async function onSubmit(data) {
		const formData = new FormData()
        
        // Append basic fields
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('price', data.price)
        formData.append('category', data.category)
        formData.append('stock_quantity', data.stock_quantity)
        formData.append('seller', data.seller)
        
        // Append the file (it's a FileList, so we take the first item)
        formData.append('product_image', data.image_file[0])

        // Append specifications as a JSON string (Backends usually prefer this for complex objects in FormData)
        const specsObj = data.specifications.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
        formData.append('specifications', JSON.stringify(specsObj))
		
		try {
			const res = await axios.post(API, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
			console.log(res.data)
			reset()
		} catch (error) {
			console.log(error)
		}
	}

  return (
	<div>
		<h2>Add Product</h2>
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<input {...register('name')} placeholder='Enter Product Name'/>
				{errors.name && <p>{errors.name.message}</p>}
			</div>
			<div>
				<textarea {...register('description')} placeholder='Enter Product Description'/>
				{errors.description && <p>{errors.description.message}</p>}
			</div>
			<div>
				<input type="number" {...register('price')} placeholder='Enter Product Price'/>
				{errors.price && <p>{errors.price.message}</p>}
			</div>
			<div>
				<select {...register('category')}>
					<option value='general'>General</option>
					<option value='electronics'>Electronics</option>
					<option value='food'>Food</option>
				</select>
				{errors.category && <p>{errors.category.message}</p>}
			</div>
			<div>
				<input type="number" {...register('stock_quantity')} placeholder='Enter Available Stock Qty'/>
				{errors.stock_quantity && <p>{errors.stock_quantity.message}</p>}
			</div>

			{/* FILE UPLOAD FIELD */}
            <div>
                <label>Upload Product Image:</label>
                <input type="file" {...register('image_file')} accept="image/*" />
                {errors.image_file && <p style={{ color: 'red' }}>{errors.image_file.message}</p>}
            </div>
			
			<div style={{ background: '#f4f4f4', padding: '10px' }}>
                <h4>Specs</h4>
                {fields.map((item, index) => (
                    <div key={item.id} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                        <input {...register(`specifications.${index}.key`)} placeholder="Key" />
                        <input {...register(`specifications.${index}.value`)} placeholder="Value" />
                        <button type="button" onClick={() => remove(index)}>x</button>
                    </div>
                ))}
                <button type="button" onClick={() => append({ key: '', value: '' })}>+ Add Spec</button>
            </div>

			<div style={{ marginTop: '20px' }}>
				<button type="submit">Submit Product</button>
			</div>
		</form>
	</div>
  )
}

export default AddProduct