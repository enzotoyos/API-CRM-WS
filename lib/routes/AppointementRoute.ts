import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";

const AppointementRoute = Router();
const db = getFirestore();
const tokenCtrl = new TokenController();
const appointementRef = db.collection("appointements");
const custoRef = db.collection("customers");

/**
 * @api {get} appointement/ Get All Appointement
 * @apiGroup Appointement
 * @apiName getAllAppointement
 * @apiDescription Récupère tous les rendez-vous
 * @apiPermission Token
 *
 */
AppointementRoute.get("/", Interceptor, async (req: Request, res: Response) => {
  const result: IResult = {
    success: true,
    message: "La récupération des rendez-vous a réussi.",
    record: [],
  };

  try {
    const snapshot = await appointementRef.get();
    snapshot.forEach((doc) => {
      result.record.push(doc.data());
    });
    res.status(200).send(result);
  } catch (error: unknown) {
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
 * @apiQuery {String} id    Id of the Appointement
 * @apiGroup Appointement
 * @apiName getAppointementById
 * @apiDescription Récupère un rendez-vous par son Id
 * @apiPermission Token
 *
 */
AppointementRoute.get(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const result: IResult = {
      success: true,
      message: "La récupération du rendez-vous a réussi.",
    };

    try {
      const appoinRef = appointementRef.doc(req.params.id);
      const doc = await appoinRef.get();
      if (!doc.exists) {
        result.message = "Aucun rendez-vous correspondant";
      } else {
        result.result = doc.data();
      }
      res.status(200).send(result);
    } catch (error: unknown) {
      res.status(400).send({
        success: false,
        message:
          "Une erreur est survenue durant la récupération d'un rendez-vous.",
        error: error,
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
 *
 * @apiBody {String} resume           Mandatory resume of the Appointement.
 * @apiBody {Timestamp} date          Mandatory  date of the Appointement.
 * @apiBody {String} place            Optional place of the Appointement.
 */
AppointementRoute.post(
  "/",
  Interceptor,
  async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

    // vérification du bon format de la date format DD/MM/YYYY HH:MM
    if (regexDate(req.body.date) == false) {
      res.status(403).send({
        sucess: false,
        message:
          "format de la date incorrect. Format accepté  DD/MM/YYYY HH:MM  ",
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

        res.status(200).send({
          success: true,
          message: "Rendez-vous Ajouté",
          record: appaointDoc.id,
        });
      } catch (error: unknown) {
        res.status(400).send({
          success: false,
          message: "Une erreur est survenue durant l'ajout d'un rendez-vous.",
          error: error,
        });
      }
    }
  }
);

/**
 * @api {put} appointement/:id Modify an Appointement
 * @apiGroup Appointement
 * @apiName putAppointement
 * @apiDescription Modifie un rendez-vous
 * @apiPermission Token
 *
 * @apiBody {String} resume           Mandatory resume of the Appointement.
 * @apiBody {Timestamp} date          Mandatory  date of the Appointement.
 * @apiBody {String} place            Optional place of the Appointement.
 */
AppointementRoute.put(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    const appoinRef = appointementRef.doc(String(req.params.id));

    await appoinRef.update({
      resume: req.body.resume,
      date: req.body.date,
      place: req.body.place,
      createdAt: Date.now(),
      createdBy: "",
    });

    const result = { success: true, message: "putAppointement" };
    res.status(200).send(result);
  }
);

/**
 * @api {delete} appointement/:id delete an Appointement
 * @apiGroup Appointement
 * @apiName deleteAppointement
 * @apiDescription supprime un rendez-vous
 * @apiPermission Token
 */
AppointementRoute.delete(
  "/:id",
  Interceptor,
  async (req: Request, res: Response) => {
    await appointementRef.doc(String(req.params.id)).delete();

    const result = { success: true, message: "deleteAppointement" };
    res.status(200).send(result);
  }
);

const regexDate = (date: string) => {
  const regexDate = new RegExp(
    /^([1-9]|([012][0-9])|(3[01]))-([0]{0,1}[1-9]|1[012])-\d\d\d\d [012]{0,1}[0-9]:[0-6][0-9]$/
  );

  const dateRegex = date.match(regexDate);
  if (dateRegex) {
    return false;
  } else {
    return true;
  }
};

export = AppointementRoute;
