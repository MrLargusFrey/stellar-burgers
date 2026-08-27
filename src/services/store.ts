import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { socketMiddleware } from './middleware/socketMiddleware';
import {
  wsConnect,
  wsConnecting,
  wsOpen,
  wsClose,
  wsError,
  wsMessage,
  wsDisconnect,
} from './slices/wsOrdersSlice';
import { useDispatch as useDispatchBase, useSelector as useSelectorBase } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

const wsActions = {
  wsConnect: wsConnect.type,
  wsDisconnect: wsDisconnect.type,
  wsConnecting: wsConnecting.type,
  wsOpen: wsOpen.type,
  wsClose: wsClose.type,
  wsError: wsError.type,
  wsMessage: wsMessage.type,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [wsConnect.type, wsDisconnect.type, wsError.type, wsClose.type],
      },
    }).concat(socketMiddleware(wsActions)),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchBase<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useSelectorBase;

export default store;