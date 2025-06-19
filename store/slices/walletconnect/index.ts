import { combineReducers } from "@reduxjs/toolkit";

import walletconnect from "./walletSlice";

const walletReducer = combineReducers({
	walletconnect,
});

export default walletReducer;
