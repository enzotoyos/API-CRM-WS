
// format DD/MM/YYYY HH:MM
const regDate = new RegExp(/^([1-9]|([012][0-9])|(3[01]))-([0]{0,1}[1-9]|1[012])-\d\d\d\d [012]{0,1}[0-9]:[0-6][0-9]$/);
/**
 * Format Mail
 * someone@gmail1.com
 * john.doe.1@yahoo.com
 * david@davitech.io
 */
const regMail = new RegExp('[a-z0-9]+@[a-z0-9]+\.[a-z]{2,4}');

class UtilsController {

    /**
     * isFill
     * 
     * Retourne vrai si la valeur est renseigné 
     * 
     * @param value string
     * @returns boolean
     */
    isFill(value: string): boolean {
        switch (value) {
            case null:
            case undefined:
            case "undefined":
            case "null":
                return false;
            default:
                return true;
        }
    };

    /**
     * regexMail
     * 
     * Retourne vrai si le mail est au bon format
     * 
     * @param value string
     * @returns boolean
     */
    regexMail(value: any): boolean {
        const mailRegex = value.match(regMail);
        console.log(mailRegex);
        
        if (mailRegex) {
            return false;
        } else {
            return true;
        }
    }


    /**
     * regexDate
     * 
     * Retourne vrai si la date est au bon format
     * format DD/MM/YYYY HH:MM
     * 
     * @param value string
     * @returns boolean
     */
    regexDate(value: any): boolean {
        const dateRegex = value.match(regDate);
        console.log(dateRegex);
        if (dateRegex) {
            return false;
        } else {
            return true;
        }
    }
}

export = UtilsController;