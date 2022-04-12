import { Router, Request, Response } from "express";
import Interceptor from "../middleware/Interceptor";
import LoggerManager from "../../config/Logger";
import * as path from 'path';
import fs = require('fs');

const LogRouter = Router();
const Logger = LoggerManager(__filename);

/**
 * @api {get} log/ Get Log by type
 * @apiQuery {String} type    Type of Log (default / error)
 * @apiGroup Log
 * @apiName getLog
 * @apiDescription Récupère le contenu d'un fichier de log
 * @apiPermission Token
 * @apiHeader {String} Authorization Token 
 *
 */
LogRouter.get("/", Interceptor, async (req: Request, res: Response) => {
  const pathToDefault = path.resolve('./') + path.join('/', 'Log', 'default.log');
  const pathToError = path.resolve('./') + path.join('/', 'Log', 'error.log');
  // le répertoite log n'est pas créé apr défaut ?
  try {
    const defaultLog: string = fs.readFileSync(pathToDefault, { encoding: 'utf8', flag: 'r' });
    const defaultError: string = fs.readFileSync(pathToError, { encoding: 'utf8', flag: 'r' });

    res.status(200).send((req.query.type === 'error') ? defaultError : defaultLog);
  } catch (error) {
    Logger.log({ level: "error", message: error });
    res.status(500).send({ success: false, message: 'Une erreur est survenue durant la récupération du fichier : ' + req.query.type });
  }
});

export = LogRouter;
