import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import emailReducer from "./emailSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    email: emailReducer,
  },
});
