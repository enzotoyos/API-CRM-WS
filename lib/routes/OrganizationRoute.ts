import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";
import UtilsController from "../controller/UtilsController";
import ImageController from "../controller/ImageController";
import OrganizationController from "../controller/OrganizationController";
import LoggerManager from "../../config/Logger";

const OrganizationRoute = Router();
const db = getFirestore();
const organizationRef = db.collection("organizations");
const adminRef = db.collection("admins");
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();
const orgaCtrl = new OrganizationController();
const imgCtrl = new ImageController();
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
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {String}   record        Id de l'organisation qui viens d'être créé.
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
    result.total = result.record.length;
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
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {String}   result        Résultat.
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
      message: "Une erreur est survenue durant la récupération d'une organisation.",
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
 * @apiBody {String} address          (Obligatoire) address of the Organization. (Tout est autorisé)
 * @apiBody {String} name             (Obligatoire) name of the Organization. (Lettres seulement, pas d'espace)
 * @apiBody {number} nbworkers        (Optionnel) Nombre d'utilisateur (0 par défaut) (Chiffres seulement)
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {String}   record        Résultat.
 */

OrganizationRoute.post("/", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  if (utils.isFill(req.body.address) && utils.isFill(req.body.name)) {
    const regWorkers = (req.body.nbworkers) ? utils.regexNumber(req.body.nbworkers) : true;
    if (utils.regexString(req.body.name) && regWorkers) {
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
          message: "Une erreur est survenue durant l'ajout de l'organisation.",
          error: error,
        });
      }
    } else {
      res.status(403).send({
        sucess: false,
        message: "L'une des valeur suivante n'est pas au format attendu : " +
          "Mail format : [a-z0-9]+@[a-z0-9]+\.[a-z]{2,4} "
          + "Nom : [a-zA-Z] "
          + "Si renseigné Nombre de travailleur : [0-9]"
      });
    }
  } else {
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
OrganizationRoute.put("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

  if (utils.isFill(String(req.params.id))) {
    if (await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, String(req.params.id))) {
      const orgaRef = organizationRef.doc(String(req.params.id));
      req.body.updatedAt = Date.now();
      await orgaRef.update(req.body);

      res.status(200).send({ success: true, message: "L'organisation a bien été modifiée." });
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
 * @apiDescription Supprime une organisation et tous les clients (avec leurs Rdv) qui sont rattaché a l'organisation.
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation.
 * 
 * @apiSuccess {boolean}  success       vrai pour la réussite de la suppression
 * @apiSuccess {String}   message       message
 */
OrganizationRoute.delete("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

  if (utils.isFill(req.params.id)) {
    if (await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, req.params.id)) {
      const isDeleted = await orgaCtrl.deleteOrga(String(req.params.id), tokenDecod.uid);
      if (isDeleted) {
        return res.status(200).send({
          sucess: true,
          message: "L'organisation a bien été supprimé",
        });
      } else {
        return res.status(500).send({
          sucess: false,
          message: "Une erreur est survenue durant la suppression de l'organisation",
        });
      }
    } else {
      res.status(403).send({
        sucess: false,
        message: "Vous n'avez pas le droit d'accéder à cette ressource",
      });
    }
  } else {
    res.status(403).send({
      success: false,
      message: "Suppression impossible. le champ ID de l'organisation est obligatoire",
    });
  }
});

/**
 * @api {post} organization/ post Image
 * @api {post} organization/:id/image Add Logo to organization
 * @apiGroup Organization
 * @apiName postImageOrganization
 * @apiDescription Ajouter un logo pour une organisation
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation.
 * @apiBody {String} image        Logo en Base64
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de l'ajout du logo.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {String}   Date          Date de création.
 * @apiSuccess {String}   ImageUrl      Url de l'image.
 */
 OrganizationRoute.post("/:id/image", Interceptor, async (req: Request, res: Response) => {
  try {
    imgCtrl.uploadImage(req.body.image, req.params.id, 'organizationPhoto/').then(function (result) {
      res.status(200).send({
        sucess: true,
        message: "Image uploaded",
        Date: new Date().toLocaleString("en-GB", { timeZone: "Europe/Paris" }),
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

/**
 * @api {delete} organization/:id/image Delete Logo from organization
 * @apiGroup Organization
 * @apiName deleteImageOrganization
 * @apiDescription Supprime un logo d'une organisation
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id de l'organisation.
 * @apiQuery {String} imageLink   Obligatoire lien de l'image a supprimer
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la création.
 * @apiSuccess {String}   message       Message.
 */
 OrganizationRoute.delete("/:id/image", Interceptor, async (req: Request, res: Response) => {
  try {
    const imageResult = imgCtrl.deleteImage(String(req.query.imageLink), req.params.id, 'organizationPhoto/');
    if ((await imageResult) === false) {
      res.status(403).send({ success: false, message: "erreur lors de la suppression" });
    } else {
      res.status(200).send({ success: true, message: "L'image a bien été supprimé de l'organisation : " + req.params.id });
    }
  } catch (error) {
    console.log(error);
    
    Logger.log({ level: "error", message: error });
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant la suppression.",
      error: error,
    });
  }
});

export = OrganizationRoute;
