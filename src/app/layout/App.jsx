import React, { createContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Container, Divider } from "semantic-ui-react";
import { ThemeProvider } from "../../features/Themes";
import NavBar from "../../events/navbar/NavBar";
import Homepage from "../../features/HomePage";
import EventDashboard from "../../events/eventDashboard/EventDashboard";
import EventDetailsPage from "../../events/eventDetailsPage/EventDetailsPage";
import ManageModal from "../common/modals/ManageModal";
import { ToastContainer } from "react-toastify";
import ErrorComponent from "../common/errors/ErrorComponent";
import UserAccount from "../../features/authentication/UserAccount";
import { useSelector } from "react-redux";
import LoadingComponent from "./LoadingComponent";
import ProfilePage from "../../features/userprofiles/profilePage/ProfilePage";
import PrivateRoute from "./PrivateRoute";
import VerificaionPage from "./VerificationPage";

export const UserContext = createContext();
export const EventSelect = createContext();
export default function App() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { intialize } = useSelector((state) => state.asynchronous);

  if (!intialize) return <LoadingComponent content='Loading...' />;

  return (
    <UserContext.Provider value={{ modalOpen, setModalOpen }}>
      <ManageModal />
      <ToastContainer position='bottom-right' theme='colored' hideProgressBar autoClose/>
      <EventSelect.Provider value={{ selectedEvent, setSelectedEvent }}>
        <ThemeProvider>
          <NavBar />
          <Divider style={{ marginTop: "60px" }} />
          <Container className='main'>
            <Routes>
              <Route exact path='/' element={<Homepage />} />
              <Route exact path='/events' element={<EventDashboard />} />
              <Route path='/events/:id' element={<EventDetailsPage />} />
              <Route
                path='/profile/:id/*'
                element={
                  <PrivateRoute element={ProfilePage}>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path='/manage-account'
                element={
                  <PrivateRoute element={UserAccount}>
                    <UserAccount />
                  </PrivateRoute>
                }
              />
              <Route
                path='/verification'
                element={
                  <PrivateRoute element={VerificaionPage}>
                    <VerificaionPage />
                  </PrivateRoute>
                }
              />
              <Route path='/error' element={<ErrorComponent />} />
              <Route path='*' element={<p>There's nothing here: 404!</p>} />
            </Routes>
          </Container>
        </ThemeProvider>
      </EventSelect.Provider>
    </UserContext.Provider>
  );
}
