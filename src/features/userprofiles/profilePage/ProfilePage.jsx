import React from "react";
import { Grid } from "semantic-ui-react";
import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from "../../../app/firestore/firestoreService";
import { useParams } from "react-router-dom";
import { listenToSelectedUserProfile } from "../profileActions";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import useFirestoreDoc from "../../../app/hooks/useFirestoreDoc";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { selectedUserProfile, currentUserProfile } = useSelector(
    (state) => state.profile
  );
  const { currentUser } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.asynchronous);
  const params = useParams();
  let profile;

  useFirestoreDoc({
    query: () => getUserInfo(params.id),
    data: (profile) => dispatch(listenToSelectedUserProfile(profile)),
    deps: [dispatch, params.id],
    shouldExecute: params.id !== currentUser.uid,
  });

  if (params.id === currentUser.uid) {
    profile = currentUserProfile;
  } else {
    profile = selectedUserProfile;
  }

  if ((loading && !profile) || (!profile && !error))
    return <LoadingComponent content='Loading...' />;
  return (
    <Grid>
      <Grid.Column width={16}>
        <ProfileHeader
          profile={profile}
          isCurrentUser={currentUser.uid === profile.id}
        />
        <ProfileContent
          profile={profile}
          isCurrentUser={currentUser.uid === profile.id}
        />
      </Grid.Column>
    </Grid>
  );
}
