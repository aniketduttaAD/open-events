import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import {
  Header,
  Segment,
  Message,
  Button,
  Icon,
  Label,
} from "semantic-ui-react";
import * as Yup from "yup";
import TextInput from "../../app/common/form/TextInput";
import { useSelector } from "react-redux";
import { updateUserPassword } from "../../app/firestore/firebaseService";
import { toast } from "react-toastify";
import {
  getAuth,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const auth = getAuth();

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

export default function UserAccount() {
  const { currentUser } = useSelector((state) => state.auth);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const [timer, setTimer] = useState(30);
  const [reauthenticating, setReauthenticating] = useState(false);

  const handleResetPassword = async () => {
    try {
      const email = currentUser.email;
      await sendPasswordResetEmail(auth, email);
      setShowButton(false);
      setShowLabel(true);
      setTimer(15);
      toast.success("Check your e-mail for password reset");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const queryParams = new URLSearchParams(window.location.search);
  const actionCode = queryParams.get("oobCode");

  const verifyActionCode = async (actionCode) => {
    try {
      await verifyPasswordResetCode(auth, actionCode);
      setResetPassword(true);
      toast.success("Now you can change your password");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let countdownTimer;

    if (showLabel) {
      countdownTimer = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      clearInterval(countdownTimer);
    };
  }, [showLabel]);

  useEffect(() => {
    if (timer === 0) {
      setShowButton(true);
      setShowLabel(false);
    }
  }, [timer]);

  useEffect(() => {
    if (actionCode) {
      verifyActionCode(actionCode);
    }
  }, [actionCode]);

  const handlePasswordUpdate = async (values, { setSubmitting, setErrors }) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not found");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        values.currentPassword
      );

      setReauthenticating(true);
      await reauthenticateWithCredential(user, credential);
      setReauthenticating(false);

      await updateUserPassword(values);
      toast.success("Password updated successfully!");
    } catch (error) {
      setErrors({ auth: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Segment>
      <Header dividing size='large' content='ManageAccount' />
      {currentUser.providerID === "password" && (
        <>
          <Header content='Change Password' />
          {!resetPassword ? (
            <div>
              {showButton && (
                <>
                  <Message>Click to send a password reset mail</Message>
                  <Button inverted color='orange' onClick={handleResetPassword}>
                    Send
                  </Button>
                </>
              )}
              {showLabel && (
                <>
                  <Label
                    content={`Go to ${currentUser.email} to reset your password. Didn't receive mail?`}
                  />
                  <span>{timer}s</span>
                </>
              )}
            </div>
          ) : (
            <Formik
              initialValues={{
                currentPassword: "",
                newPassword: "",
                verifyPassword: "",
              }}
              validationSchema={Yup.object({
                currentPassword: Yup.string().required(
                  "Current Password is required"
                ),
                newPassword: Yup.string().required("New Password is required"),
                verifyPassword: Yup.string()
                  .oneOf(
                    [Yup.ref("newPassword"), null],
                    "Passwords do not match"
                  )
                  .required("Password Confirmation is required"),
              })}
              onSubmit={handlePasswordUpdate}
            >
              {({ errors, isSubmitting, isValid, dirty }) => (
                <Form className='ui form'>
                  <TextInput
                    name='currentPassword'
                    type={passwordVisible ? "text" : "password"}
                    placeholder='Current Password'
                    icon={
                      <EyeIcon
                        passwordVisible={passwordVisible}
                        setPasswordVisible={setPasswordVisible}
                      />
                    }
                  />
                  <TextInput
                    name='newPassword'
                    type={passwordVisible ? "text" : "password"}
                    placeholder='New Password'
                  />
                  <TextInput
                    name='verifyPassword'
                    type={passwordVisible ? "text" : "password"}
                    placeholder='Confirm Password'
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
                    type='submit'
                    disabled={
                      !isValid || !dirty || isSubmitting || reauthenticating
                    }
                    loading={isSubmitting}
                    size='large'
                    color='orange'
                    inverted
                    content='Update Password'
                  />
                </Form>
              )}
            </Formik>
          )}
        </>
      )}
      {currentUser.providerID === "facebook.com" && (
        <>
          <Header color='orange' sub content='Facebook Account' />
          <p>Please visit Facebook to update your account</p>
          <Button
            icon='facebook'
            color='facebook'
            onClick={() =>
              window.open(
                "https://accountscenter.facebook.com/password_and_security",
                "_blank"
              )
            }
            content='Go to Facebook'
          />
        </>
      )}
      {currentUser.providerID === "google.com" && (
        <>
          <Header color='orange' sub content='Google Account' />
          <p>Please visit Google to update your account</p>
          <Button
            icon='google'
            color='google plus'
            onClick={() =>
              window.open("https://myaccount.google.com/security", "_blank")
            }
            content='Go to Google'
          />
        </>
      )}
    </Segment>
  );
}
