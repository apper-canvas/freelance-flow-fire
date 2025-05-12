import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import tablesReducer from './tablesSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tables: tablesReducer
  },
});

export default store;