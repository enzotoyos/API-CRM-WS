import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";
import LoggerManager from "../../config/Logger";

const LogRouter = Router();
const db = getFirestore();
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();
const Logger = LoggerManager(__filename);

LogRouter.get("/", Interceptor, async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
    console.log(req.params);
    console.log(req.query);

    const result: IResult = {
        success: true,
        message: "Test Log",
        record: null,
    };

    try {
        console.log('test try catch');
        throw new Error("JE JETTE UNE ERREUR");
    } catch (error: any) {
        Logger.log({level: 'error', message: error});
    }

    // const ea = await adminCtrl.checkAutorisationRdvForAdmin(tokenDecod.uid, String(req.query.id));
    // console.log(ea);
    // result.record = ea;
    res.status(200).send(result);
});

export = LogRouter;