// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAGvgXUI6g9iDrnVyuymga-m-Rd4Bqxpaw",
    authDomain: "crm-ws.firebaseapp.com",
    projectId: "crm-ws",
    storageBucket: "crm-ws.appspot.com",
    messagingSenderId: "351811365769",
    appId: "1:351811365769:web:3c3eea0c34ea68927e0f58",
    measurementId: "G-BKNP9E57ZD"
};

// Initialize Firebase
// if (firebase.getApps().length === 0) {
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// }

