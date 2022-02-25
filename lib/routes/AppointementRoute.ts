import express from 'express';
import { Router, Request, Response } from 'express';
import { DocumentData, getFirestore, Timestamp } from "firebase-admin/firestore";
import IAppointement from "../interface/IAppointement";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";

const AppointementRoute = Router();
const db = getFirestore();
const appointementRef = db.collection('appointements');

/**
 * @api {get} appointement/ Get All Appointement
 * @apiGroup Appointement
 * @apiName getAllAppointement
 * @apiDescription Récupère tous les rendez-vous
 * @apiPermission Token
 *
 */
 AppointementRoute.get("/", Interceptor, async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération des rendez-vous a réussi.", record: [] };

    try {
        const snapshot = await appointementRef.get();
        snapshot.forEach(doc => {
            result.record.push(doc.data());
        });
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'un rendez-vous.', error: error });
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
 AppointementRoute.get("/:id", async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération du rendez-vous a réussi." };

    try {
        const appoinRef = appointementRef.doc(req.params.id);
        const doc = await appoinRef.get();
        if (!doc.exists) {
            console.log('No such document!');
            result.message = 'Aucun rendez-vous correspondant';
        } else {
            result.result = doc.data();
        }
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'un rendez-vous.', error: error });
    }
});

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
 AppointementRoute.post("/", async (req: Request, res: Response) => {
     console.log(req.body)
    try {
        const newAppoin = await appointementRef.add({
            resume: req.body.resume,
            date: req.body.date,
            place : '',
            createdAt: Date.now(),
            createdBy: '',
        });
        console.log("docRef : " + newAppoin.id);
        res.status(200).send({ success: true, message: "Rendez-vous Ajouté" });
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant l\'ajout d\'un rendez-vous.', error: error });
    }
});

AppointementRoute.put('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'putOrganization' };
    res.status(200).send(result);
});

AppointementRoute.delete('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'deleteOrganization' };
    res.status(200).send(result);
});


export = AppointementRoute;