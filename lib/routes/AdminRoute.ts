import express from "express";
import { Router, Request, Response } from "express";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import db from "firebase-admin/firestore";
const AdminRoute = Router();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */

AdminRoute.get("/", async (req: Request, res: Response) => {});

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

    const cityRef = db.collection("cities").doc("BJ");

    const res = await cityRef.set(
      {
        capital: true,
      },
      { merge: true }
    );

    let result = { success: true, message: "création réussi " };
    res.status(200).send(result);
  } catch (error) {
    console.log("Error creating new user:", error);
    res.status(403).send(error.message);
  }
});

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
