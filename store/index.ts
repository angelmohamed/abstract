/* Core */
import { configureStore, type Action, type ThunkAction } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
// import { encryptTransform } from "redux-persist-transform-encrypt";
import autoMergeLevel1 from "redux-persist/lib/stateReconciler/autoMergeLevel1";
import storage from "./storage";
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector, type TypedUseSelectorHook } from "react-redux";

import rootReducer from "./rootReducer";

const isClient = typeof window !== "undefined";

const persistConfig = {
	key: "user",
	version: 1,
	storage,
	stateReconciler: autoMergeLevel1,
	whitelist: ["auth","wallet","walletconnect"],
	debug: false, // Set to false to reduce console noise
	// transforms: [
	// 	encryptTransform({
	// 		secretKey: "my-super-secret-key",
	// 		onError: function () {
	// 			// Handle the error.
	// 		},
	// 	}),
	// ],
};

const mainReducer = persistReducer(persistConfig, rootReducer());

export const reduxStore: any = configureStore({
	reducer: mainReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			immutableCheck: false,
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
	devTools: true,
});

reduxStore.asyncReducers = {};
export const persistor = isClient ? persistStore(reduxStore) : null;

export const injectReducer = (key: any, reducer: any) => {
	if (!isClient) {
		return false;
	}
	if (reduxStore.asyncReducers[key]) {
		return false;
	}
	reduxStore.asyncReducers[key] = reducer;
	reduxStore.replaceReducer(persistReducer(persistConfig, rootReducer(reduxStore.asyncReducers)));
	(persistor as any).persist();
	return reduxStore;
};

export const useDispatch = () => useReduxDispatch<ReduxDispatch>();
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector;

export default reduxStore;

// types
export type ReduxStore = typeof reduxStore;
export type ReduxState = ReturnType<typeof reduxStore.getState>;
export type ReduxDispatch = typeof reduxStore.dispatch;
export type ReduxThunkAction<ReturnType = void> = ThunkAction<ReturnType, ReduxState, unknown, Action>;
