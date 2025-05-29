import rootReducer from "./rootReducer";
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { configureStore } from "@reduxjs/toolkit";
import type { TypedUseSelectorHook } from 'react-redux';
import type { ThunkAction } from 'redux-thunk';
import type { Action } from '@reduxjs/toolkit';
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
const middlewares = [thunk];

const persistConfig = {
  key: "user",
  keyPrefix: "",
  storage,
  stateReconciler: autoMergeLevel1,
  whitelist: ["auth", "theme","UserSetting","user"],
  debug: true
};

const store: any = configureStore({
  reducer: persistReducer(persistConfig, rootReducer()),
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk),
  devTools: process.env.NODE_ENV === "development",
});

store.asyncReducers = {};
export const persistor = persistStore(store);



export const injectReducer = (key: any, reducer: any) => {
  if (store.asyncReducers[key]) {
    return false
  }
  store.asyncReducers[key] = reducer;
  store.replaceReducer(
    persistReducer<any, any>(persistConfig, rootReducer(store.asyncReducers))
  );
  persistor.persist();
  return store;
};



export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;


export const useDispatch = () => useReduxDispatch<AppDispatch>();

export default store;
