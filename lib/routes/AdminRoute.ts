import express from "express";
import { Router, Request, Response } from "express";
import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

const AdminRoute = Router();
const db = getFirestore();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */

AdminRoute.get("/", async (req: Request, res: Response) => {
  if (req.query.id) {
    var id: string = req.query.id + "";
    const docRef = doc(db, "admins", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      res.status(200).send(docSnap.data());
    } else {
      let result = {
        success: false,
        message: "Aucun utilisateur ne correspond à cet ID",
      };
      res.status(403).send(result);
    }
  } else {
    let result = {
      success: false,
      message: "Aucun ID renseigné",
    };
    res.status(403).send(result);
  }
});

/**
 * @api {post} admin/ Post Admin
 * @apiGroup Admin
 * @apiName postAdmin
 * @apiDescription Post Admin
 * @apiPermission Token
 *
 */
AdminRoute.post("/", async (req: Request, res: Response) => {
  const q = query(
    collection(db, "admins"),
    where("email", "==", req.body.email)
  );

  const auth = getAuth();
  const querySnapshot = await getDocs(q);
  var userID: string;

  if (querySnapshot.empty == true) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        req.body.email,
        req.body.password
      );
      console.log(req.body);
      const user = userCredential.user;
      userID = user.uid + "";
      console.log("user ID", userID);
      const docRef = doc(db, "admins", userID);
      setDoc(docRef, {
        email: req.body.email,
        phone: req.body.phone,
        name: req.body.name,
        surname: req.body.surname,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        organization: [],
      });
      let result = {
        success: true,
        message: "Utilisateur ajouté",
        docRef: userID,
      };
      sendEmailVerification(auth.currentUser).then(() => {
        res.status(200).send(result);
      });
    } catch (e) {
      res.status(400).send({ "erreur lors de la création ": e });
    }
  } else {
    let result = { success: false, message: "Utilisateur déjà existant" };
    res.status(403).send(result);
  }
});

/**
 * @api {put} admin/ update Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription update Admin
 * @apiPermission Token
 *
 */
AdminRoute.put("/", async (req: Request, res: Response) => {
  let result = { success: true, message: "update ok " };
  res.status(200).send(result);
});

/**
 * @api {delete} admin/ delete Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription delete Admin
 * @apiPermission Token
 *
 */
AdminRoute.delete("/", async (req: Request, res: Response) => {
  let result = { success: true, message: "delete ok" };
  res.status(200).send(result);
});

export = AdminRoute;
