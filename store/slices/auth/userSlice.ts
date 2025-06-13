import { createSlice } from "@reduxjs/toolkit";

export const initialState: UserSliceState | {} = {};

export const userSlice = createSlice({
	name: "auth/user",
	initialState: initialState,
	reducers: {
		setUser: (_, action) => action.payload,
		updateSetting: (state, action) => {
			return { ...state, ...action.payload };
		},
		reset: () => initialState,
	},
});

// Types
export interface UserSliceState {
	name: string,
	userName: string,
	email: string,
	uniqueId: string,
	status: string,
	walletAddress: string,
	profileImg: string,
	loginType: string,
	userId: string,
}

export const { setUser, reset, updateSetting } = userSlice.actions;

export default userSlice.reducer;
