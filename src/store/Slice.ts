import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IItem {
  id: number;
  name: string;
}

const defaultState: {
  value: number;
  cartItems: IItem[];
} = {
  value: 10,
  cartItems: []
};

const slice = createSlice({
  name: 'slice',
  initialState: defaultState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    addCartItem: (state, action: PayloadAction<IItem>) => {
      state.cartItems = [...state.cartItems, action.payload];
    }
  }
});

export const { increment, decrement, incrementByAmount, addCartItem } = slice.actions;
export default slice.reducer;
