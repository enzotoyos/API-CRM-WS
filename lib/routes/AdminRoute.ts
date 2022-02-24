import express from 'express';
import { Router, Request, Response } from 'express';

const AdminRoute = Router();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 * 
 */
AdminRoute.get('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'Coucou' };
    res.status(200).send(result);
});

export = AdminRoute;