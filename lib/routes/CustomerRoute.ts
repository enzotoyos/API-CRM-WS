import express from "express";
import { Router, Request, Response } from "express";
import { DocumentData, getFirestore } from "firebase-admin/firestore";
import ICustomer from "../interface/ICustomer";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";

const CustomerRoute = Router();
const db = getFirestore();
const customerRef = db.collection('customers');

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 *
 */
CustomerRoute.get("/", Interceptor, async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération des clients a réussi.", record: [] };

    try {
        const snapshot = await customerRef.get();
        snapshot.forEach(doc => {
            result.record.push(doc.data());
        });
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'un client.', error: error });
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
CustomerRoute.get("/:id", async (req: Request, res: Response) => {
    let result: IResult = { success: true, message: "La récupération du client a réussi." };

    try {
        const custoRef = customerRef.doc(req.params.id);
        const doc = await custoRef.get();
        if (!doc.exists) {
            console.log('No such document!');
            result.message = 'Aucun client correspondant';
        } else {
            result.result = doc.data();
        }
        res.status(200).send(result);
    } catch (error: any) {
        console.log(error);
        res.status(400).send({ success: false, message: 'Une erreur est survenue durant la récupération d\'un client.', error: error });
    }
});

CustomerRoute.post("/", async (req: Request, res: Response) => {
    //   try {
    //     const docRef = await addDoc(collection(db, "admins"), {
    //       email: req.body.email,
    //       phone: req.body.phone,
    //       name: req.body.name,
    //       surname: req.body.surname,
    //       createdAt: Date.now(),
    //       updatedAt: Date.now(),
    //       organization: [],
    //     });
    //     console.log("docRef : " + docRef.id);
    //     let result = { success: true, message: "Utilisateur Ajouté" };
    //     res.status(200).send(result);
    //   } catch (error: any) {
    //     console.log(error);
    //   }
});

export = CustomerRoute;
