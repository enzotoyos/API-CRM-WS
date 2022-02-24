import express from 'express';
import http = require('http');
import { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';

// Import dotenv & Logger
dotenv.config();
const app: Application = express();

// Initialisation de Firebase
import * as Firebase from './config/Firebase';
Firebase;

app.use(function (req: any, res, next) {
    // console.log(req.useragent);
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization ");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});

// ------------------------ Récupération des Routes -------------------------
import AdminRoute from './lib/routes/AdminRoute';
import OrganizationRoute from './lib/routes/OrganizationRoute';
// ------------------------ Définition des Routes -------------------------
// Route Principale
app.get('/', (req: Request, res: Response) => {
    res.send('[' + process.env.NODE_ENV + '] - Welcome to CRM-WS API. You can find documentation to : <website>');
});
// Route qui vérifie que l'appli est toujours connecté
app.get('/alive', (req: Request, res: Response) => {
    res.send({ sucess: true });
});
// Définition des routes
app.use('/admin', AdminRoute);
app.use('/organization', OrganizationRoute);

//Démarrage de l'API
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT, () => {
    console.log('INFO - CRM-WS [' + process.env.NODE_ENV + '] - API Started on port : ' + process.env.PORT);
});

export = app;