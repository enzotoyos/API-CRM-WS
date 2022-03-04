import { Router, Request, Response } from "express";
import IResult from "../interface/IResult";
import Interceptor from "../middleware/Interceptor";
import TokenController from "../controller/TokenController";
import AdminController from "../controller/AdminController";

const LogRouter = Router();
const tokenCtrl = new TokenController();
const adminCtrl = new AdminController();

LogRouter.get("/", Interceptor, async (req: Request, res: Response) => {
  const tokenDecod = tokenCtrl.getToken(req.headers.authorization);

  const result: IResult = {
    success: true,
    message: "Test Log",
    record: null,
  };

  const ea = await adminCtrl.checkAutorisationCustForAdmin(
    tokenDecod.uid,
    String(req.query.id)
  );
  result.record = ea;
  res.status(200).send(result);
});

export = LogRouter;
