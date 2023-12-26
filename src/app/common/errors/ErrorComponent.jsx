import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Header, Segment } from "semantic-ui-react";

export default function ErrorComponent() {
  const navigate = useNavigate();

  const { error } = useSelector((state) => state.asynchronous);

  return (
    <Segment placeholder>
      <Header
        textAlign='center'
        content={error.message || "Seems like the event is not present"}
      />
      <Button
        onClick={() => navigate("/events")}
        primary
        style={{ marginTop: 20 }}
        content='Return to Home Page'
      />
    </Segment>
  );
}
