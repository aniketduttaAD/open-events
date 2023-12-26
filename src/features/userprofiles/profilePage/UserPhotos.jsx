import React from "react";
import { useState } from "react";
import { Button, Card, Grid, Header, Image, Tab } from "semantic-ui-react";
import useFirestoreCollection from "../../../app/hooks/useFirestoreCollection";
import {
  deleteImageFromCollection,
  getUserPhotos,
  setMainPhoto,
} from "../../../app/firestore/firestoreService";
import { useDispatch, useSelector } from "react-redux";
import { listenToUserPhotos } from "../profileActions";
import { toast } from "react-toastify";
import { deleteImageFromFirebaseStorage } from "../../../app/firestore/firebaseService";

export default function UserPhotos({ profile, isCurrentUser }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.asynchronous);
  const { photos } = useSelector((state) => state.profile);
  const [updating, setUpdating] = useState({ isUpdating: false, target: null });
  const [deleting, setDeleting] = useState({ isDeleting: false, target: null });

useFirestoreCollection({
  query: () => getUserPhotos(profile.id),
  data: (photos) => {
    const profilePhotos = photos.filter(
      (photo) => photo.context === "profilePhoto"
    );
    dispatch(listenToUserPhotos(profilePhotos));
  },
  deps: [profile.id, dispatch],
});


  async function handleSetMainPhoto(photo, target) {
    setUpdating({ isUpdating: true, target });
    try {
      await setMainPhoto(photo);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating({ isUpdating: false, target: null });
    }
  }

  async function handleDeletePhoto(photo, target) {
    setDeleting({ isDeleting: true, target });
    try {
      await deleteImageFromFirebaseStorage(photo.name);
      await deleteImageFromCollection(photo.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting({ isDeleting: false, target: null });
    }
  }

  return (
    <Tab.Pane loading={loading}>
      <Grid>
        <Grid.Column width={16}>
          <Header
            floated='left'
            icon='user'
            content={`About ${profile.displayName},`}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Card.Group itemsPerRow={5}>
            {photos.map((photo) => (
              <Card key={photo.id}>
                <Image src={photo.url} />
                {isCurrentUser && (
                  <Button.Group fluid widths={2}>
                    <Button
                      disabled={photo.url === profile.photoURL}
                      name={photo.id}
                      loading={
                        updating.isUpdating && updating.target === photo.id
                      }
                      onClick={(e) => handleSetMainPhoto(photo, e.target.name)}
                      basic
                      color='green'
                      content='Main'
                    />
                    <Button
                      disabled={photo.url === profile.photoURL}
                      name={photo.id}
                      loading={
                        deleting.isDeleting && deleting.target === photo.id
                      }
                      onClick={(e) => handleDeletePhoto(photo, e.target.name)}
                      basic
                      color='red'
                      icon='trash'
                    />
                  </Button.Group>
                )}
              </Card>
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  );
}
