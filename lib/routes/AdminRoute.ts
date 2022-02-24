import express from "express";
import { Router, Request, Response } from "express";
import { FirebaseApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";

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
  let result = { success: true, message: "get info ok " };
  res.status(200).send(result);
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
  try {
    const docRef = await addDoc(collection(db, "admins"), {
      email: req.body.email,
      phone: req.body.phone,
      name: req.body.name,
      surname: req.body.surname,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      organization: [],
    });
    console.log("docRef : " + docRef.id);
    let result = { success: true, message: "Utilisateur Ajouté" };
    res.status(200).send(result);
  } catch (error: any) {
    console.log(error);
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
