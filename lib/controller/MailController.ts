require("dotenv").config();
import nodemailer from "nodemailer";
import fs = require('fs');
import * as path from 'path';

const transporterOVH = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // adresse mail ovh
        pass: process.env.EMAIL_PASSWORD, // password ovh
    },
});

const mailOptionsOVH = {
    from: process.env.EMAIL,
    to: 'nomail@mail.com',
    subject: '',
    html: ""
}

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

        mailOptionsOVH.to = email;
        mailOptionsOVH.subject = 'Validation de l\'adresse mail pour l\'API CRM-WS.';
        try {
            let pathToTemplate = path.resolve('./') + path.join('/', 'templates', 'mail', 'verifEmail.html');
            const tmpMailInit = fs.readFileSync(pathToTemplate, { encoding: 'utf8', flag: 'r' });

            let template: string = tmpMailInit.replace('%DISPLAY_NAME%', fullname);
            // Lien de validation du bouton et lien
            template = template.replace('%LINK%', link);
            template = template.replace('%LINK%', link);
            mailOptionsOVH.html = template;

            const info = await transporterOVH.sendMail(mailOptionsOVH);
            console.log(info);
            
            result = true;
            return result;
        } catch (error) {
            console.log(error);
            return result;
        }
    }
}


export = MailController;