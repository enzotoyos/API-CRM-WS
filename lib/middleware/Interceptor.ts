import * as express from 'express';


function TokenInterceptor(request: express.Request, response: express.Response, next: express.NextFunction) {
    console.log(`${request.method}:${request.path} | Body : ${JSON.stringify(request.body)} Params : ${JSON.stringify(request.query)}  Token defined : ${request.headers.authorization !== undefined}`);
    try {
        const tokenHeader: string = request.headers.authorization;
        //Si authorization est indéfinit cela fait planter l'API pour rien
        if (tokenHeader) {
            // const tokenDecode: any = jwt.verify(tokenHeader, secureKey);

            // if (new Date(tokenDecode.expiresIn).toString() === 'Invalid Date') {
            //     throw new Error("Date invalide : " + tokenDecode.expiresIn);
            // }
            // if (tokenDecode.expiresIn > new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris' })) {
            //     //Token en cours de validité
            //     next();
            // } else {
            //     //Si le Token n'est plus valide on Throw une erreur pour activer le catch
            //     throw new Error("Votre jeton à expiré : " + tokenDecode.expiresIn);
            // }
        } else {
            throw new Error('Votre jeton n\'est pas définit. Vous devez vous connecter.');
        }
    } catch (error: any) {
        console.error(error);
        response.status(401).json({
            success: false,
            message: "Problème d'authentification.",
            error: [{
                code: "MIDDLEWARE",
                title: "Problème d'authentification.",
                detail: error.message
            }]
        });
    }
}

export = TokenInterceptor;