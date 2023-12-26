import { combineReducers } from "redux";
import eventReducer from "../../events/eventReducer";
import modalReducer from "../common/modals/modalReducer";
import authReducer from "../../features/authentication/authReducer";
import imageReducer from "../common/imageupload/imageUploadReducer";
import asyncReducer from "../asynchronous/asyncReducer";
import profileReducer from "../../features/userprofiles/profileReducer";

const rootReducer = combineReducers({
  event: eventReducer,
  modals: modalReducer,
  auth: authReducer,
  asynchronous: asyncReducer,
  profile: profileReducer,
  imageupload: imageReducer,
});

export default rootReducer;
