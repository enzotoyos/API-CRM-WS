require("dotenv").config();
const nodemailer = require("nodemailer");
import fs = require('fs');
import * as path from 'path';

const transporterOVH = nodemailer.createTransport({
    host: "ssl0.ovh.net",
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
        console.log('PROCESS ENV');
        console.log(process.env.EMAIL);
        // console.log(process.env);

        mailOptionsOVH.to = email;
        mailOptionsOVH.subject = 'Validation de l\'adresse mail pour l\'API CRM-WS.';
        transporterOVH.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });
        try {
            let pathToTemplate = path.resolve('./') + path.join('/', 'templates', 'mail', 'verifEmail.html');
            const tmpMailInit = fs.readFileSync(pathToTemplate, { encoding: 'utf8', flag: 'r' });

            let template: string = tmpMailInit.replace('%DISPLAY_NAME%', fullname);
            // Lien de validation du bouton et lien
            template = template.replace('%LINK%', link);
            template = template.replace('%LINK%', link);
            mailOptionsOVH.html = template;

            let info = await transporterOVH.sendMail(mailOptionsOVH);
            console.log(info);
            
            return result;
        } catch (error) {
            console.log(error);
            return result;
        }
    }
}


export = MailController;