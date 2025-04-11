// src/store/slices/salonSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SalonState {
  currentSalonId: string;
}

const initialState: SalonState = {
  currentSalonId: 'SALON001'  // 기본값
};

export const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    setCurrentSalon: (state, action: PayloadAction<string>) => {
      state.currentSalonId = action.payload;
    }
  }
});

export const { setCurrentSalon } = salonSlice.actions;
export default salonSlice.reducer;