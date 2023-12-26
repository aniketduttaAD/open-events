import React, { useContext } from "react";
import CreateEvent from "../createEvent/CreateEvent";
import { format } from "date-fns";
import { deleteEventFromFirestore } from "../../app/firestore/firestoreService";
import {
  Button,
  Dropdown,
  Icon,
  Item,
  Label,
  List,
  Segment,
} from "semantic-ui-react";
import ListAttendee from "./ListAttendee";
import { toast } from "react-toastify";
import clipboardCopy from "clipboard-copy";
import { Link, useNavigate } from "react-router-dom";
import { EventSelect, UserContext } from "../../app/layout/App";
import { useSelector, useDispatch } from "react-redux";
import { deleteEvent } from "../eventActions";

export default function EventsPage({ events }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setSelectedEvent } = useContext(EventSelect);
  const { setModalOpen } = useContext(UserContext);
  const { currentUser } = useSelector((state) => state.auth);

  function handleLinkCopy(id) {
    const link = `https://open-events-dev.vercel.app/events/${id}`;
    clipboardCopy(link)
      .then(() => {
        toast.info("Link copied to clipboard", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: 0,
          theme: "dark",
        });
      })
      .catch((error) => {
        console.error("Failed to copy link to clipboard:", error);
      });
  }

  function handleViewEvent(event) {
    setSelectedEvent(event);
    setModalOpen(true);
  }

  function handleOpenEvents(id) {
    navigate(`/events/${id}`);
  }
  return (
    <Segment.Group>
      {events.map((event) => {
        return (
          <Segment.Group key={event.id}>
            <Segment style={{ position: "relative" }}>
              <Item.Group>
                <Item>
                  <Item.Image
                    size='tiny'
                    circular
                    src={
                      event.hostPhotoURL
                        ? event.hostPhotoURL
                        : "https://shorturl.at/qBHKO"
                    }
                  />
                  <Item.Content>
                    <Item.Header
                      style={{ marginTop: "15px" }}
                      content={event.title}
                    />
                    <Item.Description style={{ fontWeight: 700 }}>
                      Hosted by{" "}
                      <Link to={`/profile/${event.hostUid}`}>
                        {event.hostedBy}
                      </Link>
                    </Item.Description>
                    {event.isCancelled && (
                      <Label
                        ribbon='right'
                        color='red'
                        content='The event has been cancelled'
                      />
                    )}
                  </Item.Content>
                </Item>
                <Dropdown
                  pointing='top right'
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    cursor: "pointer",
                  }}
                  icon={
                    <Icon color='orange' name='sidebar' floated='right'></Icon>
                  }
                >
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleOpenEvents(event.id)}>
                      <Icon name='external share' />
                      Go to Event
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleLinkCopy(event.id)}>
                      <Icon name='send' />
                      Share Event
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Icon name='save' />
                      Add to Intrested
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Icon name='hide' />
                      Hide
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Item.Group>
            </Segment>
            <Segment>
              <span style={{ fontWeight: 600 }}>
                <Icon
                  name='calendar alternate outline'
                  color='violet'
                  size='large'
                  fitted
                  style={{
                    paddingRight: "10px",
                  }}
                />
                {format(new Date(event.date), "MMMM d, yyyy h:mm a")}
                <Icon
                  name='map marker alternate'
                  color='red'
                  size='large'
                  fitted
                  style={{
                    paddingLeft: "15px",
                    paddingRight: "10px",
                  }}
                />
                {event.venue.address}
              </span>
            </Segment>
            <Segment secondary>
              <List horizontal>
                {event.attendees &&
                  event.attendees.map((attendee) => (
                    <ListAttendee key={attendee.id} attendee={attendee} />
                  ))}
              </List>
            </Segment>
            <Segment clearing>
              <div style={{ fontWeight: 600 }}>{event.description}</div>
              <Button
                size='medium'
                color='orange'
                floated='right'
                inverted
                content='View'
                style={{ marginTop: "10px" }}
                onClick={() => handleViewEvent(event)}
              />
              <CreateEvent />
              {event.hostUid === currentUser?.uid && (
                <Button
                  size='medium'
                  color='google plus'
                  floated='right'
                  inverted
                  content='Delete'
                  style={{ marginTop: "10px" }}
                  onClick={async () => {
                    await deleteEventFromFirestore(event.id);
                    dispatch(deleteEvent(event.id));
                  }}
                />
              )}
            </Segment>
          </Segment.Group>
        );
      })}
    </Segment.Group>
  );
}
