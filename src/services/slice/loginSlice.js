// loginSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LoginCredentialsApi } from '../loginApi';

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (formData, thunkAPI) => {
        const response = await LoginCredentialsApi(formData);
        if (response.error) {
            return thunkAPI.rejectWithValue(response.error);
        }
        return response.data;
    }
);

// Rehydrate from sessionStorage on page load
const savedUser = (() => {
    try {
        const raw = sessionStorage.getItem('loginUserData');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
})();

const loginSlice = createSlice({
    name: 'userData',
    initialState: {
        userData: savedUser || [],
        error: null,
        loading: false,
        isLoggedIn: !!savedUser,
    },
    reducers: {
        logoutUser: (state) => {
            state.userData = [];
            state.error = null;
            state.loading = false;
            state.isLoggedIn = false;
            sessionStorage.removeItem('loginUserData');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
                state.isLoggedIn = true;
                // Persist to sessionStorage so refresh doesn't log out
                try {
                    sessionStorage.setItem('loginUserData', JSON.stringify(action.payload));
                } catch {}
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isLoggedIn = false;
            });
    },
});

export const { logoutUser } = loginSlice.actions;
export default loginSlice.reducer;
