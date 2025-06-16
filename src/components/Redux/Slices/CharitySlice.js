import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchGetAllCharities = createAsyncThunk(
    'charitySlice/fetchGetAllCharities',
    async () => {
        const response = await axios.get('http://localhost:8080/api/charities');
        return response.data;
    }
);


export const charitySlice = createSlice({
    name: 'charitySlice',
    initialState: {
        loading: false,
        error: null,
        charity: []
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetAllCharities.pending, (state) => {
                state.loading = true; 
                state.error = null; 
            })
            .addCase(fetchGetAllCharities.fulfilled, (state, action) => {
                state.loading = false; 
                state.charity = action.payload; 
            })
            .addCase(fetchGetAllCharities.rejected, (state, action) => {
                state.loading = false; 
                state.error = action.error.message; 
            });
    }
});


export const {} = charitySlice.actions;


export default charitySlice.reducer;