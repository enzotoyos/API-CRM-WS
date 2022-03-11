import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import IOrganization from "../interface/IOrganization";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";
import UtilsController from "../controller/UtilsController";
import LoggerManager from "../../config/Logger";

const OrganizationRoute = Router();
const db = getFirestore();
const organizationRef = db.collection("organizations");
const adminRef = db.collection("admins");
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();
const utils = new UtilsController();
const Logger = LoggerManager(__filename);

/**
 * @api {get} organization/ Get All Organization
 * @apiGroup Organization
 * @apiName getAllOrganization
 * @apiDescription Récupère toutes les organisations
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 */
OrganizationRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const result: IResult = {
    success: true,
    message: "La récupération des organisations a réussi.",
    record: [],
  };
  // Get the token of the current admin
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  // Go through the admin collection with the admin token
  const userDoc = db.collection("admins").doc(tokenDecod.uid);
  // Get admin infos
  const doc = await userDoc.get();

  // listOrga contain all organization from the admin token
  const listOrga = doc.data().organization;
  try {
    const snapshot = await organizationRef.get();
    snapshot.forEach((temp) => {
      let Iorga = null;
      if (listOrga && listOrga.length > 0 && listOrga.includes(temp.id)) {
        Iorga = temp.data();
        Iorga.id = temp.id;
        result.record.push(Iorga);
      }
    });

    res.status(200).send(result);
  } catch (error: any) {
    Logger.log({ level: "error", message: error });
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant la récupération des organisations.",
      error: error,
    });
  }
});

/**
 * @api {get} organization/:id Get Organization by Id
 * @apiQuery {String} id    Id of the Organization
 * @apiGroup Organization
 * @apiName getOrganizationById
 * @apiDescription Récupère une organisation via son id
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation.
 *
 */
OrganizationRoute.get("/:id", Interceptor, async (req: Request, res: Response) => {
  const result: IResult = {
    success: true,
    message: "La récupération de l'organisation a réussi.",
    result: undefined
  };
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  

  try {
    if (await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, req.params.id)) {
      const orgaRef = organizationRef.doc(req.params.id);
      const doc = await orgaRef.get();
      if (!doc.exists) {
        result.message = "Aucune organisation correspondante";
      } else {
        result.result = doc.data();
      }
      res.status(200).send(result);
    } else {
      res.status(401).send({
        success: false,
        message:
          "Vous n'avez pas le droit d'accéder à cette ressource."
      });
    }
  } catch (error: any) {
    Logger.log({ level: "error", message: error });
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
 * @apiHeader {String} Authorization Token 
 *
 * @apiBody {String} address          Mandatory address of the Organization.
 * @apiBody {String} name             Mandatory  name of the Organization.
 * @apiBody {number} nbworkers        Optionnal Nombre d'utilisateur (0 par défaut)
 */
OrganizationRoute.post(
  "/",
  Interceptor,
  async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

      
    if (utils.isFill(req.body.address) && utils.isFill(req.body.name)) {
      try {
        // On crée une organisation
        const newOrga = await organizationRef.add({
          address: req.body.address,
          name: req.body.name,
          nbworkers: req.body.nbworkers ? req.body.nbworkers : "0",
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
      } catch (error: any) {
        Logger.log({ level: "error", message: error });
        res.status(400).send({
          success: false,
          message: "Une erreur est survenue durant l'ajout d'une organisation.",
          error: error,
        });
      }
    }else {
      res.status(403).send({
        success: false,
        message: "Une erreur est survenue durant l'ajout d'une organisation.",
        error: "Il manque un des champs obligatoire addresse : " + req.body.address + " ou le nom : " + req.body.name,
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
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation concerné.
 *
 * @apiSuccess {boolean}  success       vrai pour la réussite de la modification
 * @apiSuccess {String}   message       message
 */
OrganizationRoute.put(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
    console.log(req.params.id);
    if (utils.isFill(String(req.params.id))) {
      if (await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, String(req.params.id))) {
        
        const orgaRef = organizationRef.doc(String(req.params.id));
  
        await orgaRef.update({
          address: req.body.address,
          name: req.body.name,
          nbworkers: req.body.nbworkers,
          updatedAt: Date.now()
        });
  
        const result = { success: true, message: "L'organisation' a bien été modifiée." };
        res.status(200).send(result);
      } else {
        res.status(403).send({
          sucess: false,
          message: "Vous n'avez pas le droit d'accéder à cette ressource",
        });
      }
    } else {
      res.status(403).send({
        sucess: false,
        message: "Vous devez renseigner l'id de l'organisation à modifier.",
      });
    }
  }
  );

/**
 * @api {delete} organization/:id Delete Organization
 * @apiGroup Organization
 * @apiName DeleteOrganization
 * @apiDescription Supprime une organisation
 * @apiPermission Token
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation.
 * 
 * @apiSuccess {boolean}  success       vrai pour la réussite de la suppression
 * @apiSuccess {String}   message       message
 */
OrganizationRoute.delete(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
    console.log(req.params.id);
    if (utils.isFill(req.params.id)) {
      if (await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, req.params.id)) {
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
          message: "aucun id correspond a cette organisation",
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

        const result = { success: true, message: "Organisation supprimée" };
        res.status(200).send(result);
      }
    }
  }}
);

export = OrganizationRoute;
