import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';

interface OrderState {
  order: TOrder | null;
  orderNumber: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  orderNumber: null,
  isLoading: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredients: string[]) => {
    const response = await orderBurgerApi(ingredients);
    return { ...response, ingredients };
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.orderNumber = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = {
          _id: action.payload.order._id,
          status: action.payload.order.status,
          name: action.payload.order.name,
          createdAt: action.payload.order.createdAt,
          updatedAt: action.payload.order.updatedAt,
          number: action.payload.order.number,
          ingredients: action.payload.ingredients,
        } as TOrder;
        state.orderNumber = action.payload.order.number;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка создания заказа';
      });
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;