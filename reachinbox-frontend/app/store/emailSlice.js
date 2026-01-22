import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/* =========================
   FETCH SCHEDULED EMAILS
========================= */
export const fetchScheduledEmails = createAsyncThunk(
  "email/fetchScheduled",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/emails/scheduled`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch scheduled emails");

      const data = await res.json();
      return data.data; // 🔥 IMPORTANT: only array
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* =========================
   FETCH SENT EMAILS
========================= */
export const fetchSentEmails = createAsyncThunk(
  "email/fetchSent",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/emails/sent`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch sent emails");

      const data = await res.json();
      return data.data; // 🔥 IMPORTANT
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* =========================
   SCHEDULE EMAIL
========================= */
export const scheduleEmail = createAsyncThunk(
  "email/schedule",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/emails/schedule`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to schedule email");
      }

      const data = await res.json();
      return data; // backend does NOT return email list
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* =========================
   CANCEL SCHEDULED EMAIL
========================= */
export const cancelScheduledEmail = createAsyncThunk(
  "email/cancel",
  async (emailId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/api/emails/${emailId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to cancel email");
      return emailId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* =========================
   EMAIL SLICE
========================= */
const emailSlice = createSlice({
  name: "email",
  initialState: {
    scheduledEmails: [],
    sentEmails: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===== FETCH SCHEDULED ===== */
      .addCase(fetchScheduledEmails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduledEmails.fulfilled, (state, action) => {
        state.scheduledEmails = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchScheduledEmails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* ===== FETCH SENT ===== */
      .addCase(fetchSentEmails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSentEmails.fulfilled, (state, action) => {
        state.sentEmails = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSentEmails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* ===== SCHEDULE EMAIL ===== */
      .addCase(scheduleEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scheduleEmail.fulfilled, (state) => {
        // 🔥 Backend email doc return nahi karta
        // Best practice: refetch list
        state.isLoading = false;
      })
      .addCase(scheduleEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* ===== CANCEL ===== */
      .addCase(cancelScheduledEmail.fulfilled, (state, action) => {
        state.scheduledEmails = state.scheduledEmails.filter(
          (email) => email._id !== action.payload,
        );
      });
  },
});

export default emailSlice.reducer;
