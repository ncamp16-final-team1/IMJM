// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import salonReducer from './slices/salonSlice';

export const store = configureStore({
  reducer: {
    salon: salonReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;