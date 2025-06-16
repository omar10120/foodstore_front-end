// Updated categorySlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Fixed async thunk - removed useSelector
export const fetchGetAllCategories = createAsyncThunk(
    'categorySlice/fetchGetAllCategories',
    async (_, { getState }) => { // Use getState from thunkAPI
        try {
            const state = getState();
            const token = state.auth.token;
            const response = await axios.get('http://localhost:8080/api/categories', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Failed to fetch categories");
        }
    }
);

// Create the category slice
export const categorySlice = createSlice({
    name: 'categorySlice',
    initialState: {
        CategoryArray: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGetAllCategories.fulfilled, (state, action) => {
                state.CategoryArray = action.payload;
                state.loading = false;
            })
            .addCase(fetchGetAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default categorySlice.reducer;