import { configureStore, applyMiddleware } from "@reduxjs/toolkit";
import { composeWithDevTools } from "@redux-devtools/extension";
import rootReducer from "./rootReducer";
import thunk from "redux-thunk";
import { verifyUser } from "../../features/authentication/authActions";

export function configure() {
  const store = configureStore(
    {
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    },
    composeWithDevTools(applyMiddleware(thunk))
  );
  store.dispatch(verifyUser());
  return store;
}
