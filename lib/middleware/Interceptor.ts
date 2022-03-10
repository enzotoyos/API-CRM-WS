import * as express from "express";
import jwt from "jsonwebtoken";
import LoggerManager = require("../../config/Logger");
const Logger = LoggerManager(__filename);

const secureKey =
  process.env.SECURE_KEY != undefined
    ? process.env.SECURE_KEY
    : "AZERTYUIOPKEY12345";

function TokenInterceptor(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  try {
    const tokenHeader: string = request.headers.authorization;
    //Si authorization est indéfinit cela fait planter l'API pour rien
    if (tokenHeader) {
      const tokenDecode: any = jwt.verify(tokenHeader, secureKey);
      Logger.info(
        `${request.method}:${request.baseUrl}${request.path} UID : ${tokenDecode.uid}
        Body : ${JSON.stringify(request.body)}
        Query : ${JSON.stringify(request.query)}
        Param : ${JSON.stringify(request.params)}`
      );
      if (new Date(tokenDecode.expiresIn).getTime() > new Date().getTime()) {
        //Token en cours de validité
        next();
      } else {
        //Si le Token n'est plus valide on Throw une erreur pour activer le catch
        throw new Error("User : " + tokenDecode.uid + " votre jeton à expiré à " + new Date(tokenDecode.expiresIn).toLocaleString("en-GB", { timeZone: "Europe/Paris" }));
      }
    } else {
      throw new Error("Votre jeton n'est pas définit. Vous devez vous connecter.");
    }
  } catch (error: any) {
    Logger.log({ level: "error", message: error });
    response.status(401).json({
      success: false,
      message: "Problème d'authentification.",
      error: [
        {
          code: "MIDDLEWARE",
          title: error.message,
          detail: error.detail        },
      ],
    });
  }
}

export = TokenInterceptor;
