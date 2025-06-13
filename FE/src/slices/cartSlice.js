import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "Thanh toán khi nhận hàng",
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === existItem._id ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCartItems: (state) => {
      state.cartItems = [];
    },
    calculatePrices: (state) => {
      state.itemsPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
      );
      state.taxPrice = Number((state.itemsPrice * 0.1).toFixed(2));
      state.shippingPrice = state.itemsPrice > 100 ? 0 : 10;
      state.totalPrice = Number(
        (state.itemsPrice + state.taxPrice + state.shippingPrice).toFixed(2)
      );
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  calculatePrices,
} = cartSlice.actions;

export default cartSlice.reducer;
