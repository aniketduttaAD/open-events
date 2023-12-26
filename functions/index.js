/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const {setGlobalOptions} = require("firebase-functions/v2/options");
setGlobalOptions({maxInstances: 10});
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const key = require("./key.json");
const CLIENT_ID = key.CLIENT_ID;
const CLIENT_SECRET = key.CLIENT_SECRET;
const REDIRECT_URI = key.REDIRECT_URI;
const REFRESH_TOKEN = key.REFRESH_TOKEN;
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
);
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

exports.addFollowing = functions.firestore
    .document("following/{userUid}/userFollowing/{profileId}")
    .onCreate(async (snapshot, context) => {
      const following = snapshot.data();
      console.log({following});
      try {
        const userDoc = await db
            .collection("users")
            .doc(context.params.userUid)
            .get();
        const batch = db.batch();
        batch.set(
            db
                .collection("following")
                .doc(context.params.profileId)
                .collection("userFollowers")
                .doc(context.params.userUid),
            {
              displayName: userDoc.data().displayName,
              photoURL: userDoc.data().photoURL,
              uid: userDoc.id,
            },
        );
        batch.update(db.collection("users").doc(context.params.profileId), {
          followerCount: admin.firestore.FieldValue.increment(1),
        });
        const userPostsRef = admin
            .database()
            .ref(`/posts/${context.params.profileId}`);
        await userPostsRef.push({
          code: "started-following",
          displayName: userDoc.data().displayName,
          uid: userDoc.id,
          photoURL: userDoc.data().photoURL,
          followingUid: context.params.profileId,
          date: admin.database.ServerValue.TIMESTAMP,
        });
        console.log(context);
        return await batch.commit();
      } catch (error) {
        return console.log(error);
      }
    });

exports.removeFollowing = functions.firestore
    .document("following/{userUid}/userFollowing/{profileId}")
    .onDelete(async (snapshot, context) => {
      const batch = db.batch();
      batch.delete(
          db
              .collection("following")
              .doc(context.params.profileId)
              .collection("userFollowers")
              .doc(context.params.userUid),
      );
      batch.update(db.collection("users").doc(context.params.profileId), {
        followerCount: admin.firestore.FieldValue.increment(-1),
      });
      try {
        return await batch.commit();
      } catch (error) {
        return console.log(error);
      }
    });

exports.eventUpdated = functions.firestore
    .document("events/{eventId}")
    .onUpdate(async (snapshot, context) => {
      const before = snapshot.before.data();
      const after = snapshot.after.data();
      if (before.attendees.length < after.attendees.length) {
        const attendeeJoined = after.attendees.filter(
            (item1) => !before.attendees.some((item2) => item2.id === item1.id),
        )[0];
        console.log({attendeeJoined});
        try {
          const followerDocs = await db
              .collection("following")
              .doc(attendeeJoined.id)
              .collection("userFollowers")
              .get();
          followerDocs.forEach((doc) => {
            const postData = newPost(
                attendeeJoined,
                "joined-event",
                context.params.eventId,
                before,
            );
            admin.database().ref(`/posts/${doc.id}`).push().set(postData);
          });
        } catch (error) {
          return console.log(error);
        }
      }
      if (before.attendees.length > after.attendees.length) {
        const attendeeLeft = before.attendees.filter(
            (item1) => !after.attendees.some((item2) => item2.id === item1.id),
        )[0];
        console.log({attendeeLeft});
        try {
          const followerDocs = await db
              .collection("following")
              .doc(attendeeLeft.id)
              .collection("userFollowers")
              .get();
          followerDocs.forEach((doc) => {
            const postData = newPost(
                attendeeLeft,
                "left-event",
                context.params.eventId,
                before,
            );
            admin.database().ref(`/posts/${doc.id}`).push().set(postData);
          });
        } catch (error) {
          return console.log(error);
        }
      }
      return console.log("finished");
    });

// eslint-disable-next-line require-jsdoc
function newPost(user, code, eventId, event) {
  const postData = {
    photoURL: user.photoURL || "https://shorturl.at/qBHKO",
    date: admin.database.ServerValue.TIMESTAMP,
    code,
    displayName: user.name || null,
    eventId,
    userUid: user.id,
    title: event.title,
  };
  return postData;
}

exports.eventCreated = functions.firestore
    .document("events/{eventId}")
    .onCreate(async (snapshot, context) => {
      const event = snapshot.data();
      const {eventId} = context.params;
      try {
        const usersSnapshot = await db.collection("users").get();
        const users = usersSnapshot.docs.map((doc) => doc.data());
        for (const user of users) {
          await sendEmail(user, event, "event-created", eventId);
        }
        console.log("Emails sent successfully.");
      } catch (error) {
        console.error("Error:", error);
      }
      try {
        const postEventCreate = createEvent("event-created", event, eventId);
        console.log("Post Data:", postEventCreate);
        const userPostsRef = admin.database().ref(`/feed/${eventId}`);
        await userPostsRef.set(postEventCreate);
        console.log("Post Data stored successfully.");
      } catch (error) {
        console.error("Error:", error);
      }
      console.log("Finished");
      return null;
    });
