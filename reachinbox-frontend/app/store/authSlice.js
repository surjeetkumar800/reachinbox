import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/* =========================
   FETCH CURRENT USER
   GET /api/auth/me
========================= */
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        return rejectWithValue("UNAUTHORIZED");
      }

      if (!res.ok) {
        throw new Error("Auth check failed");
      }

      const data = await res.json();

      if (!data?.user) {
        return rejectWithValue("INVALID_SESSION");
      }

      return data; // { success, user }
    } catch (err) {
      return rejectWithValue(err.message || "NETWORK_ERROR");
    }
  },
);

/* =========================
   LOGOUT USER
   GET /api/auth/logout
========================= */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      return true;
    } catch (err) {
      return rejectWithValue(err.message || "LOGOUT_FAILED");
    }
  },
);

/* =========================
   AUTH SLICE
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,

    // 🔥 CRITICAL: start as true
    isLoading: true,

    error: null,
    authChecked: false, // 👈 important for guards
  },

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.authChecked = true;
    },
  },

  extraReducers: (builder) => {
    /* ===== FETCH ME ===== */
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.authChecked = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.authChecked = true;

        // clean error mapping
        if (action.payload === "UNAUTHORIZED") {
          state.error = null;
        } else {
          state.error = action.payload;
        }
      });

    /* ===== LOGOUT ===== */
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.authChecked = true;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
