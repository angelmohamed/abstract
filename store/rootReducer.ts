import { combineReducers } from "@reduxjs/toolkit";

import auth from "./slices/auth";
import wallet from "./slices/wallet";

export const reducer = (asyncReducers?: any) => (state: any, action: any) => {
	const combinedReducer = combineReducers({
		auth,
		wallet,
		...asyncReducers,
	});
	return combinedReducer(state, action);
};

export default reducer;
