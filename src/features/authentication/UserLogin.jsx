import React, { useState } from "react";
import { Form, Formik } from "formik";
import ModalWrapper from "../../app/common/modals/ModalWrapper";
import * as Yup from "yup";
import TextInput from "../../app/common/form/TextInput";
import { Button, Divider, Icon, Label } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, openModal } from "../../app/common/modals/modalReducer";
import { signInUsingEmail } from "../../app/firestore/firebaseService.js";
import OtherLoginMethods from "./OtherLoginMethods";

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

export default function UserLogin() {
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { currentUser } = useSelector((state) => state.auth);

  function handleRegisterUser() {
    if (!currentUser) dispatch(openModal({ modalType: "RegisterUser" }));
  }
  return (
    <ModalWrapper size='mini' header='Welcome back, to Open Events'>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={Yup.object({
          email: Yup.string().required().email(),
          password: Yup.string().required(),
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await signInUsingEmail(values);
            setSubmitting(false);
            dispatch(closeModal());
          } catch (error) {
            setErrors({
              auth: "The email you entered does not belong to any account.",
            });
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, isValid, dirty, errors }) => (
          <Form className='ui form'>
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
              content='Log in'
            />
          </Form>
        )}
      </Formik>
      <Divider horizontal>Or</Divider>
      <button
        onClick={handleRegisterUser}
        style={{
          color: "#ff851b",
          border: "none",
          background: "none",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        <span>
          Don't have an account?
          <strong> Create Now!</strong>
        </span>
      </button>
      <OtherLoginMethods />
    </ModalWrapper>
  );
}
