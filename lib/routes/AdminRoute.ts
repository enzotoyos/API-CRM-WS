import express from "express";
import { Router, Request, Response } from "express";
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
import TokenController = require("../controller/TokenController");
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AdminRoute = Router();
const db = getFirestore();
const auth = getAuth();
const tokenCtrl = new TokenController();

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
AdminRoute.post("/", async (req: Request, res: Response) => {});

/**
 * @api {post} admin/login Login Admin
 * @apiGroup Admin
 * @apiName LoginAdmin
 * @apiDescription login Admin
 */
AdminRoute.post("/login", async (req: Request, res: Response) => {});

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
