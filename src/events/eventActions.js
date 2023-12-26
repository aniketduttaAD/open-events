import {
  CLEAR_EVENTS,
  CREATE_EVENT,
  DELETE_EVENT,
  FETCH_EVENTS,
  LISTEN_TO_EVENT_CHATS,
  LISTEN_TO_SELECTED_EVENT,
  UPDATE_EVENT,
} from "./eventConstants";
import {
  actionError,
  actionFinish,
  actionStart,
} from "../app/asynchronous/asyncReducer";
import {
  dataFromSnapshot,
  fetchEventsFromFirestore,
} from "../app/firestore/firestoreService";
import { getDocs } from "@firebase/firestore";

export function fetchEvents(predicate, limit, lastDocSnapshot) {
  return async function (dispatch) {
    dispatch(actionStart());
    try {
      const snapshot = await getDocs(
        fetchEventsFromFirestore(predicate, limit, lastDocSnapshot)
      );
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const moreEvents = snapshot.docs.length >= limit;
      const events = snapshot.docs.map((doc) => dataFromSnapshot(doc));
      dispatch({
        type: FETCH_EVENTS,
        payload: { events, moreEvents },
      });
      dispatch(actionFinish());
      return lastVisible;
    } catch (error) {
      dispatch(actionError(error));
    }
  };
}

export function listenToSelectedEvent(event) {
  return {
    type: LISTEN_TO_SELECTED_EVENT,
    payload: event,
  };
}

export function createEvent(event) {
  return {
    type: CREATE_EVENT,
    payload: event,
  };
}

export function updateEvent(event) {
  return {
    type: UPDATE_EVENT,
    payload: event,
  };
}

export function deleteEvent(eventId) {
  return {
    type: DELETE_EVENT,
    payload: eventId,
  };
}

export function listenToEventChats(comments) {
  return {
    type: LISTEN_TO_EVENT_CHATS,
    payload: comments,
  };
}

export function clearEvents() {
  return {
    type: CLEAR_EVENTS,
  };
}
