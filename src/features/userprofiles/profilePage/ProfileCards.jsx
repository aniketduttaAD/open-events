import React from "react";
import { Link } from "react-router-dom";
import { Card, Image } from "semantic-ui-react";

export default function ProfileCards({ profile }) {
  return (
    <Card as={Link} to={`/profile/${profile.id}`}>
      <Image src={profile?.photoURL || "https://shorturl.at/qBHKO"} />
      <Card.Content>
        <Card.Header content={profile.displayName} />
      </Card.Content>
    </Card>
  );
}
