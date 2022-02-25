import { Router, Request, Response } from "express";
import {
  DocumentData,
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

const CustomerRoute = Router();
const db = getFirestore();

const checkAutorisationForAdmin = async (
  idAdmin: string,
  idOrganization: string
) => {
  //Création des requètes
  const docUser = db.collection("admins").doc(idAdmin);
  const doc = await docUser.get();

  if (!doc.exists) {
    return "erreur le document demandé n'existe pas";
  } else {
    const document = doc.data();
    const isOrga = doc.data().organization.includes(idOrganization);
    return isOrga;
  }
};

// Vérifie que le client et l'admin on l'acces à l'organisation
const checkAutorisationForCustomer = async (
  idCustomer: string,
  idOrganization: string
) => {
  //Création des requètes
  var idOrga: string;
  var idClient: string;
  const userDoc = db.collection("organizations");
  const snapshot = await userDoc.where("customer", "in", [[idCustomer]]).get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return false;
  } else {
    snapshot.forEach((doc) => {
      idOrga = doc.id;
      console.log(idOrga);
    });

    const adminDoc = db.collection("admins");
    const docAdmin = await adminDoc
      .where("organization", "in", [[idOrga]])
      .get();
    if (docAdmin.empty) {
      console.log("No matching documents. 2");
      return false;
    } else {
      snapshot.forEach((doc) => {
        idClient = doc.id;
        console.log(idClient);
      });
    }
    if (idOrga == idClient) {
      return true;
    } else {
      return false;
    }
  }
};
