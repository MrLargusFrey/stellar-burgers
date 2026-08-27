import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export interface WSOrdersState {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isConnected: boolean;
  error: string | null;
}

const initialState: WSOrdersState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isConnected: false,
  error: null,
};

const wsOrdersSlice = createSlice({
  name: 'wsOrders',
  initialState,
  reducers: {
    wsConnect: (state, action: PayloadAction<string>) => {
      state.isConnected = false;
      state.error = null;
    },
    wsConnecting: (state) => {
      state.isConnected = false;
    },
    wsOpen: (state) => {
      state.isConnected = true;
      state.error = null;
    },
    wsClose: (state) => {
      state.isConnected = false;
    },
    wsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isConnected = false;
    },
    wsMessage: (state, action: PayloadAction<{ orders: TOrder[]; total: number; totalToday: number }>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    },
    wsDisconnect: (state) => {
      state.isConnected = false;
    },
  },
});

export const {
  wsConnect,
  wsConnecting,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
  wsDisconnect,
} = wsOrdersSlice.actions;

export default wsOrdersSlice.reducer;