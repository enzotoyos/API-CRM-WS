import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import MailController from "../controller/MailController";
import admin from "firebase-admin";
import TokenController from "../controller/TokenController";
import { v4 as uuidv4 } from "uuid";
import AdminController from "../controller/AdminController";
import LoggerManager from "../../config/Logger";

const CustomerRoute = Router();
const db = getFirestore();
const adminRef = db.collection("admins");
const customerRef = db.collection("customers");
const orgaRef = db.collection("organizations");
const mailCtrl = new MailController();
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();
const Logger = LoggerManager(__filename);

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
  const result: IResult = {
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
    Logger.log({ level: "error", message: error });
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
CustomerRoute.get("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  const result: IResult = {
    success: true,
    message: "La récupération du client a réussi.",
  };

  try {
    if (
      await adminCtrl.checkAutorisationCustForAdmin(
        tokenDecod.uid,
        req.params.id
      )
    ) {
      const custoRef = customerRef.doc(req.params.id);
      const doc = await custoRef.get();
      if (!doc.exists) {
        result.message = "Aucun client correspondant";
      } else {
        result.result = doc.data();
        result.result.imageLink = await getListImage(req.params.id);
        res.status(200).send(result);
      }
    } else {
      res.status(401).send({
        success: false,
        message: "Vous n'avez pas le droit d'accéder à cette ressource.",
      });
    }
  } catch (error: any) {
    Logger.log({ level: "error", message: error });
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
 * @apiBody {String} id             Mandatory of Organization
 * @apiBody {String} email          Mandatory Email of the User.
 * @apiBody {String} phone          Mandatory Lastname.
 * @apiBody {String} name           Mandatory First name of the User.
 * @apiBody {String} surname        Mandatory Lastname of the User.
 * @apiBody {String} filename       Optionnal base 64 of a file.
 * @apiBody {Number} Age            Optionnal age.
 */
CustomerRoute.post("/", Interceptor, async (req: Request, res: Response) => {
  const message = testValueInBody(
    req.body.email,
    req.body.phone,
    req.body.name,
    req.body.surname
  );

  if (message === true) {
    try {
      const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
      const userDoc = adminRef.doc(tokenDecod.uid);

      const doc = await userDoc.get();
      if (!doc.exists) {
        res.status(500).send({
          success: false,
          message: "Votre compte Admin n'existe pas.",
        });
      } else {
        const isOrga = doc.data().organization.includes(req.body.id);
        if (isOrga) {
          const newCusto = await customerRef.add({
            email: req.body.email,
            phone: req.body.phone,
            name: req.body.name,
            surname: req.body.surname,
            imageLink: [],
            age: req.body.age,
            appointement: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: tokenDecod.uid,
          });
          const docOrga = orgaRef.doc(req.body.id);
          await docOrga.update({
            customer: FieldValue.arrayUnion(newCusto.id),
          });
          res.status(200).send({
            success: true,
            message: "Le client a été ajouté dans l'organisation",
            record: newCusto.id,
          });
        } else {
          res.status(401).send({
            success: false,
            message: "Votre n'avez pas accès a cette organisation.",
          });
        }
      }
    } catch (error: any) {
      Logger.log({ level: "error", message: error });
      res.status(400).send({
        success: false,
        message: "Une erreur est survenue durant upload.",
        error: error,
      });
    }
  } else {
    res.status(403).send({
      success: false,
      error: message,
    });
  }
});

/**
 * @api {post} customer/ post Image
 * @apiGroup Customer
 * @apiName postCustomer
 * @apiDescription Ajouter une image pour un client
 * @apiPermission Token
 * @apiBody {String} idCustomer            ID du customer
 * @apiBody {String} image          Image en Base64
 */
CustomerRoute.post(
  "/:id/image",
  Interceptor,
  async (req: Request, res: Response) => {
    console.log(req.params.id);
    try {
      uploadImage(req.body.image, req.params.id).then(function (result) {
        res.status(200).send({
          sucess: true,
          message: "Image uploaded",
          Date: Date.now(),
          imageUrl: result[0],
        });
      });
    } catch (error: any) {
      Logger.log({ level: "error", message: error });
      res.status(400).send({
        success: false,
        message: "Une erreur est survenue durant upload.",
        error: error,
      });
    }
  }
);

CustomerRoute.delete(
  "/:id/image",
  Interceptor,
  async (req: Request, res: Response) => {
    try {
      const imageResult = deleteImage(
        String(req.query.imageLink),
        req.params.id
      );
      if ((await imageResult) === false) {
        res
          .status(403)
          .send({ success: false, message: "erreur lors de la suppression" });
      } else {
        res
          .status(200)
          .send({ success: true, message: "succès lors de la suppression" });
      }
    } catch (error: any) {
      Logger.log({ level: "error", message: error });
      res.status(400).send({
        success: false,
        message: "Une erreur est survenue durant la suppression.",
        error: error,
      });
    }
  }
);

const deleteImage = async (imageLink: string, idCustomer: string) => {
  const userDoc = await db.collection("customers").doc(idCustomer).get();
  if (!userDoc.exists) {
    return false;
  } else {
    let custoContent = userDoc.data();
    let tImageLink: String[] = [];
    custoContent.imageLink.forEach((item: string) => {
      tImageLink.push(decodeURIComponent(item));
    });
    const index = tImageLink.indexOf(imageLink);

    if (index > -1) {
      custoContent.imageLink.splice(index, 1);
    }
    let value = imageLink.split(
      "https://storage.googleapis.com/crm-ws.appspot.com/customersPhoto/"
    );
    let value2 = value[1].split("?");

    db.collection("customers").doc(idCustomer).update(custoContent);
    storageRef
      .file("customersPhoto/" + value2[0])
      .delete()
      .then(() => {
        console.log("Successfully deleted photo ");
      })
      .catch((err) => {
        console.log("Failed to remove photo", err);
        return false;
      });
    return true;
  }
};

const uploadImage = (data: string, idClient: string) => {
  return new Promise((resolve) => {
    const buf = Buffer.from(data, "base64");
    const file = storageRef.file(
      "customersPhoto" + "/" + idClient + ";" + uuidv4() + ".png"
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
          file
            .getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            })
            .then(async (signedUrls) => {
              const customerDoc = db.collection("customers").doc(idClient);
              await customerDoc.update({
                imageLink: FieldValue.arrayUnion(signedUrls[0]),
              });
              resolve(signedUrls);
            });
        }
      }
    );
  });
};

const getListImage = async (idCustomer: string) => {
  let imageLink = [];
  const customerDOC = await db.collection("customers").doc(idCustomer).get();
  if (!customerDOC.exists) {
    console.log("erreur: document avec cet ID introuvable!");
    return false;
  } else {
    imageLink = customerDOC.data().imageLink;
    if (imageLink.length === 0) {
      return [];
    } else {
      return imageLink;
    }
  }
};

const testValueInBody = (
  email: string,
  phone: number,
  name: string,
  surname: string
) => {
  if (email === null) {
    return "le champ email est manquant";
  } else if (phone === null) {
    return "le champ phone est manquant";
  } else if (!name) {
    return "le champ name est manquant";
  } else if (!surname) {
    return "le champ surname est manquant";
  } else {
    return true;
  }
};

export = CustomerRoute;
