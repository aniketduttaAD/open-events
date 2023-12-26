import React from "react";
import { Menu, Dropdown, Image } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { signOutFirebase } from "../../app/firestore/firebaseService";

export default function SignIn() {
  const navigate = useNavigate();
  const { currentUserProfile } = useSelector((state) => state.profile);

  function handleSettings() {
    navigate("/manage-account");
  }
  function handleUserProfile() {
    navigate(`/profile/${currentUserProfile?.id}`);
  }

  async function handleSignOut() {
    try {
      navigate("/");
      await signOutFirebase();
    } catch (error) {
      toast.error(error.message);
    }
  }
  return (
    <Menu.Item fitted position='right'>
      <Dropdown
        pointing='top right'
        icon={
          <Image
            src={currentUserProfile?.photoURL || "https://shorturl.at/qBHKO"}
            alt='userlogo'
            style={{ borderRadius: "50%", width: "40px", height: "40px" }}
          />
        }
      >
        <Dropdown.Menu>
          <Dropdown.Header
            content={
              "Welcome " + (currentUserProfile?.displayName + "," || "Hero.")
            }
          />
          <Dropdown.Divider />
          <Dropdown.Item
            text='View Profile'
            onClick={handleUserProfile}
            icon='user outline'
          />
          <Dropdown.Item
            text='Change Password'
            icon='setting'
            onClick={handleSettings}
          />
          <Dropdown.Item
            onClick={handleSignOut}
            text='Sign Out'
            icon='sign out'
            className='sign-out-item'
          />
        </Dropdown.Menu>
      </Dropdown>
    </Menu.Item>
  );
}
