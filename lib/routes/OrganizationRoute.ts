import express from 'express';
import { Router, Request, Response } from 'express';
import { DocumentData, getFirestore, Timestamp } from "firebase-admin/firestore";
import IOrganization from "../interface/IOrganization";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";

const OrganizationRoute = Router();
const db = getFirestore();
const organizationRef = db.collection('organizations');

/**
 * @api {get} organization/ Get All Organization
 * @apiGroup Organization
 * @apiName getAllOrganization
 * @apiDescription Récupère toutes les organisations
 * @apiPermission Token
 *
 */
 OrganizationRoute.get("/", Interceptor, async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération des organisations a réussi.", record: [] };

    try {
        const snapshot = await organizationRef.get();
        snapshot.forEach(doc => {
            result.record.push(doc.data());
        });
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'une organisation.', error: error });
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
 OrganizationRoute.get("/:id", async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération de l\'organisation a réussi." };

    try {
        const orgaRef = organizationRef.doc(req.params.id);
        const doc = await orgaRef.get();
        if (!doc.exists) {
            console.log('No such document!');
            result.message = 'Aucune organisation correspondante';
        } else {
            result.result = doc.data();
        }
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'une organisation.', error: error });
    }
});

/**
 * @api {post} organization/ Add new Organization
 * @apiGroup Organization
 * @apiName postOrganization
 * @apiDescription Ajoute une organisation
 * @apiPermission Token
 *
 * @apiBody {String} address          Mandatory address of the Organization.
 * @apiBody {String} name             Mandatory  name of the Organization.
 * @apiBody {Array} customers         Mandatory Array of Customers.
 * @apiBody {Number} nbworkers        Optional Number of workers.
 * @apiBody {String} logo             Optional base64 logo.
 */
 OrganizationRoute.post("/", async (req: Request, res: Response) => {
     console.log(req.body)
    try {
        const newOrga = await organizationRef.add({
            address: req.body.address,
            name: req.body.name,
            customers: [],
            nbworkers : 0,
            logo: '',
            createdAt: Date.now(),
            createdBy: '',
        });
        console.log("docRef : " + newOrga.id);
        res.status(200).send({ success: true, message: "Organisation Ajoutée" });
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant l\'ajout d\'une organisation.', error: error });
    }
});

OrganizationRoute.put('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'putOrganization' };
    res.status(200).send(result);
});

OrganizationRoute.delete('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'deleteOrganization' };
    res.status(200).send(result);
});


export = OrganizationRoute;