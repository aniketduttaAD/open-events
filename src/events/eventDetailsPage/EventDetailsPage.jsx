import React from "react";
import EventDetailsChat from "./EventsDetailsChat";
import EventDetailsInfo from "./EventsDetailsInfo";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useFirestoreDoc from "../../app/hooks/useFirestoreDoc";
import { listenToEventFromFirestore } from "../../app/firestore/firestoreService";
import { listenToSelectedEvent } from "../eventActions";
import LoadingComponent from "../../app/layout/LoadingComponent";

export default function EventDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { loading, error } = useSelector((state) => state.asynchronous);
  const { currentUser } = useSelector((state) => state.auth);
  const event = useSelector((state) => state.event.selectedEvent);
  const isHost = event?.hostUid === currentUser?.uid;
  const isGoing = event?.attendees?.some((a) => a.id === currentUser?.uid);
  useFirestoreDoc({
    query: () => listenToEventFromFirestore(params.id),
    data: (event) => dispatch(listenToSelectedEvent(event)),
    deps: [params.id, dispatch],
  });
  if (loading || (!event && !error))
    return <LoadingComponent content='Loading Event...' />;

  if (error) navigate("/error");

  return (
    <>
      <EventDetailsInfo event={event} isGoing={isGoing} isHost={isHost} />
      <EventDetailsChat
        event={event}
        eventId={event.id}
        hostUid={event.hostUid}
      />
    </>
  );
}
