import express from 'express';
import { Router, Request, Response } from 'express';

const OrganizationRoute = Router();

/**
 * @api {get} admin/ Get Admin
 * @apiGroup Admin
 * @apiName getAdmin
 * @apiDescription Get Admin
 * @apiPermission Token
 * 
 */
OrganizationRoute.get('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'getOrganization' };
    res.status(200).send(result);
});

OrganizationRoute.post('/', async (req: Request, res: Response) => {
    let result = { success: true, message: 'postOrganization' };
    res.status(200).send(result);
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