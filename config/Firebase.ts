// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
// import { Vault } from "kuzzle-vault";
import * as dotenv from "dotenv";
import jfe from "json-file-encrypt";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// const vault = new Vault(process.env.KEY_ENCRYPT_FIREBASE);
//déchiffrement du JSON avec la clé dans le .env
// vault.decrypt("./config/crm-ws-firebase-adminsdk.enc.json");
import * as serviceAccountEncrypt from "./crm-ws-firebase-adminsdk.enc.json";
import * as serviceAccount from "./crm-ws-firebase-adminsdk.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  // credential: admin.credential.cert(vault.secrets as any),
  // databaseURL: process.env.FIREBASE_DB
});
