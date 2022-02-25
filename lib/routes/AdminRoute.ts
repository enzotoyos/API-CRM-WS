import express from "express";
import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { DocumentData, getFirestore } from "firebase-admin/firestore";

const db = getFirestore();
const AdminRoute = Router();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
AdminRoute.get("/", async (req: Request, res: Response) => {
  var id: string = String(req.query.id);
  const userDoc = db.collection("admins").doc(id);
  const doc = await userDoc.get();
  if (!doc.exists) {
    console.log("No such document!");
    res.status(403).send({
      sucess: false,
      message: "Aucun utilisateur ne correspond à cet ID ",
    });
  } else {
    console.log("Document data:", doc.data());
    res.status(200).send({ sucess: true, value: doc.data() });
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
  console.log(req.body);
  try {
    const userRecord = await getAuth().createUser({
      email: req.body.email,
      emailVerified: false,
      password: req.body.password,
      displayName: req.body.name,
      disabled: false,
    });
    console.log("Successfully created new user:", userRecord.uid);

    const userDoc = db.collection("admins").doc(userRecord.uid);
    const resultat = await userDoc.set({
      email: req.body.email,
      emailVerified: false,
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      organization: [],
      createdAt: Date.now(),
      createdBy: "",
    });

    getAuth()
      .generateEmailVerificationLink(req.body.email)
      .then((link) => {
        console.log("link", link);

        res.status(200).send({
          success: true,
          message: "création réussi, un Email à été envoyé",
        });
      })
      .catch((error) => {
        res.status(403).send({ error: "erreur lors de l'envoi de l'email" });
      });
  } catch (error) {
    console.log("Error creating new user:", error);
    res.status(403).send(error.message);
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
  var id: string = String(req.query.id);

  const cityRef = db.collection("cities").doc(id);
  const resultat = await cityRef.update({ capital: true });
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
  var id: string = String(req.query.id);

  try {
    getAuth().deleteUser(id);
    console.log("Successfully deleted user");
    const resultat = await db.collection("admins").doc(id).delete();
    res
      .status(200)
      .send({ success: true, message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.log("Error deleting user:", error);
    res
      .status(403)
      .send({ success: false, message: "erreur lors de la suppression" });
  }
});

export = AdminRoute;
