import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Feed, Segment } from "semantic-ui-react";
import {
  getUserFeedRef,
  getUserPostsRef,
} from "../../app/firestore/firebaseService";
import {
  listenToCreateandUpdate,
  listenToJoinandLeft,
} from "../../features/userprofiles/profileActions";
import EventFeedItem from "./EventFeedItem";
import { onValue } from "@firebase/database";

export default function EventsFeed() {
  const dispatch = useDispatch();
  const { feed } = useSelector((state) => state.profile);

  useEffect(() => {
    const getUserFeedRefCb = onValue(getUserFeedRef(), (feedSnapshot) => {
      if (!feedSnapshot.exists()) {
        return;
      }
      const feedData = Object.values(feedSnapshot.val()).reverse();
      dispatch(listenToCreateandUpdate(feedData));
    });
    const getUserPostsRefCb = onValue(getUserPostsRef(), (postsSnapshot) => {
      if (!postsSnapshot.exists()) {
        return;
      }
      const postsData = Object.values(postsSnapshot.val()).reverse();
      dispatch(listenToJoinandLeft(postsData));
    });
    return () => {
      getUserFeedRefCb();
      getUserPostsRefCb();
    };
  }, [dispatch]);

  return (
    <Segment attached='bottom'>
      <Feed>
        <EventFeedItem feed={feed} />
      </Feed>
    </Segment>
  );
}
