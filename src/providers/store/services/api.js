import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_URL + '/v1',
});

export const api = createApi({
  baseQuery,
  endpoints: () => ({}),
  tagTypes: [
    'User',
    'Shops',
    'SellerShop',
    'Categories',
    'Subcategories',
    'GroupedSubcategories',
    'Products',
    'Wishlist',
    'Reviews',
    'ReviewsSummary',
    'BuyerOrders',
    'Wishlist',
  ],
});
