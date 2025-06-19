/* Core */
import { createSlice } from "@reduxjs/toolkit";

const dataSlice = createSlice({
	name: "walletconnect",
	initialState: {
		isConnected: false,
		address: "",
		network: "",
		type: "",
		rpc: "",
		balance: 0,
	  },
	reducers: {
		setWalletConnect: (_, action) => ({
			isConnected: action.payload.isConnected ?? false,
			address: action.payload.address ?? "",
			network: action.payload.network ?? "",
			type: action.payload.type ?? "",
			rpc: action.payload.rpc ?? "",
			balance: action.payload.balance ?? 0,
		  }),
		  
	},
});

export const { setWalletConnect } = dataSlice.actions;
export default dataSlice.reducer;
