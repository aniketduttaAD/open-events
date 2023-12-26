import React, { useContext, useMemo } from "react";
import { Button, Modal, Header } from "semantic-ui-react";
import { EventSelect, UserContext } from "../../app/layout/App";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MyTextInput from "../../app/common/form/TextInput";
import TextArea from "../../app/common/form/TextArea";
import CategorySelector from "../../app/common/form/CategorySelector";
import { categoryOptions } from "../../app/api/categoryOptions";
import DateInput from "../../app/common/form/DateInput";
import MapsInput from "../../app/common/form/MapsInput";
import { toast } from "react-toastify";
import {
  addEventsToFirestore,
  updateEventInFirestore,
} from "../../app/firestore/firestoreService";
import { useDispatch, useSelector } from "react-redux";
import { updateEvent } from "../eventActions";
// import ImageUpload from "../../app/common/imageupload/ImageUpload";

export default function CreateEvent() {
  const dispatch = useDispatch();
  const { modalOpen, setModalOpen } = useContext(UserContext);
  const { selectedEvent, setSelectedEvent } = useContext(EventSelect);
  const auth = useSelector((state) => state.auth.authenticated);
  const { currentUser } = useSelector((state) => state.auth);
  const initialValues = {
    title: "",
    category: "",
    description: "",
    city: { address: "", latLng: null },
    venue: { address: "", latLng: null },
    date: "",
  };
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    city: Yup.object().shape({
      address: Yup.string().required("City is required"),
    }),
    venue: Yup.object().shape({
      address: Yup.string().required("Venue is required"),
    }),
    date: Yup.string().required(),
  });

  const handleClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const isReadOnly = useMemo(() => {
    return selectedEvent === null
      ? false
      : selectedEvent?.hostUid === currentUser?.uid
      ? false
      : true;
  }, [currentUser?.uid, selectedEvent]);

  return (
    <Modal
      dimmer='blurring'
      style={{ width: "40%" }}
      onClose={handleClose}
      open={modalOpen}
    >
      <Modal.Header>
        {auth ? (
          <Header
            content={selectedEvent && auth ? "Update Event" : "New Event"}
          />
        ) : (
          <Header content='View Event' />
        )}
      </Modal.Header>
      <Modal.Content>
        <Formik
          initialValues={selectedEvent ? selectedEvent : initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              if (selectedEvent) {
                await updateEventInFirestore(values);
                dispatch(updateEvent(values));
              } else {
                await addEventsToFirestore(values);
                window.location.reload();
              }
              setSubmitting(false);
            } catch (error) {
              console.log(error);
              toast.error(error.message);
              setSubmitting(false);
            } finally {
              setModalOpen(false);
            }
          }}
        >
          {({ isSubmitting, dirty, isValid, values }) => (
            <Form className='ui form'>
              <MyTextInput
                name='title'
                placeholder='Event Title'
                autoFocus={auth}
                readOnly={isReadOnly}
              />
              <CategorySelector
                style={{ fontWeight: "400 " }}
                name='category'
                options={categoryOptions}
                placeholder='Category'
                readOnly={isReadOnly}
              />
              <TextArea
                name='description'
                placeholder='Description'
                readOnly={isReadOnly}
                rows={3}
              />
              <MapsInput name='city' placeholder='City' readOnly={isReadOnly} />
              <MapsInput
                name='venue'
                placeholder='Venue'
                disabled={!values.city.latLng}
                options={{
                  locationBias: values.city.latLng,
                  types: ["establishment"],
                }}
                readOnly={isReadOnly}
              />
              <DateInput
                name='date'
                placeholderText='Date'
                readOnly={isReadOnly}
                timeFormat='HH:mm'
                showTimeSelect
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm a'
              />
              {/* <ImageUpload /> */}
              {auth ? (
                <Modal.Actions
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    type='button'
                    content='Close'
                    color='youtube'
                    circular
                    onClick={handleClose}
                  />
                  {!isReadOnly && (
                    <Button
                      type='submit'
                      loading={isSubmitting}
                      disabled={!isValid || !dirty}
                      positive
                      inverted
                      color='orange'
                      circular
                      content={selectedEvent && auth ? "Update" : "Submit"}
                    />
                  )}
                </Modal.Actions>
              ) : null}
            </Form>
          )}
        </Formik>
      </Modal.Content>
    </Modal>
  );
}
