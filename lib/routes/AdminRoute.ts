import express, { query } from "express";
import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { DocumentData, getFirestore } from "firebase-admin/firestore";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AuthController from "../controller/AuthController";
import MailController from "../controller/MailController";
import LoggerManager = require("../../config/Logger");

const db = getFirestore();
const AdminRoute = Router();
const AuthCtrl = new AuthController();
const mailCtrl = new MailController();
const tokenCtrl = new TokenController();
const adminRef = db.collection('admins');
const Logger = LoggerManager(__filename);

/** 
 * @api {post} admin/login Login Admin
 * @apiGroup Admin
 * @apiName LoginAdmin
 * @apiDescription Route permettant d'authentifier un administrateur
 *
 * @apiBody {String} email          Mandatory Admin Email
 * @apiBody {String} password       Mandatory Admin Password.
 */
AdminRoute.post("/login", async (req: Request, res: Response) => {
  console.log(req.body);
  Logger.error(req.body);
  if (req.body.email && req.body.password) {
    let record = await AuthCtrl.login(req.body.email, req.body.password);
    if (record.success) {
      record = await tokenCtrl.createToken(record.record.localId)
      res.status(200).send(record);
    } else {
      res.status(500).send(record);
    }
  } else {
    res.status(500).send({ sucess: false, message: 'Vous devez saisir vos identifiants.' });
  }
});

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
AdminRoute.get("/:id",Interceptor,async (req: Request, res: Response) => {
  var id: string = String(req.params.id);
  const userDoc = db.collection("admins").doc(id);
  const doc = await userDoc.get();
  if (!doc.exists) {
    console.log("No such document!");
    res.status(403).send({
      success: false,
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
 * @apiBody {String} email              Mandatory Admin Email
 * @apiBody {String} password           Mandatory Admin Password.
 * @apiBody {String} name               Mandatory Admin Name.
 * @apiBody {String} surname            Mandatory Admin Lastname.
 * @apiBody {String} phone              Mandatory Admin phone.
 */
AdminRoute.post("/",Interceptor,async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  try {
    const record = [];
    const snapshot = await adminRef.where('createdBy', '==', String(tokenDecod.uid)).orderBy('createdAt', 'desc').limit(1).get();
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        record.push(doc.data());
      });
    }

    const dateExpire = new Date(record[0].createdAt);
    dateExpire.setMinutes(dateExpire.getMinutes() + 1);

    // isSpam = false we can create Admin
    const isSpam = (dateExpire.getTime() > new Date().getTime());
    if (!isSpam) {
      const userRecord = await getAuth().createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.password,
        displayName: req.body.name,
        disabled: false,
      });
      const sLink = await getAuth().generateEmailVerificationLink(req.body.email);
      mailCtrl.sendInitPwd(req.body.name + ' ' + req.body.surname, req.body.email, sLink);

      adminRef.doc(userRecord.uid).set({
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname,
        phone: req.body.phone,
        organization: [],
        createdAt: Date.now(),
        createdBy: tokenDecod.uid,
      });

      res.status(200).send({ success: true, message: "L'administrateur a bien été ajouté. Un email de validation a été envoyé.", record: userRecord.uid });
    } else {
      res.status(403).send({ success: false, message: "Vous devez attendre 1 minute pour créer un autre admin." });
    }
  } catch (error) {
    console.log("Error creating new user:", error);
    res.status(403).send({ success: false, message: error.message });
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
AdminRoute.put("/:id", async (req: Request, res: Response) => {
  console.log(req.query.id);

  const admRef = adminRef.doc(String(req.params.id));

  await admRef.update({
    resume: req.body.resume,
    date: req.body.date,
    place: req.body.place,
    createdAt: Date.now(),
    createdBy: "",
  });

  const result = { success: true, message: "putAdmin" };
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
AdminRoute.delete("/",Interceptor,async (req: Request, res: Response) => {
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
