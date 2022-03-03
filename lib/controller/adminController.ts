import { IncomingMessage } from 'http';
import https from 'https';
import {
    DocumentData,
    FieldValue,
    getFirestore,
} from "firebase-admin/firestore";
import IResult from "../interface/IResult";

const db = getFirestore();
const adminRef = db.collection("admins");
const orgaRef = db.collection("organizations");

class AdminController {

    /**
     * checkAutorisationOrgaForAdmin
     * 
     * @param idAdmin uid from token
     * @param idOrganization id Orga
     * @returns Promise<boolean>
     */
    async checkAutorisationOrgaForAdmin(idAdmin: string, idOrganization: string): Promise<boolean> {
        let result: boolean = false;
        const docUser = adminRef.doc(idAdmin);
        const doc = await docUser.get();

        if (!doc.exists) {
            return result;
        } else {
            const isOrga = doc.data().organization.includes(idOrganization);
            return isOrga;
        }
    };

    /**
     * checkAutorisationCustForAdmin
     * 
     * UIDadmin -> Récupération des organisations 
     * 
     * @param idAdmin 
     * @param idOrganization 
     * @returns 
     */
    async checkAutorisationCustForAdmin(idAdmin: string, idCustomer: string): Promise<boolean> {
        let result = false;

        const docUser = adminRef.doc(idAdmin);
        const doc = await docUser.get();
        const listIdOrga: String[] = doc.data().organization;

        for (let index in listIdOrga) {
            const docOrga = orgaRef.doc(String(listIdOrga[index]));
            const doc = await docOrga.get();
            if (doc.data().customer && doc.data().customer.length > 0) {
                result = doc.data().customer.includes(idCustomer);
            }

            if (result) {
                break;
            }
        }

        return result;
    }

    /**
     * checkAutorisationRdvForAdmin
     * 
     * UIDadmin -> Récupération des organisations 
     * 
     * @param idAdmin 
     * @param idRdv
     * @returns 
     */
    async checkAutorisationRdvForAdmin(idAdmin: string, idRdv: string): Promise<boolean> {
        let result = false;

        return result;
    }

    /**
     * login
     * 
     * https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-email-password
     * 
     * @param email 
     * @param password 
     * @return object 
     */
    async login(email: string, password: string): Promise<IResult> {
        let result: IResult = { success: false, record: {} };
        const API_KEY = process.env.API_KEY;
        const body = JSON.stringify({
            password: password,
            email: email,
            returnSecureToken: true
        });
        const options = {
            hostname: 'identitytoolkit.googleapis.com',
            port: 443,
            path: '/v1/accounts:signInWithPassword?key=' + API_KEY,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }

        try {
            const record = await this.wrapedSendRequest(options, body);
            if (record.statusCode && record.statusCode === 200) {
                result.success = true;
                result.record = record;
                return result;
            } else {
                result.success = false;
                result.error = record;
                return result;
            }
        } catch (error) {
            console.log(error);
            result.success = false;
            result.error = error;
            return result;
        }
    }

    /**
     * wrapedSendRequest
     * Permet de rendre la fonction https request async
     * 
     * @param options 
     * @param body 
     * @returns Promise<any>
     */
    async wrapedSendRequest(options, body): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res: IncomingMessage) => {
                console.log(`statusCode: ${res.statusCode}`);
                res.setEncoding('utf8');
                let data = '';
                res.on('data', (d) => {
                    data += d;
                });
                res.on('end', () => {
                    let result = JSON.parse(data);
                    result['statusCode'] = res.statusCode;
                    resolve(result);
                });
            }).on("error", (err) => {
                reject(err);
            }).write(body);
        });
    }
}



export = AdminController;