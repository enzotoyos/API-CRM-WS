
/**
 * Format Mail : someone@gmail1.com || john.doe.1@yahoo.com || david@davitech.io
 */
const regMail = new RegExp('[a-z0-9]+@[a-z0-9]+\.[a-z]{2,4}');
/**
 * Format Date : DD/MM/YYYY HH:MM
 */
const regDate = new RegExp(/^([1-9]|([012][0-9])|(3[01]))-([0]{0,1}[1-9]|1[012])-\d\d\d\d [012]{0,1}[0-9]:[0-6][0-9]$/);
/**
 * Format Age : seulement chiffre de longueur de 3 caractère max 2 min
 */
const regAge = new RegExp('[0-9]{2,3}');
/**
 * Format Number : seulement chiffre de longueur de 3 caractère max 2 min
 */
const regNumber = new RegExp(/^[0-9]+$/);
/**
 * Format String : seulement des lettres en minuscule ou maj
 */
const regString = new RegExp(/^[a-zA-Z]+$/);
/**
 * Format Tel : +33 X XX XX XX XX XX || +33XXXXXXXXX || 0XXXXXXXX
 */
const regPhone = new RegExp(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/);

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
     * regexString
     * 
     * Retourne vrai si la valeur est au bon format de téléphone
     * 
     * @param value string
     * @returns boolean
     */
    regexPhone(value: any): boolean {
        console.log('regexPhone : ' + value + " = " + regPhone.test(value));
        
        return regPhone.test(value);
    }

    /**
     * regexString
     * 
     * Retourne vrai si la valeur contient seulement que des lettres min ou maj
     * 
     * @param value string
     * @returns boolean
     */
    regexString(value: any): boolean {
        console.log('regexString : ' + value + " = " + regString.test(value));
        return regString.test(value);
    }

    /**
     * regexNumber
     * 
     * Retourne vrai si l'age est au bon format
     * et inèrieur à 120 ans
     * 
     * @param value string
     * @returns boolean
     */
    regexNumber(value: any): boolean {
        console.log('regexNumber : ' + value + " = " + regNumber.test(value));
        return regNumber.test(value);
    }

    /**
     * regexAge
     * 
     * Retourne vrai si l'age est au bon format
     * et inèrieur à 120 ans
     * 
     * @param value string
     * @returns boolean
     */
    regexAge(value: any): boolean {
        console.log('regexAge : ' + value + " = " + regAge.test(value));
        if (regAge.test(value)) {
            return (parseInt(value) < 120);
        } else {
            return false;
        }
    }

    /**
     * regexMail
     * 
     * Retourne vrai si le mail est au bon format
     * 
     * @param value string
     * @returns boolean
     */
    regexMail(value: any): boolean {
        console.log('regexMail : ' + value + " = " + regMail.test(value));
        return regMail.test(value);
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