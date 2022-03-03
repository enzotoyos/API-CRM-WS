require("dotenv").config();
import nodemailer from "nodemailer";
import LoggerManager from '../../config/Logger';
import fs = require('fs');
import * as path from 'path';
import SMTPTransport = require("nodemailer/lib/smtp-transport");

const Logger = LoggerManager(__filename);

const transporterGmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gaetan.patruno@gmail.com', // adresse mail ovh
        pass: process.env.EMAIL_PASSWORD, // password ovh
    },
});

class MailController {

    /**
     * sendInitPsw
     * 
     * @param fullname string
     * @param email string
     * @param token string
     * @param login string
     */
    async sendInitPwd(fullname: string, email: string, link: string): Promise<boolean> {
        let result = false;

        try {
            let pathToTemplate = path.resolve('./') + path.join('/', 'templates', 'mail', 'verifEmail.html');

            const tmpMailInit: string = fs.readFileSync(pathToTemplate, { encoding: 'utf8', flag: 'r' });
            let template: string = tmpMailInit.replace('%DISPLAY_NAME%', fullname);
            // Lien de validation du bouton et lien
            template = template.replace('%LINK%', link);
            template = template.replace('%LINK%', link);

            let mailOptionsOVH = {
                from: 'gaetan.patruno@gmail.com',
                to: email,
                subject: 'Validation de l\'adresse mail pour l\'API CRM-WS.',
                html: template
            }
            transporterGmail.sendMail(mailOptionsOVH, (error: Error, info: SMTPTransport.SentMessageInfo) => {
                console.log(error);
                console.log(info);
            });

            result = true;
            return result;
        } catch (error) {
            console.log(error);
            return result;
        }
    }
}


export = MailController;