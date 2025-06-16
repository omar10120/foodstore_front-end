import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchGetAllCartItem = createAsyncThunk(
    'cartSlice/fetchGetAllCartItem',
    async (cartItemId) => {
        const response = await axios.get(`http://localhost:8080/api/cart-items/${cartItemId}`);
        return response.data;
    }
);

export const cartSlice = createSlice({
    name: 'cartSlice',
    initialState: {
        loading: false,
        error: null,
        cart: [],
        cartItem: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetAllCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetAllCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItem = action.payload;
            })
            .addCase(fetchGetAllCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const {} = cartSlice.actions;
export default cartSlice.reducer;