import { Router, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";
import MailController from "../controller/MailController";
import UtilsController from "../controller/UtilsController";
import LoggerManager = require("../../config/Logger");

const db = getFirestore();
const AdminRoute = Router();
const AuthCtrl = new AdminController();
const mailCtrl = new MailController();
const tokenCtrl = new TokenController();
const utils = new UtilsController();
const adminRef = db.collection("admins");
const Logger = LoggerManager(__filename);

/**
 * @apiDefine AdminGroup Admin
 *
 * ### Création d'un utilisateur
 * Pour avoir le droit de créer un utilisateur, il faut être authentifié en tant qu'administrateur et avoir un Token. 
 * 
 * > Si c'est la première création, il y a un Administrateur créé par défaut. Voir le README pour les informations d'identifications.
 * 
 * ### Login
 * Pour s'authentifier en tant qu'Administrateur il faut utiliser une adresse e-mail et une clé d'api qui est donnée lors de la création de celui-ci.
 */

/**
 * @api {post} admin/login Login Admin
 * @apiGroup AdminGroup
 * @apiName LoginAdmin
 * @apiDescription Route permettant d'authentifier en tant qu'administrateur.
 *
 * @apiBody {String} email      Obligatoire Admin Email.
 * @apiBody {String} api_key    Obligatoire Admin Api Key.
 * 
 * @apiSuccess {boolean}  success     Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message     Message.
 * @apiSuccess {Object}   record      Les informations de l'administrateur.
 * @apiSuccess {Number}   expiresIn   Date et heure d'expiration du token.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "exemple.mail@mail.com",
 *       "api_key": "MyUniqueAPIKEY"
 *     }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "La connexion à réussi",
 *       "expiresIn": "10/03/2022, 10:35:17",
 *       "token": "TemporaryTokenGenerateToAccessRouter",
 *       "success": true
 *      }
 */
AdminRoute.post("/login", async (req: Request, res: Response) => {
  if (req.body.email && req.body.api_key) {
    let record = await AuthCtrl.login(req.body.email, req.body.api_key);

    if (record.success) {
      record = await tokenCtrl.createToken(record.record.localId);
      res.status(200).send(record);
    } else {
      res.status(500).send(record);
    }
  } else {
    res.status(500).send({ sucess: false, message: "Vous devez saisir vos identifiants." });
  }
});

/**
 * @api {get} admin/info Get Admin Info
 * @apiGroup AdminGroup
 * @apiName getAdminInfo
 * @apiDescription Récupère les informations d'un admin via le token
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiSuccess {boolean}  success       vrai pour la réussite de la récupération
 * @apiSuccess {String}   message       message
 * @apiSuccess {Object}   record        les informations de l'admin
 * 
 */
AdminRoute.get("/info", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  const userDoc = adminRef.doc(tokenDecod.uid);
  const doc = await userDoc.get();
  if (!doc.exists) {
    res.status(403).send({
      success: false,
      message: "Aucun administrateur ne correspond à cet ID ",
    });
  } else {
    res.status(200).send({ sucess: true, message: 'La récupération des informations de l\'administrateur a réussi.', record: doc.data() });
  }
});

/**
 * @api {get} admin/ Get All Admin
 * @apiGroup AdminGroup
 * @apiName getAllAdmin
 * @apiDescription Récupère tous les administrateurs qui sont créé.
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {Object[]} record        Les informations des administrateurs.
 * @apiSuccess {Number}   total         Total des administrateurs.
 */
AdminRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const result = {
    success: true,
    message: 'La récupération de tous les administrateurs a réussi',
    total: 0,
    record: []
  };

  try {
    const snapshot = await adminRef.get();
    snapshot.forEach((temp) => {
      const aAdmin = temp.data();
      aAdmin.id = temp.id;
      result.record.push(aAdmin);
    });
    result.total = result.record.length;
    res.status(200).send(result);
  } catch (error) {
    Logger.log({ level: 'error', message: error });
    res.status(500).send({
      success: false,
      message: "Une erreur est survenue durant la récupération des administrateurs",
      error: error.message
    });
  }
});

