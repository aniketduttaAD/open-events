import React, { useState } from "react";
import { Form, Formik } from "formik";
import ModalWrapper from "../../app/common/modals/ModalWrapper";
import * as Yup from "yup";
import TextInput from "../../app/common/form/TextInput";
import { Button, Icon, Label, Divider } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../app/common/modals/modalReducer";
import { registerNewUsers } from "../../app/firestore/firebaseService.js";
import OtherLoginMethods from "./OtherLoginMethods";
import { openModal } from "../../app/common/modals/modalReducer";

const EyeIcon = ({ passwordVisible, setPasswordVisible }) => {
  return (
    <Button
      className='eye-button'
      circular
      basic
      type='button'
      onClick={() => setPasswordVisible(!passwordVisible)}
    >
      <Icon name={passwordVisible ? "eye slash" : "eye"} />
    </Button>
  );
};

export default function RegisterUser() {
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { currentUser } = useSelector((state) => state.auth);
  function handleSignIn() {
    if (!currentUser) dispatch(openModal({ modalType: "UserLogin" }));
  }
  return (
    <ModalWrapper size='mini' header='Welcome to Open Events'>
      <Formik
        initialValues={{ displayName: "", email: "", name: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await registerNewUsers(values);
            dispatch(closeModal());
          } catch (error) {
            setErrors({
              auth: error.message
                .replace("Firebase: ", "")
                .replace(" (auth/weak-password)", "")
                .replace("by another account. (auth/email-already-in-use)", ""),
            });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, isValid, dirty, errors }) => (
          <Form className='ui form'>
            <TextInput name='displayName' placeholder='John Doe' />
            <TextInput name='email' placeholder='johndoe@company.com' />
            <TextInput
              name='password'
              placeholder='********'
              type={passwordVisible ? "text" : "password"}
              icon={
                <EyeIcon
                  passwordVisible={passwordVisible}
                  setPasswordVisible={setPasswordVisible}
                />
              }
            />
            {errors.auth && (
              <Label
                basic
                color='red'
                style={{ marginBottom: 10 }}
                content={errors.auth}
              />
            )}
            <Button
              loading={isSubmitting}
              disabled={!isValid || !dirty || isSubmitting}
              type='submit'
              fluid
              size='large'
              color='orange'
              content='Sign Up'
            />
          </Form>
        )}
      </Formik>
      <Divider horizontal>Or</Divider>
      <button
        onClick={handleSignIn}
        style={{
          color: "#ff851b",
          border: "none",
          background: "none",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        <span>
          Already a member? <strong> Log in</strong>
        </span>
      </button>
      <OtherLoginMethods />
    </ModalWrapper>
  );
}
