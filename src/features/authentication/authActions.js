import { SIGN_IN_USER, SIGN_OUT_USER } from "./authConstants";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { APP_LOADED } from "../../app/asynchronous/asyncReducer";
import {
  dataFromSnapshot,
  getUserInfo,
} from "../../app/firestore/firestoreService";
import { listenToCurrentUserProfile } from "../userprofiles/profileActions";
import { app } from "../../app/configs/firebase";
import { onSnapshot } from "@firebase/firestore";

const auth = getAuth(app);
export function signedInUser(user) {
  return {
    type: SIGN_IN_USER,
    payload: user,
  };
}

export function verifyUser() {
  return function (dispatch) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(signedInUser(user));
        const profileRef = getUserInfo(user.uid);
        onSnapshot(profileRef, (snapshot) => {
          dispatch(listenToCurrentUserProfile(dataFromSnapshot(snapshot)));
          dispatch({ type: APP_LOADED });
        });
      } else {
        dispatch(signedOutUser());
        dispatch({ type: APP_LOADED });
      }
    });
  };
}

export function signedOutUser() {
  return {
    type: SIGN_OUT_USER,
  };
}
