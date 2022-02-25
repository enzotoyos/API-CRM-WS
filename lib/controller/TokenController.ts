import { getFirestore } from 'firebase-admin/firestore';
import jwt from 'jsonwebtoken';

const secureKey = (process.env.SECURE_KEY != undefined) ? process.env.SECURE_KEY : 'AZERTYUIOPKEY12345';

const db = getFirestore();

class TokenController {

    /**
     * @function createToken
     * 
     * @param {string} uid 
     */
    async createToken(uid: string): Promise<{
        success: boolean;
        message: any;
        error: any[];
        expiresIn: any;
        result: any;
    }> {
        let result: any = {};

        try {
            // Récupération des informations nécessaire
            const docRef = doc(db, "admins", uid);
            const docSnap = await getDoc(docRef);
            console.log(docSnap.data());

            // Création de la date d'expiration
            const dateExpire = new Date();
            //On Ajoute 1h
            dateExpire.setHours(dateExpire.getHours() + 1);
            //Création du Token
            const jwbToken: string = jwt.sign({
                admin: docSnap.data(),
                uid: uid,
                expiresIn: dateExpire
            }, secureKey);

            // Update Subscription pour mettre le token actuel dedans
            result.message = 'La connexion à réussi';
            result.expiresIn = dateExpire.toLocaleString('en-GB', { timeZone: 'Europe/Paris' });
            result.result = jwbToken;
            result.success = true;
            return result;
        } catch (error: any) {
            console.log(error);
            result.success = false;
            result.message = 'Echec de la connexion';
            result.error.push({
                code: 'ERROR',
                title: 'Une erreur est survenue durant la connexion',
                detail: error.message
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
    havePermission(token: string, listOfAction: Array<String>) {
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
        var result: string = '';
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength: number = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

export = TokenController;