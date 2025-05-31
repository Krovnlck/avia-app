import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { getSearchId, getTickets } from '../services/api';

export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { dispatch, getState }) => {
    try {
      const searchId = await getSearchId();
      let stop = false;
      let retryCount = 0;
      const MAX_RETRIES = 5;
      const BASE_RETRY_DELAY = 1000;

      while (!stop && retryCount < MAX_RETRIES) {
        try {
          const response = await getTickets(searchId);
          
          if (response.tickets && response.tickets.length > 0) {
            dispatch(addTickets(response.tickets));
          }

          stop = response.stop;
          retryCount = 0;
        } catch (err) {
          console.error('Error fetching tickets:', err);
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, BASE_RETRY_DELAY * Math.pow(2, retryCount)));
          } else {
            throw err;
          }
        }
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  tickets: [],
  status: 'idle',
  error: null,
  displayCount: 5
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setDisplayCount: (state, action) => {
      state.displayCount = typeof action.payload === 'function' 
        ? action.payload(state.displayCount)
        : action.payload;
    },
    addTickets: (state, action) => {
      const newTickets = action.payload.filter(ticket => {
        return !state.tickets.some(t => 
          t.carrier === ticket.carrier && 
          t.price === ticket.price && 
          t.segments.every((segment, index) => 
            segment.date === ticket.segments[index].date &&
            segment.origin === ticket.segments[index].origin &&
            segment.destination === ticket.segments[index].destination &&
            segment.duration === ticket.segments[index].duration &&
            segment.stops.length === ticket.segments[index].stops.length &&
            segment.stops.every((stop, i) => stop === ticket.segments[index].stops[i])
          )
        );
      });
      state.tickets.push(...newTickets);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Произошла ошибка при загрузке билетов';
      });
  }
});

export const { setDisplayCount, addTickets } = ticketsSlice.actions;

export const selectAllTickets = (state) => state.tickets.tickets;
export const selectTicketsStatus = (state) => state.tickets.status;
export const selectTicketsError = (state) => state.tickets.error;
export const selectDisplayCount = (state) => state.tickets.displayCount;

export const selectFilteredAndSortedTickets = createSelector(
  [selectAllTickets, 
   state => state.filters,
   state => state.sort.activeTab,
   selectDisplayCount],
  (tickets, filters, activeTab, displayCount) => {
    const filteredTickets = tickets.filter(ticket => {
      const maxStops = Math.max(...ticket.segments.map(segment => segment.stops.length));
      return (
        (maxStops === 0 && filters.direct) ||
        (maxStops === 1 && filters.oneStop) ||
        (maxStops === 2 && filters.twoStops) ||
        (maxStops === 3 && filters.threeStops)
      );
    });

    const sortedTickets = [...filteredTickets].sort((a, b) => {
      switch (activeTab) {
        case 'cheapest':
          return a.price - b.price;
        case 'fastest':
          const aDuration = a.segments.reduce((sum, segment) => sum + segment.duration, 0);
          const bDuration = b.segments.reduce((sum, segment) => sum + segment.duration, 0);
          return aDuration - bDuration;
        case 'optimal':
          const aScore = a.price / 100 + a.segments.reduce((sum, segment) => sum + segment.duration, 0) / 60;
          const bScore = b.price / 100 + b.segments.reduce((sum, segment) => sum + segment.duration, 0) / 60;
          return aScore - bScore;
        default:
          return 0;
      }
    });

    return sortedTickets.slice(0, displayCount);
  }
);

export default ticketsSlice.reducer; 