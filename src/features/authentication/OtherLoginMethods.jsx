import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "semantic-ui-react";
import { closeModal } from "../../app/common/modals/modalReducer";
import { otherLoginMethods } from "../../app/firestore/firebaseService";

export default function OtherLoginMethods() {
  const dispatch = useDispatch();

  function handleLogin(provider) {
    dispatch(closeModal());
    otherLoginMethods(provider);
  }
  return (
    <>
      <Button
        onClick={() => handleLogin("google")}
        icon='google'
        fluid
        color='google plus'
        style={{ marginBottom: 10 }}
        content='Login with Google'
      />
      <Button
        onClick={() => handleLogin("facebook")}
        icon='facebook'
        fluid
        color='facebook'
        // style={{ marginBottom: 10 }}
        content='Login with Facebook'
      />
    </>
  );
}
