import { combineReducers } from "@reduxjs/toolkit";

import data from "./dataSlice";

const walletReducer = combineReducers({
	data,
});

export default walletReducer;
