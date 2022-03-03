import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import MailController from "../controller/MailController";
import admin from "firebase-admin";
import TokenController from "../controller/TokenController";
import { v4 as uuidv4 } from "uuid";

const CustomerRoute = Router();
const db = getFirestore();
const adminRef = db.collection("admins");
const customerRef = db.collection("customers");
const orgaRef = db.collection("organizations");
const mailCtrl = new MailController();
const tokenCtrl = new TokenController();

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
  } catch (error: unknown) {
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
  const result: IResult = {
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
      result.result.imageUrl = await downloadCustomerImage(req.params.id);
    }
    res.status(200).send(result);
  } catch (error: unknown) {
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
      console.log(req.body);
      const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
      const userDoc = adminRef.doc(tokenDecod.uid);

      const doc = await userDoc.get();
      if (!doc.exists) {
        res
          .status(500)
          .send({
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
            age: 0,
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
    } catch (error) {
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
CustomerRoute.post("/upload", async (req: Request, res: Response) => {
  try {
    uploadImage(req.body.image, req.body.idCustomer).then(function (result) {
      res.status(200).send({
        sucess: true,
        message: "Image uploaded",
        Date: Date.now(),
        imageUrl: result[0],
      });
    });
  } catch (error: unknown) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant upload.",
      error: error,
    });
  }
});

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
          console.log("upload OK");

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

const downloadCustomerImage = async (idCustomer: string) => {
  const destFilename = "../../" + idCustomer + ".png";
  const options = {
    destination: destFilename,
  };

  // Downloads the file
  await admin
    .storage()
    .bucket(`crm-ws.appspot.com`)
    .file("customersPhoto/" + idCustomer + ".png")
    .download(options);
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
  } else if (name) {
    return "le champ name est manquant";
  } else if (surname) {
    return "le champ surname est manquant";
  } else {
    return true;
  }
};

export = CustomerRoute;
