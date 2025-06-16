import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

// Helper function to get initial state from localStorage
const loadInitialState = () => {
  const storedToken = localStorage.getItem('token');
  const storedRole = localStorage.getItem('roleName');
  
  return {
    token: storedToken || null,
    roleName: storedRole || null,
    users: [],
    loading: false,
    error: null 
  };
};

// Async thunk for login
export const fetchLogin = createAsyncThunk('auth/fetchLogin', async (credentials) => {
    const response = await axios.post('http://localhost:8080/api/auth/login', credentials);
    return response.data; 
});

// Async thunk for registration
export const fetchRegister = createAsyncThunk('auth/fetchRegister', async (newUser) => {
    const response = await axios.post('http://localhost:8080/api/auth/register', newUser);
    return response.data;
});

// Create the auth slice
export const authSlice = createSlice({
    name: 'auth',
    initialState: loadInitialState(),
    reducers: {
        // Logout reducer
        logout: (state) => {
            state.token = null;
            state.roleName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('roleName');
            console.log("User logged out");
        }
    },
    extraReducers: (builder) => {
        // Login actions
        builder
            .addCase(fetchLogin.pending, (state) => {
                state.loading = true; 
                state.error = null; 
            })
            .addCase(fetchLogin.fulfilled, (state, action) => {
                state.token = action.payload.token; 
                state.roleName = action.payload.roleName; 
                state.loading = false;
                state.error = null; 

                // Store in localStorage for persistence
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('roleName', action.payload.roleName);
                
                console.log("User logged in. Token:", state.token);
                console.log("User logged in. Role:", state.roleName);
            })
            .addCase(fetchLogin.rejected, (state, action) => {
                state.loading = false; 
                state.error = action.error.message; 
                console.error("Login error:", action.error.message); 
            })
            // Register actions
            .addCase(fetchRegister.pending, (state) => {
                state.loading = true; 
                state.error = null; 
            })
            .addCase(fetchRegister.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.users.push(action.payload);
            })
            .addCase(fetchRegister.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                console.error("Registration error:", action.error.message);
            });
    }
});

// Export actions
export const { logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;