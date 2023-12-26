import React, { useEffect, useState } from "react";
import {
  Segment,
  Item,
  Statistic,
  Reveal,
  Button,
  Image,
  Icon,
} from "semantic-ui-react";
import PhotoUpload from "../../../app/common/photouploads/PhotoUpload";
import { toast } from "react-toastify";
import {
  followUser,
  getFollowingDoc,
  unFollowUser,
} from "../../../app/firestore/firestoreService";
import { useDispatch, useSelector } from "react-redux";
import { setFollowUser, setUnfollowUser } from "../profileActions";
import { CLEAR_FOLLOWINGS } from "../profileConstants";

const CameraIcon = ({ context }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(true);
  };
  return (
    <>
      <Button
        circular
        color='grey'
        size='small'
        className='camera-button'
        icon={
          <Icon corner className='camera-icon' name='camera' size='large' />
        }
        type='button'
        onClick={handleClick}
      />
      <PhotoUpload open={open} setOpen={setOpen} context={context} />
    </>
  );
};

export default function ProfileHeader({ profile, isCurrentUser }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { followingUser } = useSelector((state) => state.profile);
  useEffect(() => {
    if (isCurrentUser) return;
    setLoading(true);
    async function fetchFollowingDoc() {
      try {
        const followingDoc = await getFollowingDoc(profile.id);
        if (followingDoc && followingDoc.exists()) {
          dispatch(setFollowUser());
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    fetchFollowingDoc().then(() => setLoading(false));
    return () => {
      dispatch({ type: CLEAR_FOLLOWINGS });
    };
  }, [dispatch, profile.id, isCurrentUser]);

  async function handleFollowUser() {
    setLoading(true);
    try {
      await followUser(profile);
      dispatch(setFollowUser());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnfollowUser() {
    setLoading(true);
    try {
      await unFollowUser(profile);
      dispatch(setUnfollowUser());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Segment>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "50vh",
        }}
      >
        <Image
          src={profile.coverPhotoURL}
          style={{
            width: "100%",
            maxHeight: "50vh",
          }}
        />
        {isCurrentUser && (
          <div
            style={{
              position: "absolute",
              bottom: -10,
              right: -10,
            }}
          >
            <CameraIcon context='coverPhoto' />
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          transform: "translate(10%, -60%)",
        }}
      >
        <Image
          circular
          size='small'
          style={{ width: "140px" }}
          src={profile.photoURL}
        />
        {isCurrentUser && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
          >
            <CameraIcon context='profilePhoto' />
          </div>
        )}
      </div>
      <Item.Group>
        <Item.Header
          style={{
            fontFamily: "Poppins",
            fontWeight: "700",
            marginTop: "60px",
          }}
          as='h1'
          content={profile.displayName}
        />
        <Item.Description
          as='h3'
          style={{ marginTop: "-15px" }}
          content={`Hi, my name is ${profile.displayName},`}
        />
      </Item.Group>
      <Statistic.Group size='tiny'>
        <Statistic
          className='followers'
          color='red'
          label='Followers'
          value={profile.followerCount || 0}
        />
        <Statistic
          className='followers'
          color='red'
          label='Following'
          value={profile.followingCount || 0}
        />
      </Statistic.Group>
      {!isCurrentUser && (
        <>
          <Reveal animated='move'>
            <Reveal.Content visible style={{ width: "100%" }}>
              <Button
                fluid
                color={followingUser ? "orange" : "youtube"}
                content={followingUser ? "Following" : "Not Following"}
              />
            </Reveal.Content>
            <Reveal.Content hidden style={{ width: "100%" }}>
              <Button
                fluid
                onClick={
                  followingUser
                    ? () => handleUnfollowUser()
                    : () => handleFollowUser()
                }
                loading={loading}
                color={followingUser ? "youtube" : "orange"}
                content={followingUser ? "Unfollow" : "Follow"}
              />
            </Reveal.Content>
          </Reveal>
        </>
      )}
    </Segment>
  );
}
