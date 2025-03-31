// import React, { useContext, useState, useEffect } from 'react'
// import Title from '../components/Title'
// import {assets} from '../assets/assets'
// import CartTotal from '../components/CartTotal'
// import { ShopContext } from '../context/ShopContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'

// const PlaceOrder = () => {

//   const [method, setMethod] = useState('cod');
//   const {navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products} = useContext(ShopContext);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     street: '',
//     city: '',
//     state: '',
//     zipcode: '',
//     country: '',
//     phone: ''
//   });

 

//   const onChangeHandle = (event) => {
//     const name = event.target.name;
//     const value = event.target.value;

//     setFormData(data => ({...data, [name]:value}))
//   //   setFormData(data => {
//   //     const updatedData = {...data, [name]: value};
      
//   //     // Lưu vào localStorage
//   //     localStorage.setItem('orderFormData', JSON.stringify(updatedData));

//   //     return updatedData;
//   // });

//   }

//   // const onSubmitHandle = async (event) => {
//   //   event.preventDefault();
//   //   try {
      
//   //     let orderItems = []

//   //     for(const items in cartItems){
//   //       for(const item in cartItems[items]){
//   //         if (cartItems[items][item] > 0 ) {
//   //           const itemInfo = structuredClone(products.find(products => products._id === items))
//   //           if (itemInfo) {
//   //             itemInfo.size = item;
//   //             itemInfo.quantity = cartItems[items][item];
//   //             orderItems.push(itemInfo);
//   //           }
//   //         }
//   //       }
//   //     }
      
//   //     let orderData = {
//   //       address: formData,
//   //       items: orderItems,
//   //       amount: getCartAmount() + delivery_fee
//   //     }

//   //     switch(method){

//   //       //API Calls for COD
//   //       case 'cod':
//   //         const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers:{token}})
//   //         if (response.data.success) {
//   //           console.log(response.data)
//   //           setCartItems({})
//   //           navigate('/orders')
//   //         } else {
//   //           toast.error(response.data.message)
//   //         }

//   //         break;

//   //       default:
//   //         break;

//   //     }

//   //   } catch (error) {
      
//   //   }
//   // } 

//   const onSubmitHandle = async (event) => {
//     event.preventDefault()
//     try {

//       let orderItems = [];

//       for(const items in cartItems){
//         for(const item in cartItems[items]){
//             if(cartItems[items][item] > 0){
//               const itemInfo = structuredClone(products.find(product => product._id === items))
//               if(itemInfo){
//                 itemInfo.size = item
//                 itemInfo.quantity = cartItems[items][item]
//                 orderItems.push(itemInfo)
//               }
//             }
//         }
//       }

//       let orderData = {
//         address: formData,
//         items: orderItems,
//         amount: getCartAmount() + delivery_fee
//       }

//       switch (method) {

//         // API Calls for COD
//         case 'cod':
//           const response = await axios.post(backendUrl + '/api/order/place', orderData, {headers:{token}})
//           if (response.data.success) {
//             setCartItems({})
//             navigate('/orders')
//           } else {
//             toast.error(response.data.message)
//           }
//           break;
      
//         default:
//           break;
//       }

//     } catch (error) {
      
//     }
//   }

//   return (
//     <form onSubmit={onSubmitHandle} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
//       {/* Left Side */}
//       <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
//         <div className='text-xl sm:text-2xl my-3'>
//           <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
//         </div>
//         <div className='flex gap-3'>
//           <input onChange={onChangeHandle} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First name' />
//           <input onChange={onChangeHandle} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name' />
//         </div>
//         <input onChange={onChangeHandle} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email address' />
//         <input onChange={onChangeHandle} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street' />
//         <div className='flex gap-3'>
//           <input onChange={onChangeHandle} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City' />
//           <input onChange={onChangeHandle} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State' />
//         </div>
//         <div className='flex gap-3'>
//           <input onChange={onChangeHandle} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zipcode' />
//           <input onChange={onChangeHandle} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country' />
//         </div>
//         <input onChange={onChangeHandle} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone' />
//       </div>

//       {/** Right Side */}
//       <div className='mt-8'>
//         <div className='mt-8 min-w-80'>
//           <CartTotal />
//         </div>

//         <div className='mt-12'>
//           <Title text1={'PAYMENT'} text2={'METHOD'}/>
//           <div className='flex gap-3 flex-col lg:flex-row'>
//             <div onClick={()=>setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//               <p className={`min-w-3 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}` }></p>
//               <img className='h-5 mx-4' src={assets.stripe_logo} alt=''/>
//             </div>
//             <div onClick={()=>setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//               <p className={`min-w-3 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
//               <img className='h-5 mx-4' src={assets.razorpay_logo} alt=''/>
//             </div>
//             <div onClick={()=>setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
//               <p className={`min-w-3 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
//               <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
//             </div>
//           </div>

//           <div className='w-full text-end mt-8'>
//             <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
//           </div>

//         </div>
//       </div>
//     </form>
//   )
// }

// export default PlaceOrder

// // 11:14 - 11:19

import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    street: '', 
    city: '', 
    state: '', 
    zipcode: '', 
    country: '',
     phone: ''
  });

  const onChangeHandle = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandle = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = { ...products.find((p) => p._id === itemId) };
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
      
      
      if (response.data.success) {
        setCartItems({});
        navigate('/orders');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message)
    }
  };

  return (
    <form onSubmit={onSubmitHandle} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <Title text1='DELIVERY' text2='INFORMATION' />
        <div className='flex gap-3'>
          <input onChange={onChangeHandle} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First name' />
          <input onChange={onChangeHandle} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name' />
        </div>
        <input onChange={onChangeHandle} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email address' />
        <input onChange={onChangeHandle} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street' />
        <div className='flex gap-3'>
          <input onChange={onChangeHandle} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City' />
          <input onChange={onChangeHandle} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State' />
        </div>
        <div className='flex gap-3'>
          <input onChange={onChangeHandle} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zipcode' />
          <input onChange={onChangeHandle} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country' />
        </div>
        <input onChange={onChangeHandle} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone' />
      </div>
      <div className='mt-8'>
        <CartTotal />
        <Title text1='PAYMENT' text2='METHOD' />
        <div className='flex gap-3 flex-col lg:flex-row'>
          <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
            <p className={`min-w-3 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
          </div>
        </div>
        <div className='w-full text-end mt-8'>
          <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
