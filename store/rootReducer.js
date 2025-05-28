import { combineReducers } from "redux";
import auth from "./auth";

const rootReducer = (asyncReducers) => (state, action) => {
  const combinedReducer = combineReducers({
    auth,
    ...asyncReducers,
  });
  return combinedReducer(state, action);
};

export default rootReducer;
