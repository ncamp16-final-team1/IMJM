import { configureStore } from '@reduxjs/toolkit';
import reservationReducer from '../components/features/reservation/reservationSlice';

const store = configureStore({
  reducer: {
    reservation: reservationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
