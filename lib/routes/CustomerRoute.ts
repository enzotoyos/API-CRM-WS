import express from "express";
import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import ICustomer from "../interface/ICustomer";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";

const CustomerRoute = Router();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
CustomerRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  console.log("GET OK", req.params);
  let result: IResult = { success: true, message: "", record: [] };

  //   try {
  //     const querySnapshot = await getDocs(collection(db, "customers"));
  //     querySnapshot.forEach((doc) => {
  //       result.record.push(doc.data());
  //     });
  //   } catch (error: any) {
  //     result.success = false;
  //     console.log(error);
  //   }

  res.status(200).send(result);
});

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
CustomerRoute.get("/:id", async (req: Request, res: Response) => {
  console.log("get PARAM", req.params);

  //   try {
  //     const docRef = doc(db, "customers", req.params.id);
  //     const docSnap: DocumentData = (await getDoc(docRef)).data();

  //     console.log("docRef : ", docSnap);
  //   } catch (error: any) {
  //     console.log(error);
  //   }

  let result = { success: true, message: "Coucou" };
  res.status(200).send(result);
});

CustomerRoute.post("/", async (req: Request, res: Response) => {
  //   try {
  //     const docRef = await addDoc(collection(db, "admins"), {
  //       email: req.body.email,
  //       phone: req.body.phone,
  //       name: req.body.name,
  //       surname: req.body.surname,
  //       createdAt: Date.now(),
  //       updatedAt: Date.now(),
  //       organization: [],
  //     });
  //     console.log("docRef : " + docRef.id);
  //     let result = { success: true, message: "Utilisateur Ajouté" };
  //     res.status(200).send(result);
  //   } catch (error: any) {
  //     console.log(error);
  //   }
});

export = CustomerRoute;
