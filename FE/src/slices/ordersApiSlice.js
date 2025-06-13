import { apiSlice } from "./apiSlice";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: "/api/orders",
        method: "POST",
        body: order,
      }),
    }),
    getOrder: builder.query({
      query: (id) => ({
        url: `/api/orders/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: "/api/orders/myorders",
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `/api/orders/${orderId}/pay`,
        method: "PUT",
        body: details,
      }),
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/deliver`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderQuery,
  useGetMyOrdersQuery,
  usePayOrderMutation,
  useDeliverOrderMutation,
} = ordersApiSlice;
