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
 * @api {get} organization/ Get Organization
 * @apiGroup organization
 * @apiName getOrganization
 * @apiDescription Get Organization
 * @apiPermission Token
 * 
 */
 OrganizationRoute.get("/", Interceptor, async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération des organisation a réussi.", record: [] };

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
 * @api {get} admin/:id Get Customer by Id
 * @apiGroup Admin
 * @apiName getCustomerById
 * @apiDescription Get Customer
 * @apiPermission Token
 *
 */

 OrganizationRoute.get("/:id", async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération d\'une organisation a réussi." };

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

OrganizationRoute.post('/', Interceptor, async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La création d\'une organisation a réussi.", record: [] };

    try {

        const monDoc = await db.collection('organizations').add({
            address: 'rue de narvik',
            createdAt: '',
            customers: [],
            name:'Ynov',
            updatedAt : Date.now()
          });
          
         

        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la création d\'une organisation.', error: error });
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