/* Core */
import { createSlice } from "@reduxjs/toolkit";

const initialState: SessionSliceState = {
	signedIn: false,
};

export const sessionSlice = createSlice({
	name: "auth/session",
	initialState,
	reducers: {
		signIn: (state, action) => {
			state.signedIn = true;
			state.token = action.payload;
		},
		signOut: () => initialState,
		setToken: (state, action) => {
			state.token = action.payload;
		},
	},
});

// Types
export interface SessionSliceState {
	token?: string;
	signedIn: boolean;
}

export const { signIn, signOut, setToken } = sessionSlice.actions;

export default sessionSlice.reducer;
