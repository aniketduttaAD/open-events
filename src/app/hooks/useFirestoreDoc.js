import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  actionError,
  actionFinish,
  actionStart,
} from "../asynchronous/asyncReducer";
import { dataFromSnapshot } from "../firestore/firestoreService";
import { onSnapshot } from "@firebase/firestore";

export default function useFirestoreDoc({
  query,
  data,
  deps,
  shouldExecute = true,
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (shouldExecute) {
      dispatch(actionStart());
      const unsubscribe = onSnapshot(
        query(),
        (snapshot) => {
          if (!snapshot.exists) {
            dispatch(
              actionError({
                code: "not-found",
                message: "Could not find event",
              })
            );
          } else {
            data(dataFromSnapshot(snapshot));
            dispatch(actionFinish());
          }
        },
        (error) => dispatch(actionError())
      );
      return () => {
        unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
