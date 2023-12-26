import React, { useMemo } from "react";
import { Feed, Message } from "semantic-ui-react";
import { formatDistance } from "date-fns";
import { useSelector } from "react-redux";

export default function EventFeedItem({ feed }) {
  const { currentUser } = useSelector((state) => state.auth);
  const sortedFeed = useMemo(() => {
    return Object.values(feed).sort((a, b) => b.date - a.date);
  }, [feed]);

  return sortedFeed.map((item, index) => {
    let summary;
    switch (item.code) {
      case "joined-event":
        summary = (
          <>
            <a href={`/profile/${item.userUid}`}>{item.displayName} </a> has
            booked a place in event{" "}
            <a href={`/events/${item.eventId}`}>{item.title}</a>
          </>
        );
        break;
      case "left-event":
        summary = (
          <>
            <a href={`/profile/${item.userUid}`}>{item.displayName} </a> has
            cancelled their place on{" "}
            <a href={`/events/${item.eventId}`}>{item.title}</a>
          </>
        );
        break;
      case "event-created":
        if (currentUser.uid === item.userUid) {
          summary = null;
        } else {
          summary = (
            <>
              <a href={`/profile/${item.userUid}`}>{item.displayName} </a>
              is organising an event{" "}
              <a href={`/events/${item.eventId}`}>{item.title}</a>
            </>
          );
        }
        break;
      case "event-deleted":
        if (currentUser.uid === item.userUid) {
          summary = null;
        } else {
          summary = (
            <>
              <a href={`/profile/${item.userUid}`}>{item.displayName} </a>
              has cancelled event "{item.title}", Sorry for the inconvenience
              caused.{" "}
            </>
          );
        }
        break;
      case "started-following":
        summary = (
          <>
            <a href={`/profile/${item.uid}`}>{item.displayName} </a>
            started following you.
          </>
        );
        break;
      default:
        summary = "Something happened";
    }

    return (
      <Feed.Event key={index}>
        {summary !== null ? (
          <>
            <Feed.Label image={item.photoURL} />
            <Feed.Content>
              <Feed.Date>
                {formatDistance(new Date(item.date), new Date())} ago
              </Feed.Date>
              <Feed.Summary>{summary}</Feed.Summary>
            </Feed.Content>
          </>
        ) : (
          <Message key={index} content='No feed data available.' />
        )}
      </Feed.Event>
    );
  });
}
