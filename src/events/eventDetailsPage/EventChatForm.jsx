import { Form, Formik, Field } from "formik";
import React, { useEffect, useRef } from "react";
import { addEventChatComment } from "../../app/firestore/firebaseService";
import { toast } from "react-toastify";
import { Button, TextArea, Loader } from "semantic-ui-react";
import * as Yup from "yup";

export default function EventChatForm({
  eventId,
  event,
  parentId,
  replyTo,
  closeForm,
}) {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (replyTo) {
      const cursorPosition = replyTo.length + 2; 
      textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      textAreaRef.current.focus();
    } else {
      textAreaRef.current.focus();
    }
  }, [replyTo]);

  return (
    <Formik
      initialValues={{ comment: replyTo ? `@${replyTo} ` : "" }}
      validationSchema={Yup.object({
        comment: Yup.string().required(),
      })}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await addEventChatComment(eventId, { ...values, parentId });
          resetForm();
        } catch (error) {
          toast.error(error.message);
        } finally {
          setSubmitting(false);
          closeForm({ open: false, commentId: null });
        }
      }}
    >
      {({ isSubmitting, handleSubmit, isValid, values }) => (
        <Form className='ui form'>
          {replyTo && (
            <div style={{ marginBottom: "3px", marginTop: "5px" }}>
              <span>Replying to: {replyTo}</span>
            </div>
          )}
          <Field name='comment'>
            {({ field }) => (
              <div style={{ position: "relative" }}>
                <Loader active={isSubmitting} />
                <TextArea
                  ref={textAreaRef}
                  rows='2'
                  {...field}
                  placeholder={
                    replyTo
                      ? `Replying to ${replyTo}`
                      : `Add a comment for ${event.title}`
                  }
                  value={values.comment}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      return;
                    } else if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      isValid && handleSubmit();
                    }
                  }}
                />
                <Button
                  type='button'
                  inverted
                  icon='send'
                  content='Send'
                  color='orange'
                  style={{
                    padding: "10px",
                    border: "none",
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onClick={handleSubmit}
                />
              </div>
            )}
          </Field>
        </Form>
      )}
    </Formik>
  );
}
