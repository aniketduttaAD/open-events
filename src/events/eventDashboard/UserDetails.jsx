import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Item, Statistic, Divider, Image } from "semantic-ui-react";

export default function UserDetails() {
  const { currentUserProfile } = useSelector((state) => state.profile);
  if (!currentUserProfile) {
    return null;
  }
  return (
    <>
      <Divider horizontal content='Welcome to' />
      <Item.Group>
        <Image
          src={currentUserProfile.coverPhotoURL}
          style={{ position: "relative", width: "100%" }}
        />
        <div style={{ position: "relative", marginBottom: "50px" }}>
          <Image
            circular
            centered
            size='tiny'
            src={
              currentUserProfile?.photoURL
                ? currentUserProfile.photoURL
                : "https://shorturl.at/qBHKO"
            }
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
        <Item.Content style={{ textAlign: "center" }}>
          <Item.Header
            style={{
              fontFamily: "Poppins",
              fontWeight: "700",
              fontSize: 25,
              marginTop: "-10px",
            }}
            as='h1'
            content={currentUserProfile?.displayName}
          />
          <Item.Description
            as='h5'
            style={{
              fontFamily: "Poppins",
              fontWeight: "500",
              marginTop: "-15px",
            }}
            content={`Hello ${currentUserProfile.displayName}, `}
          />
          Experience flawless event planning and unforgettable moments with our
          cutting-edge event management website
        </Item.Content>
      </Item.Group>
      <Statistic.Group
        style={{ marginLeft: "-26px", marginTop: "-10px" }}
        size='mini'
      >
        <Statistic
          as={Link}
          to={`/profile/${currentUserProfile?.id}`}
          className='followers'
          color='red'
          label='Followers'
          value={currentUserProfile?.followerCount || 0}
        />
        <Statistic
          as={Link}
          to={`/profile/${currentUserProfile?.id}`}
          className='followers'
          color='red'
          label='Following'
          value={currentUserProfile?.followingCount || 0}
        />
      </Statistic.Group>
      <Statistic />
      <Divider horizontal content='Open Events' />
    </>
  );
}
