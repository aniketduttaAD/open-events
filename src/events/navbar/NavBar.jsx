import React, { useContext } from "react";
import {
  Button,
  Container,
  Menu,
  Dropdown,
  Icon,
  Header,
} from "semantic-ui-react";
import CreateEvent from "../createEvent/CreateEvent";
import { Themes } from "../../features/Themes";
import { EventSelect, UserContext } from "../../app/layout/App";
import { NavLink, useNavigate } from "react-router-dom";
import SignOut from "./SignOut";
import SignIn from "./SignIn";
import { useSelector } from "react-redux";
import EventsFeed from "../eventDashboard/EventsFeed";

export default function NavBar() {
  const { darkMode, toggleDarkMode } = useContext(Themes);
  const { setModalOpen } = useContext(UserContext);
  const { setSelectedEvent } = useContext(EventSelect);
  const navigate = useNavigate();
  const { authenticated } = useSelector((state) => state.auth);

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const handleCreateEvent = () => {
    navigate("/events");
    setModalOpen(true);
    setSelectedEvent(null);
  };

  return (
    <Menu inverted fixed='top'>
      <Container>
        <Menu.Item
          as={NavLink}
          to='/'
          header
          className='title'
          style={{ marginLeft: "35px" }}
        >
          <img
            src='/assets/logo1.gif'
            alt='logo'
            style={{ padding: 0, margin: 0 }}
          />
        </Menu.Item>
        <Menu.Item
          className='appName'
          as={NavLink}
          to='/events'
          style={{
            fontWeight: 500,
            fontSize: "30px",
            padding: "10px",
          }}
        >
          Open Events
        </Menu.Item>
        {authenticated ? (
          <>
            <Menu.Item style={{ padding: 0, marginLeft: 10 }}>
              <Button
                positive
                inverted
                color='orange'
                circular
                placeholder='Create Event'
                content='Create Event'
                style={{
                  margin: 0,
                }}
                onClick={handleCreateEvent}
              />
              <CreateEvent />
            </Menu.Item>
            <Menu.Item>
              <Dropdown
                closeOnEscape
                pointing='top left'
                icon={<Icon size='big' name='bell outline' />}
              >
                <Dropdown.Menu>
                  <Header color='orange' content='News Feed' icon='newspaper' />
                  <Dropdown.Item>
                    <EventsFeed />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Menu.Item>
            <SignIn />
          </>
        ) : (
          <SignOut />
        )}
        <Menu.Item>
          <Dropdown
            pointing='top right'
            icon={
              darkMode ? (
                <img src='/assets/moon.png' alt='moon' />
              ) : (
                <img src='/assets/sun.png' alt='sun' />
              )
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={handleDarkModeToggle}
                style={{ padding: 0 }}
                value='sun'
                active={darkMode === false}
              >
                <Icon name='sun'></Icon>
                Light Mode
              </Dropdown.Item>
              <Dropdown.Item
                className='moon'
                onClick={handleDarkModeToggle}
                style={{ padding: 0 }}
                value='moon'
                active={darkMode === true}
              >
                <Icon name='moon'></Icon>
                Dark Mode
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </Container>
    </Menu>
  );
}
