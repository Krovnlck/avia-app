import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_FILTERS } from '../constants/structures';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: INITIAL_FILTERS,
  reducers: {
    toggleAll: (state) => {
      const newValue = !state.all;
      state.all = newValue;
      state.direct = newValue;
      state.oneStop = newValue;
      state.twoStops = newValue;
      state.threeStops = newValue;
    },
    toggleFilter: (state, action) => {
      const filterType = action.payload;
      state[filterType] = !state[filterType];

      const allOthersEnabled = Object.entries(state)
        .filter(([key]) => key !== 'all')
        .every(([, value]) => value);
      
      state.all = allOthersEnabled;
    }
  }
});

export const { toggleAll, toggleFilter } = filtersSlice.actions;
export default filtersSlice.reducer; 