import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Comment,
  Grid,
  Header,
  Icon,
  Item,
  Label,
  Segment,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import {
  firebaseObjectToArray,
  getEventChat,
} from "../../app/firestore/firebaseService";
import { listenToEventChats } from "../eventActions";
import { formatDistance } from "date-fns";
import { CLEAR_COMMENTS } from "../eventConstants";
import { createDataTree } from "../../app/common/utils/utility";
import EventChatForm from "./EventChatForm";
import { onValue } from "@firebase/database";

export default function EventDetailsChat({ event, eventId, hostUid }) {
  const dispatch = useDispatch();
  const { comments } = useSelector((state) => state.event);
  const { authenticated } = useSelector((state) => state.auth);
  const [showReplyForm, setShowReplyForm] = useState({
    open: false,
    commentId: null,
    replyTo: null,
  });

  function handleCloseReplyForm() {
    setShowReplyForm({ open: false, commentId: null, replyTo: null });
  }

  useEffect(() => {
    const getEventChatCb = onValue(getEventChat(eventId), (snapshot) => {
      if (!snapshot.exists()) return;
      dispatch(
        listenToEventChats(firebaseObjectToArray(snapshot.val()).reverse())
      );
    });
    return () => {
      dispatch({ type: CLEAR_COMMENTS });
      getEventChatCb();
    };
  }, [eventId, dispatch]);

  return (
    <Grid columns={2} celled>
      <Grid.Column width={8}>
        <Segment>
          <Header
            content={authenticated ? "Comments" : "Sign in to view comments"}
            style={{ color: "#ff851b", fontWeight: 900, fontSize: "28px" }}
          />
          <Comment.Group
            style={{
              maxHeight: "350px",
              overflowY: "scroll",
            }}
          >
            {createDataTree(comments)?.map((comment) => (
              <Comment key={comment.id}>
                <Comment.Avatar
                  src={comment.photoURL || "https://shorturl.at/qBHKO"}
                />
                <Comment.Content>
                  <Comment.Author as={Link} to={`/profile/${comment.uid}`}>
                    {comment.displayName}
                  </Comment.Author>
                  <Comment.Metadata>
                    <div>{formatDistance(comment.date, new Date())}</div>
                  </Comment.Metadata>
                  <Comment.Text style={{ marginBottom: "10px" }}>
                    {comment.text.split("\n").map((text, i) => (
                      <span key={i}>
                        {text}
                        <br />
                      </span>
                    ))}
                  </Comment.Text>
                  <Comment.Actions>
                    <Comment.Action>
                      <Icon name='exclamation circle' />
                      Report
                    </Comment.Action>
                    <Comment.Action
                      onClick={() =>
                        setShowReplyForm({
                          open: true,
                          commentId: comment.id,
                          replyTo: comment.displayName,
                        })
                      }
                    >
                      <Icon name='reply' />
                      Reply
                    </Comment.Action>
                    {showReplyForm.open &&
                      showReplyForm.commentId === comment.id && (
                        <EventChatForm
                          eventId={eventId}
                          event={event}
                          parentId={comment.id}
                          replyTo={showReplyForm.replyTo}
                          closeForm={handleCloseReplyForm}
                        />
                      )}
                  </Comment.Actions>
                </Comment.Content>
                {comment.childNodes.length > 0 && (
                  <Comment.Group>
                    {comment.childNodes.reverse().map((child) => (
                      <Comment key={child.id}>
                        <Comment.Avatar
                          src={child.photoURL || "https://shorturl.at/qBHKO"}
                        />
                        <Comment.Content>
                          <Comment.Author
                            as={Link}
                            to={`/profile/${child.uid}`}
                          >
                            {child.displayName}
                          </Comment.Author>
                          <Comment.Metadata>
                            <div>{formatDistance(child.date, new Date())}</div>
                          </Comment.Metadata>
                          <Comment.Text style={{ marginBottom: "10px" }}>
                            {child.text.split("\n").map((text, i) => (
                              <span key={i}>
                                {text}
                                <br />
                              </span>
                            ))}
                          </Comment.Text>
                          <Comment.Actions>
                            <Comment.Action>
                              <Icon name='exclamation circle' />
                              Report
                            </Comment.Action>
                            <Comment.Action
                              onClick={() =>
                                setShowReplyForm({
                                  open: true,
                                  commentId: child.id,
                                  replyTo: child.displayName,
                                })
                              }
                            >
                              <Icon name='reply' />
                              Reply
                            </Comment.Action>
                            {showReplyForm.open &&
                              showReplyForm.commentId === child.id && (
                                <EventChatForm
                                  eventId={eventId}
                                  event={event}
                                  parentId={child.parentId}
                                  replyTo={showReplyForm.replyTo}
                                  closeForm={handleCloseReplyForm}
                                />
                              )}
                          </Comment.Actions>
                        </Comment.Content>
                      </Comment>
                    ))}
                  </Comment.Group>
                )}
              </Comment>
            ))}
          </Comment.Group>
          {authenticated && !showReplyForm.open && (
            <EventChatForm
              eventId={eventId}
              event={event}
              parentId={0}
              closeForm={handleCloseReplyForm}
            />
          )}
        </Segment>
      </Grid.Column>
      <Grid.Column>
        <Header
          as='h3'
          dividing
          style={{
            color: "#ff851b",
            fontWeight: "900",
            fontSize: "28px",
          }}
        >
          <span style={{ fontWeight: 500 }}>
            {event.attendees.length}{" "}
            {event.attendees.length > 1 ? "People" : "Person"}{" "}
          </span>
          Attending
        </Header>
        <Segment attached>
          <Item.Group relaxed divided>
            {event.attendees.map((attendee) => (
              <Item
                as={Link}
                to={`/profile/${attendee.id}`}
                key={attendee.id}
                style={{ position: "relative" }}
              >
                {hostUid === attendee.id && (
                  <Label
                    style={{ position: "absolute" }}
                    color='orange'
                    ribbon='right'
                    content='Host'
                  />
                )}
                <Item.Image
                  size='tiny'
                  circular
                  src={
                    attendee.photoURL
                      ? attendee.photoURL
                      : "https://shorturl.at/qBHKO"
                  }
                />
                <Item.Content verticalAlign='middle'>
                  <Item.Header as='h3'>
                    <span>{attendee.name}</span>
                  </Item.Header>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Segment>
      </Grid.Column>
    </Grid>
  );
}
