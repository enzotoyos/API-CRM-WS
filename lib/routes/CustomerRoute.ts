import express from 'express';
import { Router, Request, Response } from 'express';
import { FirebaseApp } from "firebase/app";
import { addDoc, collection, getFirestore } from 'firebase/firestore';

const CustomerRoute = Router();

const db = getFirestore();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 * 
 */
 CustomerRoute.get('/', async (req: Request, res: Response) => {
    try {
        const docRef = await addDoc(collection(db, 'customers'), ({
            email: '',
            phone: '',
            name: '',
            surname: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        }));
        console.log('docRef : ' + docRef.id);
    } catch (error: any) {
        console.log(error);
    }

    let result = { success: true, message: 'Coucou' };
    res.status(200).send(result);
});

export = CustomerRoute;