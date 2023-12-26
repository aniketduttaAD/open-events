import { toast } from "react-toastify";
import { setupUserProfile } from "./firestoreService";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
} from "firebase/auth";
import {
  getDatabase,
  ref as fbRef,
  push,
  query,
  orderByKey,
  limitToLast,
} from "firebase/database";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../configs/firebase";

const auth = getAuth(app);
const db = getDatabase(app);

export function firebaseObjectToArray(snapshot) {
  if (snapshot) {
    return Object.entries(snapshot).map((e) =>
      Object.assign({}, e[1], { id: e[0] })
    );
  }
}

export function signInUsingEmail(creds) {
  return signInWithEmailAndPassword(auth, creds.email, creds.password);
}

export function signOutFirebase() {
  return signOut(auth);
}

export async function registerNewUsers(creds) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      creds.email,
      creds.password
    );
    await updateProfile(result.user, {
      displayName: creds.displayName,
    });
    return await setupUserProfile(result.user);
  } catch (error) {
    throw error;
  }
}

export async function otherLoginMethods(selectedProvider) {
  let provider;
  if (selectedProvider === "facebook") {
    provider = new FacebookAuthProvider();
  }
  if (selectedProvider === "google") {
    provider = new GoogleAuthProvider();
  }
  try {
    const result = await signInWithPopup(auth, provider);
    if (result._tokenResponse.isNewUser) {
      await setupUserProfile(result.user);
    }
  } catch (error) {
    toast.error(error.message);
  }
}

export function updateUserPassword(creds) {
  const user = auth.currentUser;
  return updatePassword(user, creds.newPassword);
}

export function uploadToFirebaseStorage(file, filename, context) {
  const user = auth.currentUser;
  const storage = getStorage(app);
  let storageRef;
  if(context==="profilePhoto"){
    storageRef = ref(storage, `${user.uid}/user_images/${filename}`);
  }
  else if (context === "coverPhoto"){
      storageRef = ref(storage, `${user.uid}/${context}/${filename}`);
  }
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      let toastId;
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress === 100) {
            toast.promise(Promise.resolve("success"), {
              pending: "Uploading...",
              success: "Upload completed",
              error: "Error occurred during upload",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          } else {
            if (!toastId) {
              toastId = toast("Uploading...");
            } else {
              toast.update(toastId, {
                render: "Uploading...",
                progress: progress,
                theme: "dark",
              });
            }
          }
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
}

export function deleteImageFromFirebaseStorage(filename) {
  const userUid = auth.currentUser.uid;
  const storage = getStorage(app);
  const storageRef = ref(storage, `${userUid}/user_images/${filename}`);
  return deleteObject(storageRef);
}

export function addEventChatComment(eventId, values) {
  const user = auth.currentUser;
  const newComment = {
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
    text: values.comment,
    date: Date.now(),
    parentId: values.parentId,
  };
  return push(fbRef(db, `chat/${eventId}`), newComment);
}

export function getEventChat(eventId) {
  return query(fbRef(db, `chat/${eventId}`), orderByKey());
}

export function getUserFeedRef() {
  const user = auth.currentUser;
  if (!user) return;
  return query(fbRef(db, "feed"), orderByKey(), limitToLast(10));
}

export function getUserPostsRef() {
  const user = auth.currentUser;
  if (!user) return;
  return query(fbRef(db, `posts/${user.uid}`), orderByKey(), limitToLast(10));
}
