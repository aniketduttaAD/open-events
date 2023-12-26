import React from "react";
import { Link } from "react-router-dom";
import { Image, List } from "semantic-ui-react";

export default function ListAttendee({ attendee }) {
  return (
    <List.Item as={Link} to={`/profile/${attendee.id}`}>
      <Image
        circular
        size='mini'
        src={
          attendee.photoURL ? attendee.photoURL : "https://shorturl.at/qBHKO"
        }
      />
    </List.Item>
  );
}
