import React from "react";
import {
  Container,
  Segment,
  Header,
  Image,
  Button,
  Icon,
} from "semantic-ui-react";
import { openModal } from "../app/common/modals/modalReducer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  function handleSignIn() {
    if (!currentUser) dispatch(openModal({ modalType: "RegisterUser" }));
    else navigate("/events");
  }
  return (
    <Segment textAlign='center' vertical className='homePage'>
      <Container>
        <Header as='h1'>
          <Image
            size='massive'
            src='assets/logo2.gif'
            style={{ marginBottom: 12 }}
          />
          Open Events
        </Header>
        <Button onClick={handleSignIn} inverted size='huge'>
          Get Started
          <Icon name='arrow right' />
        </Button>
      </Container>
    </Segment>
  );
}
