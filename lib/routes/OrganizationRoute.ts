import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";

const OrganizationRoute = Router();
const db = getFirestore();
const organizationRef = db.collection("organizations");
const adminRef = db.collection("admins");
const tokenCtrl = new TokenController();

/**
 * @api {get} organization/ Get All Organization
 * @apiGroup Organization
 * @apiName getAllOrganization
 * @apiDescription Récupère toutes les organisations
 * @apiPermission Token
 *
 */
OrganizationRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const result: IResult = {
    success: true,
    message: "La récupération des organisations a réussi.",
    record: [],
  };

  try {
    const snapshot = await organizationRef.get();
    snapshot.forEach((doc) => {
      result.record.push(doc.data());
    });
    res.status(200).send(result);
  } catch (error: unknown) {
    res.status(400).send({
      success: false,
      message:
        "Une erreur est survenue durant la récupération d'une organisation.",
      error: error,
    });
  }
});

/**
 * @api {get} organization/:id Get Organization by Id
 * @apiQuery {String} id    Id of the Organization
 * @apiGroup Organization
 * @apiName getOrganizationById
 * @apiDescription Récupère une organisation par son Id
 * @apiPermission Token
 *
 */
OrganizationRoute.get(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const result: IResult = {
      success: true,
      message: "La récupération de l'organisation a réussi.",
    };

    try {
      const orgaRef = organizationRef.doc(req.params.id);
      const doc = await orgaRef.get();
      if (!doc.exists) {
        result.message = "Aucune organisation correspondant";
      } else {
        result.result = doc.data();
      }
      res.status(200).send(result);
    } catch (error: unknown) {
      res.status(400).send({
        success: false,
        message:
          "Une erreur est survenue durant la récupération d'une organisation.",
        error: error,
      });
    }
  }
);

/**
 * @api {post} organization/ Add new Organization
 * @apiGroup Organization
 * @apiName postOrganization
 * @apiDescription Ajoute une organisation
 * @apiPermission Token
 *
 * @apiBody {String} address          Mandatory address of the Organization.
 * @apiBody {String} name           Mandatory  name of the Organization.
 * @apiBody {Array} customers        Mandatory Array of Customers.
 */
OrganizationRoute.post(
  "/",
  Interceptor,
  async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
    const message = testValueInBody(req.body.address, req.body.name);

    if (message === true) {
      try {
        // On crée une organisation
        const newOrga = await organizationRef.add({
          address: req.body.address,
          name: req.body.name,
          NbEmployees: req.body.NbEmployees ? req.body.NbEmployees : "0",
          customers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: tokenDecod.uid,
          logo: [],
        });
        // Puis on l'ajoute dans le tableau de l'admin
        const docAdmin = adminRef.doc(tokenDecod.uid);
        await docAdmin.update({
          organization: FieldValue.arrayUnion(newOrga.id),
        });
        res.status(200).send({
          success: true,
          message: "Organisation Ajoutée",
          record: newOrga.id,
        });
      } catch (error: unknown) {
        res.status(400).send({
          success: false,
          message: "Une erreur est survenue durant l'ajout d'une organisation.",
          error: error,
        });
      }
    } else {
      res.status(403).send({
        success: false,
        message: "Une erreur est survenue durant l'ajout d'une organisation.",
        error: message,
      });
    }
  }
);

/**
 * @api {put} organization/:id Modify an Organization
 * @apiGroup Organization
 * @apiName putOrganization
 * @apiDescription Modifie une organization
 * @apiPermission Token
 *
 * @apiBody {String} address           Mandatory address of the Organization.
 * @apiBody {Array} customers          Mandatory  array of customers of the Organization.
 * @apiBody {String} name              Mandatory name of the Organization.
 * @apiBody {Number} nbworkers         Optional number of workers inside the Organization.
 * @apiBody {String} logo              Optional logo of the Organization.
 */
OrganizationRoute.put(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const orgaRef = organizationRef.doc(String(req.params.id));

    await orgaRef.update({
      address: req.body.address,
      name: req.body.name,
      NbEmployees: req.body.NbEmployees,
      //logo à mettre
      updatedAt: Date.now(),
      createdAt: Date.now(),
    });

    const result = { success: true, message: "putOrganization" };
    res.status(200).send(result);
  }
);

/**
 * @api {delete} organization/:id delete an Organization
 * @apiGroup Organization
 * @apiName deleteOrganization
 * @apiDescription supprime une organisation
 * @apiPermission Token
 */
OrganizationRoute.delete(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    if (req.params.id == null) {
      const result = {
        success: false,
        message: "Suppression impossible. le champ ID est obligatoire",
      };
      res.status(200).send(result);
    } else {
      const orgaList = await db
        .collection("admins")
        .where("organization", "array-contains", req.params.id)
        .get();
      if (orgaList.empty) {
        res.status(403).send({
          sucess: false,
          message: "aucun Admins correspond a cette organisation",
        });
        return;
      } else {
        let idDocument: string;
        let documentAdmins;
        orgaList.forEach((doc) => {
          idDocument = doc.id;
          documentAdmins = doc.data();
        });

        //recupere dans l'array l'endroit ou  l'id est stocké
        const index = documentAdmins.organization.indexOf(req.params.id);
        if (index > -1) {
          documentAdmins.organization.splice(index, 1); // supprime l'id dans le tableau
        }
        //push le json sur firebase dans 'admins'
        db.collection("admins").doc(idDocument).update(documentAdmins);
        //supprime le json dans 'Organisation'
        await organizationRef.doc(String(req.params.id)).delete();

        const result = { success: true, message: "deleteOrganization" };
        res.status(200).send(result);
      }
    }
  }
);

const testValueInBody = (address: string, name: string) => {
  if (address == null) {
    return "le champ address est manquant";
  } else if (name == null) {
    return "le champ name est manquant";
  } else {
    return true;
  }
};

export = OrganizationRoute;
