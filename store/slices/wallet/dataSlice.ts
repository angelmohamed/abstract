/* Core */
import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
	name: "wallet/data",
	initialState: {
		balance: 0,
		inOrder: 0,
		locked: 0,
		position: 0,
	},
	reducers: {
		setWallet: (_, action) => ({
			balance: action.payload.balance ?? 0,
			inOrder: action.payload.inOrder ?? 0,
			locked: action.payload.locked ?? 0,
			position: action.payload.position ?? 0,
		  }),
		  
	},
});

export const { setWallet } = dataSlice.actions;
export default dataSlice.reducer;
