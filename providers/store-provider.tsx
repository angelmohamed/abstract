"use client";

/* Core */
/* Instruments */
import { persistor, reduxStore } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

const isClient = typeof window !== "undefined";

export const StoreProvider = (props: React.PropsWithChildren) => {
	if (isClient && persistor) {
		return (
			<Provider store={reduxStore}>
				<PersistGate loading={null} persistor={persistor as any}>
					{props.children}
				</PersistGate>
			</Provider>
		);
	}

	return <Provider store={reduxStore}>{props.children}</Provider>;
};
