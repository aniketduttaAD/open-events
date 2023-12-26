import React from "react";
import { Formik, Form } from "formik";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import { Button } from "semantic-ui-react";
import * as Yup from "yup";
import { updateUserProfile } from "../../../app/firestore/firestoreService";
import { toast } from "react-toastify";

export default function ProfileUpdate({ profile, setEditMode }) {
  return (
    <Formik
      initialValues={{
        displayName: profile.displayName,
        description: profile.description || null,
      }}
      validationSchema={Yup.object({
        displayName: Yup.string().required(),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await updateUserProfile(values);
          setEditMode(false);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid, dirty }) => (
        <Form className='ui form'>
          <TextInput name='displayName' placeholder='Name' />
          <TextArea name='description' placeholder='Description' rows={3} />
          <Button
            loading={isSubmitting}
            disabled={isSubmitting || !isValid || !dirty}
            type='submit'
            size='large'
            inverted
            color='orange'
            content='Update Profile'
          />
        </Form>
      )}
    </Formik>
  );
}
