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
     * @param idCustomer 
     * @param idOrganization 
     * @returns 
     */
    async checkAutorisationCustForAdmin(idCustomer: string, idOrganization: string) {
        //Création des requètes
        var idOrga: string;
        var idClient: string;
        const userDoc = db.collection("organizations");
        const snapshot = await userDoc.where("customer", "in", [[idCustomer]]).get();
        if (snapshot.empty) {
            console.log("No matching documents.");
            return false;
        } else {
            snapshot.forEach((doc) => {
                idOrga = doc.id;
                console.log(idOrga);
            });

            const adminDoc = db.collection("admins");
            const docAdmin = await adminDoc
                .where("organization", "in", [[idOrga]])
                .get();
            if (docAdmin.empty) {
                console.log("No matching documents. 2");
                return false;
            } else {
                snapshot.forEach((doc) => {
                    idClient = doc.id;
                    console.log(idClient);
                });
            }
            if (idOrga == idClient) {
                return true;
            } else {
                return false;
            }
        }
    };

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