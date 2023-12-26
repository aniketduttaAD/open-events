import React, { useEffect, useState } from "react";
import { Grid, Loader } from "semantic-ui-react";
import InfiniteScroll from "react-infinite-scroller";
import { useDispatch, useSelector } from "react-redux";
import UserDetails from "./UserDetails";
import FilterEvents from "./FilterEvents";
import { clearEvents, fetchEvents } from "../eventActions";
import EventPlaceholder from "./EventPlaceholder";
import EventsPage from "./EventsPage";

export default function EventDashboard() {
  const limit = 2;
  const dispatch = useDispatch();
  const { events, moreEvents } = useSelector((state) => state.event);
  const { loading } = useSelector((state) => state.asynchronous);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const [predicate, setPredicate] = useState(
    new Map([
      ["startDate", new Date()],
      ["filter", "all"],
    ])
  );

  function handleSetPredicate(key, value) {
    dispatch(clearEvents());
    setLastDocSnapshot(null);
    setPredicate(new Map(predicate.set(key, value)));
  }

  useEffect(() => {
    setLoadingInitial(true);
    dispatch(fetchEvents(predicate, limit)).then((lastVisible) => {
      setLastDocSnapshot(lastVisible);
      setLoadingInitial(false);
    });
    return () => {
      dispatch(clearEvents());
    };
  }, [dispatch, predicate]);

  function handleFetchNextEvents() {
    dispatch(fetchEvents(predicate, limit, lastDocSnapshot)).then(
      (lastVisible) => {
        setLastDocSnapshot(lastVisible);
      }
    );
  }
  return (
    <Grid>
      <span
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <FilterEvents
          predicate={predicate}
          setPredicate={handleSetPredicate}
          loading={loading}
        />
      </span>
      <Grid.Column width={3}>
        <UserDetails />
      </Grid.Column>
      {events.length !== 0 && (
        <Grid.Column width={13}>
          {loadingInitial ? (
            <>
              <EventPlaceholder />
              <EventPlaceholder />
            </>
          ) : (
            <InfiniteScroll
              pageStart={0}
              loadMore={handleFetchNextEvents}
              hasMore={!loading && moreEvents}
              initialLoad={false}
            >
              <EventsPage events={events} />
              <div style={{ height: 25 }}></div>
            </InfiniteScroll>
          )}
        </Grid.Column>
      )}
      <Grid.Column width={16}>
        <Loader active={loading} />
      </Grid.Column>
    </Grid>
  );
}
