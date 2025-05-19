import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_SORT } from '../constants/structures';

const sortSlice = createSlice({
  name: 'sort',
  initialState: INITIAL_SORT,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    }
  }
});

export const { setActiveTab } = sortSlice.actions;
export default sortSlice.reducer; 