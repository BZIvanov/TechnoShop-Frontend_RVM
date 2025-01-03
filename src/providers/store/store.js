import { configureStore } from '@reduxjs/toolkit';
import {
  useDispatch as useAppDispatch,
  useSelector as useTypedSelector,
} from 'react-redux';

import { api } from './services/api';
import userSlice from './features/user/userSlice';
import shopSlice from './features/shop/shopSlice';
import notificationSlice from './features/notification/notificationSlice';
import productsFiltersSlice from './features/productsFilters/productsFiltersSlice';
import cartSlice from './features/cart/cartSlice';
import { asyncErrorNotification } from './middlewares/asyncErrorNotification';

export const createStore = (options = {}) => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      user: userSlice,
      shop: shopSlice,
      notification: notificationSlice,
      productsFilters: productsFiltersSlice,
      cart: cartSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, asyncErrorNotification),
    // import.meta.env.MODE is provided by Vite
    devTools: import.meta.env.MODE === 'development',
    ...options,
  });
};

export const useDispatch = useAppDispatch;
export const useSelector = useTypedSelector;
