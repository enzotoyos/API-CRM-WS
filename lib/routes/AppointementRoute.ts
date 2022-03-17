import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import UtilsController from "../controller/UtilsController";
import LoggerManager from "../../config/Logger";
import AdminController from "../controller/AdminController";

const Logger = LoggerManager(__filename);
const AppointementRoute = Router();
const db = getFirestore();
const tokenCtrl = new TokenController();
const utils = new UtilsController();
const adminCtrl = new AdminController();
const appointementRef = db.collection("appointements");
const custoRef = db.collection("customers");

/**
 * @api {get} appointement/ Get All Appointement
 * @apiGroup Appointement
 * @apiName getAllAppointement
 * @apiDescription Récupère tous les rendez-vous
 * @apiPermission Token
 * @apiHeader {String} Authorization Token
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {Object}   record        Les informations du rendez-vous. 
 *
 */
AppointementRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const result: IResult = {
    success: true,
    message: "La récupération des rendez-vous a réussi.",
    total: 0,
    record: []
  };

  try {
    const snapshot = await appointementRef.get();
    snapshot.forEach((doc) => {
      result.record.push(doc.data());
    });
    result.total = result.record.length;
    res.status(200).send(result);
  } catch (error: any) {
    Logger.log({ level: "error", message: error });
    res.status(400).send({
      success: false,
      message:
        "Une erreur est survenue durant la récupération d'un rendez-vous.",
      error: error,
    });
  }
});

/**
 * @api {get} appointement/:id Get Appointement by Id
 * @apiGroup Appointement
 * @apiName getAppointementById
 * @apiDescription Récupère un rendez-vous par son Id
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 * @apiQuery {String} id    Obligatoire l'id du rendez-vous.
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 */
AppointementRoute.get("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  const result: IResult = {
    success: true,
    message: "La récupération du rendez-vous a réussi.",
  };

  if (utils.isFill(String(req.query.id))) {
    if (await adminCtrl.checkAutorisationCustForAdmin(tokenDecod.uid, String(req.query.id))) {
      try {
        const doc = await appointementRef.doc().get();
        result.result = doc.data();
        res.status(200).send(result);
      } catch (error: any) {
        Logger.log({ level: "error", message: error });
        res.status(400).send({
          success: false,
          message: "Une erreur est survenue durant la récupération d'un rendez-vous.",
          error: error,
        });
      }
    } else {
      res.status(403).send({
        sucess: false,
        message:
          "Vous n'avez pas le droit d'accéder à cette ressource",
      });
    }
  } else {
    res.status(403).send({
      sucess: false,
      message:
        "Vous devez renseigner toutes les informations suivants : Résumé texte / Date / ID client ",
    });
  }
}
);

/**
 * @api {post} appointement/ Add new Appointement
 * @apiGroup Appointement
 * @apiName postAppointement
 * @apiDescription Ajoute un rendez-vous
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 * @apiBody {String} resume           Obligatoire résumé du Rdv.
 * @apiBody {Timestamp} date          Obligatoire  date du Rdv.
 * @apiBody {String} place            Facultatif lieu du Rdv.
 * @apiBody {String} id               Obligatoire l'id Client
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 * @apiSuccess {Object}   record        L'id du rendez-vous. 
 */
AppointementRoute.post("/", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  if (utils.isFill(req.body.resume) && utils.isFill(req.body.date) && utils.isFill(req.body.id)) {
    if (await adminCtrl.checkAutorisationCustForAdmin(tokenDecod.uid, req.body.id)) {
      // vérification du bon format de la date format DD/MM/YYYY HH:MM
      if (!utils.regexDate(req.body.date)) {
        res.status(403).send({
          sucess: false,
          message: "format de la date incorrect. Format accepté  DD/MM/YYYY HH:MM  ",
        });
      } else {
        try {
          const appaointDoc = await appointementRef.add({
            resume: req.body.resume,
            date: req.body.date,
            place: req.body.place,
            createdAt: Date.now(),
            createdBy: tokenDecod.uid,
          });

          const docCusto = custoRef.doc(req.body.id);
          await docCusto.update({
            appointement: FieldValue.arrayUnion(appaointDoc.id),
          });
          res
            .status(200)
            .send({
              success: true,
              message: "Rendez-vous Ajouté",
              record: appaointDoc.id,
            });
        } catch (error: any) {
          Logger.log({ level: "error", message: error });
          res.status(400).send({
            success: false,
            message: "Une erreur est survenue durant l'ajout d'un rendez-vous.",
            error: error,
          });
        }
      }
    } else {
      res.status(403).send({
        sucess: false,
        message:
          "Vous n'avez pas le droit d'accéder à cette ressource",
      });
    }

  } else {
    res.status(403).send({
      sucess: false,
      message:
        "Vous devez renseigner toutes les informations suivants : Résumé texte / Date / ID client ",
    });
  }
});

/**
 * @api {put} appointement/:id Modify an Appointement
 * @apiGroup Appointement
 * @apiName putAppointement
 * @apiDescription Modifie un rendez-vous
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 * @apiParams {String} id    Id of the Appointement
 * @apiBody {String} resume           Obligatoire résumé du Rdv.
 * @apiBody {Timestamp} date          Obligatoire  date du Rdv.
 * @apiBody {String} place            Facultatif lieu du Rdv.
 * @apiBody {String} id               Obligatoire l'id Client.
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 */
AppointementRoute.put("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

  console.log("putAppointement " + req.params.id);

  if (utils.isFill(String(req.query.id))) {
    if (await adminCtrl.checkAutorisationRdvForAdmin(tokenDecod.uid, String(req.query.id))) {
      const appoinRef = appointementRef.doc(String(req.query.id));

      await appoinRef.update({
        resume: req.body.resume,
        date: req.body.date,
        place: req.body.place,
        updatedAt: Date.now()
      });

      const result = { success: true, message: "Le rendez-vous a bien été modifié." };
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
      message: "Vous devez renseigner l'id du Rdv a modifier.",
    });
  }
}
);

/**
 * @api {delete} appointement/:id delete an Appointement
 * @apiGroup Appointement
 * @apiName deleteAppointement
 * @apiDescription supprime un rendez-vous
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 * 
 * @apiBody {String} id     Obligatoire l'id Client.
 * 
 * @apiSuccess {boolean}  success       Vrai pour la réussite de la récupération.
 * @apiSuccess {String}   message       Message.
 */
AppointementRoute.delete("/:id", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
  if (utils.isFill(req.params.id)) {
    if (await adminCtrl.checkAutorisationRdvForAdmin(tokenDecod.uid, req.body.id)) {
      await appointementRef.doc(String(req.params.id)).delete();

      res.status(200).send({ success: true, message: "La suppression du Rdv : " + req.params.id + " a réussi." });
    } else {
      res.status(403).send({
        sucess: false,
        message: "Vous n'avez pas le droit d'accéder à cette ressource",
      });
    }
  } else {
    res.status(403).send({
      sucess: false,
      message: "Vous devez renseigner l'id du Rdv a supprimer.",
    });
  }
}
);

export = AppointementRoute;
