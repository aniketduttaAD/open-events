import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Dropdown,
  Search,
  Image,
  Segment,
  TextArea,
  Button,
  Comment,
  Modal,
} from "semantic-ui-react";
import { SiMessenger } from "react-icons/si";
import { IoMdSend } from "react-icons/io";
import { IoChatbox } from "react-icons/io5";
import { RiUserUnfollowFill, RiUserFollowFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import {
  followUser,
  unFollowUser,
  getFollowingDoc,
} from "../../app/firestore/firestoreService";
import { toast } from "react-toastify";
import { setFollowUser, setUnfollowUser } from "../userprofiles/profileActions";
import { CLEAR_FOLLOWINGS } from "../userprofiles/profileConstants";
import LoadingComponent from "../../app/layout/LoadingComponent";
import useFirestoreCollection from "../../app/hooks/useFirestoreCollection";
import {
  getFollowersCollection,
  getFollowingCollection,
} from "../../app/firestore/firestoreService";
import { formatDistance } from "date-fns";

export default function Messages() {
  const { currentUserProfile } = useSelector((state) => state.profile);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const dispatch = useDispatch();

  const handleFollowUser = async (user) => {
    setLoading(true);
    try {
      await followUser(user);
      dispatch(setFollowUser());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowUser = async (user) => {
    setLoading(true);
    try {
      await unFollowUser(user);
      dispatch(setUnfollowUser());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatOpen = (user) => {
    setSelectedUser(user);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    if (currentUserProfile) return;
    setLoading(true);
    async function fetchFollowingDoc() {
      try {
        const followingDoc = await getFollowingDoc(currentUserProfile.id);
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
  }, [dispatch, currentUserProfile.id, currentUserProfile]);

  useFirestoreCollection({
    query: () => getFollowersCollection(currentUserProfile.id),
    data: (data) => {
      setFollowers(data);
      setLoading(false);
    },
    deps: [currentUserProfile.id],
  });

  useFirestoreCollection({
    query: () => getFollowingCollection(currentUserProfile.id),
    data: (data) => {
      setFollowing(data);
      setLoading(false);
    },
    deps: [currentUserProfile.id],
  });

  const ChatModal = ({ open, onClose, user }) => {
    const [message, setMessage] = useState("");
    const [dataArray, setDataArray] = useState([]);
    const messagesContainerRef = useRef(null);

    const userID = user.id;
    const storedData = localStorage.getItem(userID);

    const initialDataArray = useMemo(() => {
      return storedData ? JSON.parse(storedData) : [];
    }, [storedData]);

    useEffect(() => {
      setDataArray(initialDataArray);
    }, [userID, initialDataArray]);

    useEffect(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, [dataArray]);

    const handleSend = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const newMessage = {
          userID: user.id,
          text: message,
          timestamp: new Date(),
        };
        const updatedArray = [...dataArray, newMessage];
        localStorage.setItem(userID, JSON.stringify(updatedArray));
        setDataArray(updatedArray);
        setMessage("");
      }
    };

    return (
      <Modal
        open={open}
        onClose={onClose}
        size='mini'
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          maxWidth: "400px",
          height: "500px",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Modal.Header>
          <Image avatar size='mini' src={user.photoURL} />
          {user.displayName}
        </Modal.Header>
        <Modal.Content>
          <Segment
            ref={messagesContainerRef}
            style={{
              height: "370px",
              width: "300px",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            <Comment.Group>
              {dataArray.map((message, index) => {
                const messageDate = new Date(message.timestamp);
                return (
                  <Comment
                    key={index}
                    className={
                      message.userID === currentUserProfile
                        ? "current-user"
                        : "other-user"
                    }
                  >
                    <Comment.Avatar as={Link} src={user.photoURL} />
                    <Comment.Content>
                      <Comment.Author>{user.displayName}</Comment.Author>
                      <Comment.Metadata>
                        <div>{formatDistance(messageDate, new Date())}</div>
                      </Comment.Metadata>
                      <Comment.Text>{message.text}</Comment.Text>
                    </Comment.Content>
                  </Comment>
                );
              })}
            </Comment.Group>
          </Segment>

          <div style={{ display: "flex" }}>
            <TextArea
              autoFocus
              rows={2}
              placeholder='Type your message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleSend}
              style={{ flex: 1 }}
            />
            <Button icon={<IoMdSend />} color='orange' onClick={handleSend} />
          </div>
        </Modal.Content>
      </Modal>
    );
  };

  return (
    <Dropdown
      icon={
        <SiMessenger
          style={{
            marginTop: "-2px",
            fontSize: "25px",
            color: "black",
          }}
        />
      }
      pointing='top right'
    >
      <Dropdown.Menu style={{ height: "500px", width: "300px" }}>
        <Dropdown.Header>
          <span style={{ fontWeight: "700", fontSize: "20px", color: "coral" }}>
            Chats
          </span>
          <Search placeholder='Search...' />
        </Dropdown.Header>

        {loading ? (
          <LoadingComponent />
        ) : (
          <>
            {following.map((user) => (
              <Segment
                style={{
                  marginRight: "10px",
                  marginLeft: "10px",
                  display: "flex",
                }}
                key={user.id}
              >
                <Segment.Inline
                  as={Link}
                  to={`/profile/${user.id}`}
                  style={{ flex: "1" }}
                >
                  <Image avatar size='mini' src={user.photoURL} />
                  <span>{user.displayName}</span>
                </Segment.Inline>
                <div
                  title={following ? "Unfollow User" : "Follow User"}
                  style={{ flex: "0" }}
                >
                  <Button
                    inverted
                    color={followUser ? "red" : "orange"}
                    icon={
                      following ? <RiUserFollowFill /> : <RiUserUnfollowFill />
                    }
                    onClick={
                      following
                        ? () => handleUnfollowUser(user)
                        : () => handleFollowUser(user)
                    }
                  />
                </div>
                <div title='Chat' style={{ flex: "0" }}>
                  <Button
                    inverted
                    color='orange'
                    icon={<IoChatbox />}
                    onClick={() => handleChatOpen(user)}
                  />
                </div>
              </Segment>
            ))}
            {selectedUser && (
              <ChatModal
                open={chatOpen}
                onClose={handleChatClose}
                user={selectedUser}
              />
            )}
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
