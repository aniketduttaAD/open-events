import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "open-events-reactjs.firebaseapp.com",
  projectId: "open-events-reactjs",
  storageBucket: "open-events-reactjs.appspot.com",
  messagingSenderId: "213228374061",
  appId: "1:213228374061:web:ac2166e0ce3aafc53bd0a4",
};

export const app = initializeApp(firebaseConfig);
