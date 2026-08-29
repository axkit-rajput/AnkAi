import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    /* false until the initial /api/me call settles, so the UI can avoid
       flashing the sign-in screen at a user who is already logged in. */
    authChecked: false,
  },
  reducers: {
    setUserdata: (state, action) => {
      state.userData = action.payload;
      state.authChecked = true;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
  },
});

export const { setUserdata, setAuthChecked } = userSlice.actions;
export default userSlice.reducer;
