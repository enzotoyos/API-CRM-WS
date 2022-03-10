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
                return false;
                break;
            default:
                return true;
                break;
        }
    };
}

export = UtilsController;