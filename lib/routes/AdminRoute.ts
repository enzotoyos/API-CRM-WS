import express from "express";
import { Router, Request, Response } from "express";

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
  let result = { success: true, message: "get info ok " };
  res.status(200).send(result);
});

/**
 * @api {post} admin/ Post Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
AdminRoute.post("/", async (req: Request, res: Response) => {
  let result = { success: true, message: "Create ok " };
  res.status(200).send(result);
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
