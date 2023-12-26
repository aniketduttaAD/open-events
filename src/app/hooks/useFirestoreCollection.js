import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actionError, actionStart } from "../asynchronous/asyncReducer";
import { dataFromSnapshot } from "../firestore/firestoreService";
import { onSnapshot } from "@firebase/firestore";

export default function useFirestoreCollection({ query, data, deps }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actionStart());
    const unsubscribe = onSnapshot(
      query(),
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => dataFromSnapshot(doc));
        data(docs);
        dispatch(actionError());
      },
      (error) => dispatch(actionError(error))
    );
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
