// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import * as serviceAccount from "./crm-ws-firebase-adminsdk.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  // databaseURL: process.env.FIREBASE_DB
});