// eslint-disable-next-line require-jsdoc
function createEvent(code, event, eventId) {
  const postEventCreate = {
    code,
    eventId,
    photoURL: event.photoURL || "https://shorturl.at/qBHKO",
    date: admin.database.ServerValue.TIMESTAMP,
    displayName: event.hostedBy,
    userUid: event.hostUid,
    title: event.title,
  };
  return postEventCreate;
}

exports.eventDeleted = functions.firestore
    .document("events/{eventId}")
    .onDelete(async (snapshot, context) => {
      const event = snapshot.data();
      const {eventId} = context.params;
      try {
        const usersSnapshot = await db.collection("users").get();
        const users = usersSnapshot.docs.map((doc) => doc.data());
        for (const user of users) {
          await sendEmail(user, event, "event-deleted", eventId);
        }
        console.log("Emails sent successfully.");
        const postEventDelete = deleteEvent("event-deleted", event);
        console.log("Post Data:", postEventDelete);
        const userPostsRef = admin.database().ref(`/feed/${eventId}`);
        await userPostsRef.set(postEventDelete);
        console.log("Post Data stored successfully.");
      } catch (error) {
        console.error("Error:", error);
      }
      console.log("Finished");
      return null;
    });
// eslint-disable-next-line require-jsdoc
function deleteEvent(code, event) {
  const postEventDelete = {
    code,
    photoURL: event.photoURL || "https://shorturl.at/qBHKO",
    date: admin.database.ServerValue.TIMESTAMP,
    displayName: event.hostedBy,
    userUid: event.hostUid,
    title: event.title,
  };
  return postEventDelete;
}

exports.handleNewPhoto = functions.firestore
    .document("users/{userId}/photos/{photoId}")
    .onCreate(async (snapshot, context) => {
      const photo = snapshot.data();
      const userId = context.params.userId;

      const user = await admin.auth().getUser(userId);

      const eventDocQuery = db
          .collection("events")
          .where("attendeeIds", "array-contains", userId);
      const userFollowingRef = db
          .collection("following")
          .doc(userId)
          .collection("userFollowing");
      const userFollowerRef = db
          .collection("following")
          .doc(userId)
          .collection("userFollowers");
      const batch = db.batch();

      try {
        if (photo.context === "profilePhoto") {
          batch.update(db.collection("users").doc(userId), {
            photoURL: photo.url,
          });
          const eventsQuerySnap = await eventDocQuery.get();

          eventsQuerySnap.forEach((eventDoc) => {
            const event = eventDoc.data();
            if (event.hostUid === userId) {
              batch.update(eventDoc.ref, {
                hostPhotoURL: photo.url,
              });
            }

            const updatedAttendees = event.attendees.map((attendee) => {
              if (attendee.id === userId) {
                return {
                  ...attendee,
                  photoURL: photo.url,
                };
              }
              return attendee;
            });

            batch.update(eventDoc.ref, {
              attendees: updatedAttendees,
            });
          });

          const userFollowingSnap = await userFollowingRef.get();
          userFollowingSnap.forEach((docRef) => {
            const followingDocRef = db
                .collection("following")
                .doc(docRef.id)
                .collection("userFollowers")
                .doc(userId);

            batch.update(followingDocRef, {
              photoURL: photo.url,
            });
          });

          const userFollowerSnap = await userFollowerRef.get();
          userFollowerSnap.forEach((docRef) => {
            const followerDocRef = db
                .collection("following")
                .doc(docRef.id)
                .collection("userFollowers")
                .doc(userId);

            batch.update(followerDocRef, {
              photoURL: photo.url,
            });
          });

          await batch.commit();

          await admin.auth().updateUser(userId, {
            photoURL: photo.url,
          });

          console.log("Photo URL updated for user", user.uid);
        }
      } catch (error) {
        console.error("Error updating photo URL for user", user.uid, error);
        throw error;
      }
    });

// eslint-disable-next-line require-jsdoc
async function sendEmail(user, event, eventCode, eventId) {
  try {
    const accessToken = oauth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "aniketdutta318@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const utcDateString = event.date;
    const istDate = new Date(utcDateString).toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    let htmlContent;

    if (eventCode === "event-created") {
      htmlContent = `
        <h1>${event.title}</h1>
        <h2>${event.description}</h2>
        <h3>Date: ${istDate}</h3>
        <h3>Category: ${event.category}</h3>
        <h2>Location 📍: ${event.city.address}</h2>
        <h1>Open in Google Maps 🗺️: <a href="https://www.google.com/maps?q=${event.venue.latLng.lat},${event.venue.latLng.lng}" target="_blank">Open in Google Maps</a></h1>
        <h1>Book your place today 🎫: <a href="https://open-events-dev.vercel.app/events/${eventId}" target="_blank">Event Link</a></h1>
      `;
    } else if (eventCode === "event-deleted") {
      htmlContent = `
        <h1>${event.title}</h1>
        <h3>Date: ${istDate}</h3>
        <h1>Sorry for the inconvenience caused!</h1>
      `;
    }
    const mailOptions = {
      from: "Open-Events 📧 openevents.noreply@gmail.com",
      to: user.email,
      subject: `${
        eventCode === "event-created" ?
          "Hey! There is an upcoming event... " :
          "Event Deleted: Sorry the event was deleted"
      }`,
      text: `Join the event today: ${event.description}`,
      html: htmlContent,
    };
    const result = await transport.sendMail(mailOptions);
    console.log(`Email sent to ${user.email}`, result);
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}

