import { IncomingMessage } from 'http';
import https from 'https';
import IResult from "../interface/IResult";

class AdminController {

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