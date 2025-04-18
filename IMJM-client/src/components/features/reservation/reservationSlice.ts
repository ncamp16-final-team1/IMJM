// src/components/features/reservation/reservationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReservationInfo } from '../../../type/reservation/reservation';

const initialState: ReservationInfo = {
  salonId: '',
  stylistId: null,
  stylistName: '',  
  selectedDate: '',
  selectedTime: '',
  selectedType: '',
  userId: '',
  selectedMenu: null,
};

const reservationSlice = createSlice({
  name: 'reservation',
  initialState,
  reducers: {
    setReservationInfo(state, action: PayloadAction<ReservationInfo>) {
      return action.payload;
    },
    // 필요한 다른 리듀서가 있다면 여기에 추가
  },
});

export const { setReservationInfo } = reservationSlice.actions;
export default reservationSlice.reducer;