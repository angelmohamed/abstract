import { combineReducers } from "@reduxjs/toolkit";

import auth from "./slices/auth";
import wallet from "./slices/wallet";
import walletconnect from "./slices/walletconnect"

export const reducer = (asyncReducers?: any) => (state: any, action: any) => {
	const combinedReducer = combineReducers({
		auth,
		wallet,
		walletconnect,
		...asyncReducers,
	});
	return combinedReducer(state, action);
};

export default reducer;
