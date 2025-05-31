import { combineReducers } from "@reduxjs/toolkit";

import session from "./sessionSlice";
import user from "./userSlice";

const reducer = combineReducers({
	session,
	user,
	// unsynced
});

export default reducer;
