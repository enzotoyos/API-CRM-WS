import { Router, Request, Response } from "express";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";

const LogRouter = Router();
const db = getFirestore();
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();

LogRouter.get("/", Interceptor, async (req: Request, res: Response) => {
    const tokenDecod = tokenCtrl.getToken(req.headers.authorization);
    console.log(req.params);
    console.log(req.query);

    const result: IResult = {
        success: true,
        message: "Test Log",
        record: [],
    };

    const ea = await adminCtrl.checkAutorisationOrgaForAdmin(tokenDecod.uid, String(req.query.id));
    console.log(ea);

    res.status(200).send(result);
});

export = LogRouter;