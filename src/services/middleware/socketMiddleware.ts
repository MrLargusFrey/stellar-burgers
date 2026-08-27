import { Middleware } from 'redux';

export type WsActions = {
  wsConnect: string;
  wsDisconnect: string;
  wsConnecting: string;
  wsOpen: string;
  wsClose: string;
  wsError: string;
  wsMessage: string;
};

export const socketMiddleware =
  (wsActions: WsActions): Middleware =>
  (store) => {
    let socket: WebSocket | null = null;
    let isConnected = false;
    let reconnectTimer = 0;
    let url = '';

    return (next) => (action: any) => {
      const { dispatch } = store;
      const { type, payload } = action;
      const {
        wsConnect,
        wsDisconnect,
        wsConnecting,
        wsOpen,
        wsClose,
        wsError,
        wsMessage
      } = wsActions;

      if (type === wsConnect) {
        url = payload;
        socket = new WebSocket(url);
        isConnected = true;
        dispatch({ type: wsConnecting });
      }

      if (socket) {
        socket.onopen = () => {
          dispatch({ type: wsOpen });
        };

        socket.onerror = () => {
          dispatch({ type: wsError, payload: 'WebSocket error' });
        };

        socket.onmessage = (event) => {
          const { data } = event;
          const parsedData = JSON.parse(data);
          dispatch({ type: wsMessage, payload: parsedData });
        };

        socket.onclose = (event) => {
          dispatch({ type: wsClose });
          if (isConnected) {
            reconnectTimer = window.setTimeout(() => {
              dispatch({ type: wsConnect, payload: url });
            }, 3000);
          }
        };

        if (type === wsDisconnect) {
          isConnected = false;
          clearTimeout(reconnectTimer);
          if (socket) {
            socket.close();
            socket = null;
          }
        }
      }

      return next(action);
    };
  };