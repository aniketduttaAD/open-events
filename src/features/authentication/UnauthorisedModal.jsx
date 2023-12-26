import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button, Divider } from "semantic-ui-react";
import { openModal } from "../../app/common/modals/modalReducer";
import { useNavigate } from "react-router-dom";

export default function UnauthorisedModal() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedEvent } = useSelector((state) => state.event);
  function handleClose() {
    setOpen(false);
    navigate(selectedEvent == null ? "/events" : `/events/${selectedEvent.id}`);
  }

  return (
    <Modal open={open} size='mini' onClose={handleClose}>
      <Modal.Header content='You need to be signed in to do that' />
      <Modal.Content>
        <p>Please either login or register to see this content</p>
        <Button.Group widths={4}>
          <Button
            fluid
            color='orange'
            content='Login'
            onClick={() => dispatch(openModal({ modalType: "UserLogin" }))}
          />
          <Button.Or />
          <Button
            fluid
            color='youtube'
            content='Register'
            onClick={() => dispatch(openModal({ modalType: "RegisterUser" }))}
          />
        </Button.Group>
        <Divider />
        <div style={{ textAlign: "center" }}>
          <p>Or click cancel to continue as a guest</p>
          <Button onClick={handleClose} content='Cancel' />
        </div>
      </Modal.Content>
    </Modal>
  );
}