/**
 * @api {post} admin/ Post Admin
 * @apiGroup AdminGroup
 * @apiName postAdmin
 * @apiDescription Ajoute un administrateur et créé une api_key
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 * @apiBody {String} email              Obligatoire Admin Email.
 * @apiBody {String} name               Obligatoire Admin Name.
 * @apiBody {String} surname            Obligatoire Admin Lastname.
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la création.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {String}   record        Id de l'administrateur qui viens d'être créé.
 * @apiSuccess {String}   api_key       API_KEY de l'administrateur qui permet de s'authentifier. A NE PAS PERDRE.
 */
AdminRoute.post("/", Interceptor, async (req: Request, res: Response) => {
  const api_key = tokenCtrl.makeRandomHash(20);

  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  try {
    const record = [];
    const snapshot = await adminRef
      .where("createdBy", "==", String(tokenDecod.uid))
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        record.push(doc.data());
      });
    }

    let isSpam = false;
    if (record.length > 0) {
      const dateExpire = new Date(record[0].createdAt);
      dateExpire.setMinutes(dateExpire.getMinutes() + 1);
      isSpam = dateExpire.getTime() > new Date().getTime();
    }

    // isSpam = false we can create Admin
    if (!isSpam) {
      if (utils.isFill(req.body.email) && utils.isFill(req.body.name) && utils.isFill(req.body.surname)) {
        if (utils.regexString(req.body.name) && utils.regexString(req.body.surname) && utils.regexMail(req.body.email)) {
          const userRecord = await getAuth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: api_key,
            displayName: req.body.name,
            disabled: false,
          });
          const sLink = await getAuth().generateEmailVerificationLink(
            req.body.email
          );
          mailCtrl.sendInitPwd(
            req.body.name + " " + req.body.surname,
            req.body.email,
            sLink
          );

          adminRef.doc(userRecord.uid).set({
            email: req.body.email,
            api_key: api_key,
            name: req.body.name,
            surname: req.body.surname,
            organization: [],
            createdAt: Date.now(),
            createdBy: tokenDecod.uid,
          });

          res.status(200).send({
            success: true,
            message:
              "L'administrateur a bien été ajouté. Un email de validation a été envoyé.",
            record: userRecord.uid,
            api_key: api_key,
          });
        } else {
          res.status(403).send({
            sucess: false,
            message: "L'une des valeur suivante n'est pas au format attendu : " +
              "Mail format : [a-z0-9]+@[a-z0-9]+\.[a-z]{2,4} "
              + "Nom & Prénom : [a-zA-Z] "
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Vous devez renseigner tous les champs suivants : email / nom / prénom",
        });
      }
    } else {
      res.status(403).send({
        success: false,
        message: "Vous devez attendre 1 minute pour créer un autre admin.",
      });
    }
  } catch (error) {
    Logger.log({ level: 'error', message: error });
    res.status(403).send({ success: false, message: error.message });
  }
});

/**
 * @api {put} admin/:id Put Admin
 * @apiGroup AdminGroup
 * @apiName getAdmin
 * @apiDescription Met a jours les informations d'un administrateur
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * @apiParam {String} id          Obligatoire l'id de l'administrateur.
 *
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la modification.
 * @apiSuccess {String}   message       Message.
 */
AdminRoute.put("/:id", Interceptor, async (req: Request, res: Response) => {
  const admRef = adminRef.doc(String(req.params.id));

  try {
    await admRef.update({
      name: req.body.name,
      surname: req.body.surname,
      updatedAt: Date.now(),

    });

    res.status(200).send({ success: true, message: "L'administrateur a bien été modifié" });
  } catch (error) {
    Logger.log({ level: 'error', message: error });
    res.status(500).send({ success: false, message: "Une erreur est survenue durant la modification de l'administrateur." });
  }
});

/**
 * @api {delete} admin/:id Delete Admin
 * @apiGroup AdminGroup
 * @apiName DeleteAdmin
 * @apiDescription supprime un Admin via son id
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * @apiParam {String} id          Obligatoire l'id de l'admin.
 *
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la suppression.
 * @apiSuccess {String}   message       Message.
 */
AdminRoute.delete("/:id", Interceptor, async (req: Request, res: Response) => {
  const id: string = req.params.id;

  if (req.params.id)
    try {
      getAuth().deleteUser(id);
      await db.collection("admins").doc(id).delete();
      res.status(200).send({ success: true, message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      Logger.log({ level: 'error', message: error });
      res.status(403).send({ success: false, message: "erreur lors de la suppression" });
    }
  else {
    res.status(403).send({ success: false, message: "erreur aucun ID entrez en paramètre" });
  }
});

export = AdminRoute;
