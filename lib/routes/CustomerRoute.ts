import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";
import UtilsController from "../controller/UtilsController";
import ImageController from "../controller/ImageController";
import CustomerController from "../controller/CustomerController";
import LoggerManager from "../../config/Logger";

const CustomerRoute = Router();
const db = getFirestore();
const customerRef = db.collection("customers");
const orgaRef = db.collection("organizations");
const utils = new UtilsController();
const tokenCtrl = new TokenController();
const imgCtrl = new ImageController();
const adminCtrl = new AdminController();
const custoCtrl = new CustomerController();
const Logger = LoggerManager(__filename);

/**
 * @api {get} customer/ Get All Customer
 * @apiGroup Customer
 * @apiName getAllCustomer
 * @apiDescription Récupère tous les clients d'une organisation si un id d'organisation est renseigné sinon renvoie tous les clients de mon périmètre
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 */
CustomerRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  const result = await custoCtrl.getAllCustomer(tokenDecod.uid, String(req.query.id));
  if (result.success) {
    res.status(200).send(result);
  } else {
    res.status(400).send(result);
  }
});

/**
 * @api {get} customer/:id Get Customer by Id
 * @apiQuery {String} id    Id of the User
 * @apiGroup Customer
 * @apiName getCustomerById
 * @apiDescription Récupère un client par son Id
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 */
CustomerRoute.get("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  const result: IResult = {
    success: true,
    message: "La récupération du client a réussi.",
  };

  try {
    if (await adminCtrl.checkAutorisationCustForAdmin(tokenDecod.uid, req.params.id)) {
      const custoRes = customerRef.doc(req.params.id);
      const doc = await custoRes.get();
      result.result = doc.data();
      result.result.imageLink = doc.data().imageLink;
      res.status(200).send(result);
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
 * @apiHeader {String} Authorization Token 
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
  if (utils.isFill(req.body.email) && utils.isFill(req.body.phone) && utils.isFill(req.body.surname) && utils.isFill(req.body.email)) {
    try {
      const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
      if (adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, req.body.id)) {
        const newCusto = await customerRef.add({
          email: req.body.email,
          phone: req.body.phone,
          name: req.body.name,
          surname: req.body.surname,
          imageLink: [],
          age: (req.body.age) ? req.body.age : "",
          appointement: [],
          createdAt: Date.now(),
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
    } catch (error: any) {
      console.log(error);
      Logger.log({ level: "error", message: error });
      res.status(400).send({
        success: false,
        message: "Une erreur est survenue durant la création de l'utilisateur.",
        error: error,
      });
    }
  } else {
    res.status(403).send({
      success: false,
      error: "Vous devez renseinger tous les champs suivants : Nom / Prénom / Mail / Téléphone",
    });
  }
});

/**
 * @api {delete} customer/:id Delete Customer
 * @apiGroup Customer
 * @apiName DeleteCustomer
 * @apiDescription Supprime un client et tous les Rdv qui lui sont rattachés
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id du client.
 * 
 * @apiSuccess {boolean}  success       vrai pour la réussite de la suppression
 * @apiSuccess {String}   message       message
 */
CustomerRoute.delete("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

  if (utils.isFill(req.params.id)) {
    if (await adminCtrl.checkAutorisationCustForAdmin(tokenDecod.uid, req.params.id)) {
      const isDeleted = await custoCtrl.deleteCusto(req.params.id);
      if (isDeleted) {
        return res.status(200).send({
          sucess: true,
          message: "Le client a bien été supprimé",
        });
      } else {
        return res.status(500).send({
          sucess: false,
          message: "Une erreur est survenue durant la suppression du client",
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
      message: "Suppression impossible. le champ ID du client est obligatoire",
    });
  }
});

/**
 * @api {post} customer/ post Image
 * @api {post} customer/:id/image Add Image to customer
 * @apiGroup Customer
 * @apiName postCustomer
 * @apiName postImageCustomer
 * @apiDescription Ajouter une image pour un client
 * @apiPermission Token
 * @apiBody {String} idCustomer            ID du customer
 * @apiBody {String} image          Image en Base64
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id du customer.
 * @apiBody {String} image                 Image en Base64
 */
CustomerRoute.post("/:id/image", Interceptor, async (req: Request, res: Response) => {
  try {
    imgCtrl.uploadImage(req.body.image, req.params.id, 'customersPhoto/').then(function (result) {
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
 * @api {delete} customer/:id/image Delete Image from customer
 * @apiGroup Customer
 * @apiName deleteImageCustomer
 * @apiDescription Supprime une image d'un client
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiParam {String} id          Obligatoire l'id du customer.
 */
CustomerRoute.delete("/:id/image", Interceptor, async (req: Request, res: Response) => {
  try {
    const imageResult = imgCtrl.deleteImage(String(req.query.imageLink), req.params.id, 'customersPhoto/');
    if ((await imageResult) === false) {
      res.status(403).send({ success: false, message: "erreur lors de la suppression" });
    } else {
      res.status(200).send({ success: true, message: "L'image a bien été supprimé de l'utilisateur : " + req.params.id });
    }
  } catch (error) {
    Logger.log({ level: "error", message: error });
    res.status(400).send({
      success: false,
      message: "Une erreur est survenue durant la suppression.",
      error: error,
    });
  }
});

export = CustomerRoute;
