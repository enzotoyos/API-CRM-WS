import express from "express";
import { Router, Request, Response } from "express";
import { DocumentData, getFirestore } from "firebase-admin/firestore";
import ICustomer from "../interface/ICustomer";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import MailController from "../controller/MailController";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

var Jimp = require("jimp");
var buffer = require("buffer");
var path = require("path");
import fs from "fs";
import { error, warn } from "console";

const CustomerRoute = Router();
const db = getFirestore();
const customerRef = db.collection("customers");
const mailCtrl = new MailController();
const storageRef = admin.storage().bucket(`crm-ws.appspot.com`);

CustomerRoute.post(
  "/mail",
  Interceptor,
  async (req: Request, res: Response) => {
    mailCtrl.sendInitPwd("DEUPONT Jean", "gaetan.patruno@ynov.com", "monlink");
    res.status(200).send({
      success: true,
      message: "Un mail de validation a été envoyé",
      record: [],
    });
  }
);

/**
 * @api {get} customer/ Get All Customer
 * @apiGroup Customer
 * @apiName getAllCustomer
 * @apiDescription Récupère tous les clients d'une organisation
 * @apiPermission Token
 */
CustomerRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  let result: IResult = {
    success: true,
    message: "La récupération des clients a réussi.",
    record: [],
  };

  try {
    const snapshot = await customerRef.get();
    snapshot.forEach((doc) => {
      result.record.push(doc.data());
    });
    res.status(200).send(result);
  } catch (error: any) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant la récupération d'un client.",
      error: error,
    });
  }
});

/**
 * @api {get} customer/:id Get Customer by Id
 * @apiQuery {String} id    Id of the User
 * @apiGroup Customer
 * @apiName getCustomerById
 * @apiDescription Récupère un client par son Id
 * @apiPermission Token
 *
 */
CustomerRoute.get("/:id", async (req: Request, res: Response) => {
  let result: IResult = {
    success: true,
    message: "La récupération du client a réussi.",
  };

  try {
    const custoRef = customerRef.doc(req.params.id);
    const doc = await custoRef.get();
    if (!doc.exists) {
      console.log("No such document!");
      result.message = "Aucun client correspondant";
    } else {
      result.result = doc.data();
    }
    res.status(200).send(result);
  } catch (error: any) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant la récupération d'un client.",
      error: error,
    });
  }
});

/**
 * @api {post} customer/ Add new Customer
 * @apiGroup Customer
 * @apiName postCustomer
 * @apiDescription Ajoute un client dans une organisation
 * @apiPermission Token
 *
 * @apiBody {String} email          Mandatory Email of the User.
 * @apiBody {String} phone          Mandatory Lastname.
 * @apiBody {String} name           Mandatory First name of the User.
 * @apiBody {String} surname        Mandatory Lastname of the User.
 * @apiBody {String} filename       Optionnal base 64 of a file.
 * @apiBody {Number} Age            Optionnal age.
 * @apiBody {Array} Appointement    Mandatory Array of Appointement.
 */
CustomerRoute.post("/", async (req: Request, res: Response) => {
  try {
    const newCusto = await customerRef.add({
      email: req.body.email,
      phone: req.body.phone,
      name: req.body.name,
      surname: req.body.surname,
      filename: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: "",
    });
    console.log("docRef : " + newCusto.id);
    res.status(200).send({ success: true, message: "Client Ajouté" });
  } catch (error: any) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant l'ajout d'un client.",
      error: error,
    });
  }
});

CustomerRoute.post("/upload", async (req, res) => {
  uploadImage(req.body.image);
  res.status(200).send("good");
});

const uploadImage = (data: string) => {
  var buf = Buffer.from(data, "base64");

  const file = storageRef.file(
    "customers" + "/" + uuidv4().toString() + ".png"
  );

  file.save(
    buf,
    {
      contentType: "image/png",
      metadata: { contentType: "image/png" },
    },

    (err) => {
      if (err) {
        throw err;
      } else {
        console.log("no way");
      }
    }
  );
  console.log("file", file);
};

const checkAutorisation = async (idAdmin: string, idOrganization: string) => {
  //Création des requètes
  const docUser = db.collection("admins").doc("idAdmin");
  const doc = await docUser.get();

  if (!doc.exists) {
    throw new warn("Le document demandé est introuvable");
  } else {
    console.log("Document data:", doc.data());
    const document = doc.data();
    var result = document.include();
    console.log(result);
  }
};

export = CustomerRoute;
