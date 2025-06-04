/* Core */
import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
	name: "wallet/data",
	initialState: {
		balance: 0,
		inOrder: 0,
		locked: 0,
	},
	reducers: {
		setWallet: (_, action) => action.payload,
	},
});

export const { setWallet } = dataSlice.actions;
export default dataSlice.reducer;
