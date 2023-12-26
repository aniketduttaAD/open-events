import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  Icon,
  Item,
  Segment,
  Modal,
  Confirm,
  Label,
} from "semantic-ui-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { EventSelect, UserContext } from "../../app/layout/App";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import GoogleMapReact from "google-map-react";
import {
  addUserAttendee,
  cancelUserAttendee,
  cancelOrHideEvent,
} from "../../app/firestore/firestoreService";
import { Flip, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "../../app/common/modals/modalReducer";
import QRCode from "react-qr-code";

function Marker() {
  return <Icon name='map marker alternate' size='big' color='red'></Icon>;
}

export default function EventDetailsInfo({ event, isHost, isGoing }) {
  const zoom = 16;
  const { setModalOpen } = useContext(UserContext);
  const [openMap, setOpenMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setSelectedEvent } = useContext(EventSelect);
  const { authenticated } = useSelector((state) => state.auth);
  const { currentUser } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const qrCodeRef = useRef(null);

  async function handleUserJoinEvent() {
    setLoading(true);
    try {
      setShowModal(true);
      await addUserAttendee(event);
      toast.success("Your place is booked!", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUserLeaveEvent() {
    setLoading(true);
    try {
      await cancelUserAttendee(event);
      toast.error("Your place is cancelled!", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleQRCodeScanned = useCallback(() => {
    navigate("/verification");
  }, [navigate]);

  const qrCodeValue = `https://open-events-dev.vercel.app/verification/${currentUser?.uid}`;

  useEffect(() => {
    const handleQRCodeLoaded = () => {
      const qrCodeImage = qrCodeRef.current.querySelector("img");
      qrCodeImage.addEventListener("click", handleQRCodeScanned);
    };

    const qrCodeImage = qrCodeRef.current?.querySelector("img");
    if (qrCodeImage) {
      qrCodeImage.addEventListener("load", handleQRCodeLoaded);
    }

    return () => {
      if (qrCodeImage) {
        qrCodeImage.removeEventListener("load", handleQRCodeLoaded);
        qrCodeImage.removeEventListener("click", handleQRCodeScanned);
      }
    };
  }, [handleQRCodeScanned]);

  // const handleDownloadQRCode = () => {
  //   const qrCodeCanvas = qrCodeRef.current?.querySelector("canvas");

  //   if (qrCodeCanvas) {
  //     try {
  //       const dataUrl = qrCodeCanvas.toDataURL("image/png");
  //       const a = document.createElement("a");
  //       a.href = dataUrl;
  //       a.download = "qr-code.png";
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //     } catch (error) {
  //       console.error("Error generating QR code:", error);
  //     }
  //   }
  // };

  const mapViewOpen = () => {
    setOpenMap(true);
  };

  const mapViewClose = () => {
    setOpenMap(false);
  };

  const handleManageEvent = () => {
    setModalOpen(true);
    setSelectedEvent(event);
  };

  const latitude = event.venue.latLng.lat;
  const longitude = event.venue.latLng.lng;
  function openGoogleMaps() {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  }
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleCancelToggle(event) {
    setConfirmOpen(false);
    setLoadingCancel(true);
    try {
      await cancelOrHideEvent(event);
      setLoadingCancel(false);
    } catch (error) {
      setLoadingCancel(true);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (event) {
      setSelectedEvent(event);
    }
  }, [params, setSelectedEvent, event]);

  useEffect(() => {
    const { images } = event || {};
    if (images?.length) {
      const interval = setInterval(() => {
        setCurrentIndex(
          currentIndex === images.length - 1 ? 0 : currentIndex + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, event]);
  const { images } = event || {};

  return (
    <>
      {images && (
        <Carousel
          selectedItem={currentIndex}
          onChange={setCurrentIndex}
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={3000}
          stopOnHover={false}
          showArrows
          showIndicators={false}
          renderArrowPrev={(onClickHandler, hasPrev) =>
            hasPrev && (
              <button
                type='button'
                onClick={onClickHandler}
                className='carousel-arrow carousel-arrow-prev'
              >
                <Icon
                  name='chevron circle left'
                  size='big'
                  style={{ color: "#ff851b" }}
                />
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext) =>
            hasNext && (
              <button
                type='button'
                onClick={onClickHandler}
                className='carousel-arrow carousel-arrow-next'
              >
                <Icon
                  name='chevron circle right'
                  size='big'
                  style={{ color: "#ff851b" }}
                />
              </button>
            )
          }
        >
          {images.map((image, index) => (
            <div key={index} className='carousel-image-wrapper'>
              <img src={image} alt={`img${index}`} />
            </div>
          ))}
        </Carousel>
      )}
      {!images && <p>No images available</p>}
      <Segment.Group style={{ position: "relative" }}>
        <Segment>
          <Item.Group>
            <Item.Content>
              <Item.Image
                size='tiny'
                circular
                src={
                  event.hostPhotoURL
                    ? event.hostPhotoURL
                    : "https://shorturl.at/qBHKO"
                }
              />
              <Button onClick={mapViewOpen} floated='right' color='orange'>
                View Map
              </Button>
              <Modal
                closeIcon
                size='tiny'
                open={openMap}
                onClose={mapViewClose}
              >
                <Modal.Header>Location</Modal.Header>
                <Modal.Content style={{ height: 600 }}>
                  <GoogleMapReact
                    bootstrapURLKeys={{
                      key: process.env.REACT_APP_MAPS_KEY,
                    }}
                    center={event.venue.latLng}
                    zoom={zoom}
                  >
                    <Marker
                      lat={event.venue.latLng.lat}
                      lng={event.venue.latLng.lng}
                    />
                  </GoogleMapReact>
                </Modal.Content>
                <Modal.Actions>
                  <Button negative onClick={mapViewClose}>
                    Close
                  </Button>
                  <Button
                    content='Open in Google Maps'
                    inverted
                    color='orange'
                    onClick={openGoogleMaps}
                  />
                </Modal.Actions>
              </Modal>
              <Item.Header
                style={{ marginTop: "10px" }}
                content={event.title}
              />
              <Item.Description>
                Hosted by{" "}
                <strong>
                  <Link to={`/profile/${event.hostUid}`}>{event.hostedBy}</Link>
                </strong>
              </Item.Description>
              <Segment>
                <span>
                  <Icon
                    name='calendar alternate outline'
                    color='violet'
                    size='large'
                    fitted
                    style={{
                      paddingRight: "10px",
                    }}
                  />
                  {format(new Date(event.date), "MMMM d, yyyy h:mm a")}
                  <Icon
                    name='map marker alternate'
                    color='red'
                    size='large'
                    fitted
                    style={{ paddingLeft: "15px", paddingRight: "10px" }}
                  />
                  {event.venue.address}
                </span>
              </Segment>
              <Item.Description>{event.description}</Item.Description>
            </Item.Content>
          </Item.Group>
        </Segment>
        {authenticated ? (
          <>
            <Segment textAlign='right' clearing>
              {isHost && (
                <Button
                  inverted
                  color='orange'
                  onClick={handleManageEvent}
                  content='Manage Event'
                />
              )}
              {!isHost && (
                <>
                  {event?.isCancelled ? (
                    <Label
                      color='red'
                      content="Event is cancelled! You can't join the event"
                    />
                  ) : (
                    <>
                      {isGoing ? (
                        <Button
                          onClick={handleUserLeaveEvent}
                          loading={loading}
                        >
                          Cancel My Place
                        </Button>
                      ) : (
                        <Button
                          onClick={handleUserJoinEvent}
                          loading={loading}
                          color='orange'
                        >
                          Join Event
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
              <Modal size='mini' open={showModal} onClose={handleCloseModal}>
                <Modal.Header>QR Code</Modal.Header>
                <Modal.Content>
                  <div ref={qrCodeRef}>
                    <QRCode value={qrCodeValue} />
                  </div>
                  {/* <Button onClick={handleDownloadQRCode}>
                    Download QR Code
                  </Button> */}
                </Modal.Content>
              </Modal>
              {event && event.hostUid === currentUser?.uid && (
                <Button
                  loading={loadingCancel}
                  type='button'
                  floated='left'
                  color={event.isCancelled ? "orange" : "youtube"}
                  content={
                    event.isCancelled ? "Reactivate Event" : "Cancel Event"
                  }
                  onClick={() => setConfirmOpen(true)}
                />
              )}
              <Confirm
                content={
                  event?.isCancelled
                    ? "This will reactivate the event"
                    : "This will cancel the event"
                }
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={() => handleCancelToggle(event)}
              />
            </Segment>
          </>
        ) : (
          <h4
            style={{
              marginLeft: "10px",
              marginBottom: "10px",
            }}
          >
            Intrested in the event! Want to join it?{"  "}
            <Button
              onClick={() => dispatch(openModal({ modalType: "RegisterUser" }))}
              style={{
                border: "none",
                padding: "5px",
                backgroundColor: "coral",
              }}
              content='Sign in to book your place'
            />
          </h4>
        )}
      </Segment.Group>
    </>
  );
}
