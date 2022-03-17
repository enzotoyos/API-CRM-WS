import { getFirestore } from "firebase-admin/firestore";
import jwt from "jsonwebtoken";
// import LoggerManager from "../../config/Logger";

const secureKey =
    process.env.SECURE_KEY != undefined
        ? process.env.SECURE_KEY
        : "AZERTYUIOPKEY12345";

const db = getFirestore();
const adminRef = db.collection('admins');
// const Logger = LoggerManager(__filename);

class TokenController {
    
    /**
     * @function createToken
     *
     * @param {string} uid
     */
    async createToken(uid: string) {
        const result: any = {};
        try {
            // Récupération des informations nécessaire
            const adminDoc = adminRef.doc(uid);
            const doc = await adminDoc.get();
            // Création de la date d'expiration
            const dateExpire = new Date();
            //On Ajoute 10 minutes
            dateExpire.setMinutes(dateExpire.getMinutes() + 110);

            //Création du Token
            const jwbToken: string = jwt.sign(
                {
                    admin: {
                        name: doc.data().name,
                        phone: doc.data().phone,
                        email: doc.data().email,
                        emailVerified: doc.data().emailVerified,
                        surname: doc.data().surname,
                        createdAt: doc.data().createdAt
                    },
                    uid: uid,
                    expiresIn: dateExpire.getTime(),
                },
                secureKey
            );

            // Update Subscription pour mettre le token actuel dedans
            result.message = "La connexion à réussi";
            result.expiresIn = dateExpire.toLocaleString("en-GB", { timeZone: "Europe/Paris" });
            result.token = jwbToken;
            result.success = true;
            return result;
        } catch (error: any) {
            // Logger.log({ level: "error", message: error });
            result.success = false;
            result.message = "Echec de la connexion";
            result.error.push({
                code: "ERROR",
                title: "Une erreur est survenue durant la connexion",
                detail: error.message,
            });
            return result;
        }
    }

    /**
     * @function getToken
     * get Token Info
     * @param {string} token
     * @returns tokenDecode
     */
    getToken(token: string): any {
        return jwt.verify(token, secureKey);
    }

    /**
     * @function havePermission
     * @param {string} token
     * @param {Array<String>} listOfAction
     * @returns boolean
     */
    havePermission(token: string, listOfAction: Array<string>) {
        try {
            if (undefined !== token) {
                const tokenDecode: any = jwt.verify(token, secureKey);
                return listOfAction.includes(tokenDecode.code);
            } else {
                return false;
            }
        } catch (error: any) {
            console.log(error);
            return false;
        }
    }

    /**
     * @function makeRandomHash
     * @param length
     * @returns string
     */
    makeRandomHash(length: number): string {
        var result: string = "";
        const characters: string =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength: number = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export = TokenController;
