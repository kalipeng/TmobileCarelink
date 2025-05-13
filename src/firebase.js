// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBGKFS6W04apJF_TChrOJpcswZTReHsbV8",
  authDomain: "kneeheal-320a8.firebaseapp.com",
  databaseURL: "https://kneeheal-320a8-default-rtdb.firebaseio.com",
  projectId: "kneeheal-320a8",
  storageBucket: "kneeheal-320a8.appspot.com",
  messagingSenderId: "你的真实SenderId",
  appId: "你的真实AppId"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue };