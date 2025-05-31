import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'cheapest'
};

const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    }
  }
});

export const { setActiveTab } = sortSlice.actions;
export default sortSlice.reducer; 