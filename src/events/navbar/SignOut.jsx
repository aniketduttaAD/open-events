import React from "react";
import { Button, Menu } from "semantic-ui-react";
import { useDispatch } from "react-redux";
import { openModal } from "../../app/common/modals/modalReducer";

export default function SignOut() {
  const dispatch = useDispatch();
  const handleCreateAccount = () => {
    dispatch(openModal({ modalType: "RegisterUser" }));
  };
  // const handleSignIn = () => {
  //   dispatch(openModal({ modalType: "UserLogin" }));
  // };
  return (
    <Menu.Item position='right'>
      <Button
        circular
        style={{ fontWeight: "800", fontFamily: "Poppins" }}
        onClick={handleCreateAccount}
        color='orange'
        content='Log in'
      />
      <Button
        style={{
          fontWeight: "700",
          fontFamily: "Poppins",
          marginLeft: "0.5em",
        }}
        basic
        inverted
        circular
        color='orange'
        content='Sign Up'
        onClick={handleCreateAccount}
      />
    </Menu.Item>
  );
}
