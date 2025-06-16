import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching all products
export const fetchGetAllProducts = createAsyncThunk(
    'productSlice/fetchGetAllProducts',
    async () => {
        const response = await axios.get('http://localhost:8080/api/products');
        return response.data; // Assuming this returns an array of products
    }
);

// Async thunk for fetching products by category
export const fetchGetProductsByCategory = createAsyncThunk(
    'productSlice/fetchGetProductsByCategory',
    async (categoryId) => {
        const response = await axios.get(`http://localhost:8080/api/products/buyer/category/${categoryId}`);
        return response.data; // Assuming this returns an array of products
    }
);

// Product slice
export const productSlice = createSlice({
    name: 'productSlice',
    initialState: {
        productsArray: [],
        
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetAllProducts.pending, (state) => {
                state.loading = true; // Set loading to true when fetching
                state.error = null; // Reset error
            })
            .addCase(fetchGetAllProducts.fulfilled, (state, action) => {
                // Set loading to false when done
                state.productsArray = action.payload; // Store fetched products
            })
            .addCase(fetchGetAllProducts.rejected, (state, action) => {
                state.loading = false; // Set loading to false on error
                state.error = action.error.message; // Store error message
            })
            .addCase(fetchGetProductsByCategory.pending, (state) => {
                state.loading = true; // Set loading to true when fetching
                state.error = null; // Reset error
            })
            .addCase(fetchGetProductsByCategory.fulfilled, (state, action) => {
                state.loading = false; // Set loading to false when done
                state.productsArray = action.payload; // Store fetched products by category
            })
            .addCase(fetchGetProductsByCategory.rejected, (state, action) => {
                state.loading = false; // Set loading to false on error
                state.error = action.error.message; // Store error message
            });
    },
});

// Export the async thunks for use in components
export const { } = productSlice.actions;

// Export the reducer for store configuration
export default productSlice.reducer;