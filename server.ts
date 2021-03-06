import express from "express";
import http = require("http");
import { Application, Request, Response } from "express";
import * as dotenv from "dotenv";

// Import dotenv & Logger
dotenv.config();
const app: Application = express();

import LoggerManager = require("./config/Logger");
const Logger = LoggerManager(__filename);

// Initialisation de Firebase
import * as Firebase from "./config/Firebase";
Firebase;

import bodyParser from "body-parser";

try {
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
  app.use(function (req: any, res, next) {
    Logger.info(`${req.method}:${req.baseUrl}${req.path}`);
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization "
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
  });
} catch (error) {
  console.log(error);
}

// ------------------------ Récupération des Routes -------------------------
import AdminRoute from "./lib/routes/AdminRoute";
import OrganizationRoute from "./lib/routes/OrganizationRoute";
import CustomerRoute from "./lib/routes/CustomerRoute";
import AppointementRoute from "./lib/routes/AppointementRoute";
import LogRouter from "./lib/routes/LogRouter";

// ------------------------ Définition des Routes -------------------------
// Route Principale
app.get("/", (req: Request, res: Response) => {
  res.send("[" + process.env.NODE_ENV + "] - Deploy at (" + new Date().toLocaleString("en-GB", { timeZone: "Europe/Paris" }) + ") - Welcome to CRM-WS API. You can find documentation to : " + process.env.APIDOC);
});
// Route qui vérifie que l'appli est toujours connecté
app.get("/alive", (req: Request, res: Response) => {
  res.send({ sucess: true });
});
// Définition des routes
app.use("/admin", AdminRoute);
app.use("/customer", CustomerRoute);
app.use("/organization", OrganizationRoute);
app.use("/appointement", AppointementRoute);
app.use("/log", LogRouter);

//Démarrage de l'API
const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT, () => {
  Logger.info("INFO - CRM-WS [" + process.env.NODE_ENV + "] - API Started on port : " + process.env.PORT);
});

export = app;
