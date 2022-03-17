import { getFirestore, FieldValue } from "firebase-admin/firestore";
import IResult from "../interface/IResult";
import AdminController from "../controller/AdminController";
import UtilsController from "../controller/UtilsController";
import LoggerManager from "../../config/Logger";

const db = getFirestore();
const custoRef = db.collection("customers");
const orgaRef = db.collection("organizations");
const rdvRef = db.collection("appointements");
const adminRef = db.collection("admins");
const utils = new UtilsController();
const adminCtrl = new AdminController();
const Logger = LoggerManager(__filename);

class CustomerController {

    async deleteCusto(idCusto: string): Promise<boolean> {
        try {
            let idOrga = "";
            const snapshot = await orgaRef.get();
            snapshot.forEach((doc) => {
                if (doc.data().customer.includes(idCusto)) {
                    idOrga = doc.id;
                }
            });

            const custoData = await custoRef.doc(idCusto).get();
            const listIdRdv: string[] = custoData.data().appointement;
            listIdRdv.forEach(idRdv => {
                rdvRef.doc(idRdv).delete();
            });

            // Suppression client
            await custoRef.doc(idCusto).delete();

            // Supprimer l'id client dans le tableau de l'organisation
            await orgaRef.doc(idOrga).update({ customer: FieldValue.arrayRemove(idCusto) });

            return true;
        } catch (error) {
            Logger.log({ level: "error", message: error });
            return false;
        }
    }

    async getAllCustomer(idAdmin: string, idOrga?: string): Promise<IResult> {
        const result: IResult = {
            success: false,
            message: "",
            record: [],
        };

        try {
            if (utils.isFill(idOrga)) {
                if (await adminCtrl.checkAutorisationOrgaForAdmin(idAdmin, idOrga)) {
                    // Je récupère tous les clients d'une organisation
                    result.message = "La récupération des clients de l'organisation : " + idOrga + " a réussi."
                    const doc = await orgaRef.doc(idOrga).get();
                    const lCustomers = doc.data().customer;
                    if (lCustomers && lCustomers.length > 0) {
                        const snapshot = await custoRef.get();
                        snapshot.forEach((doc) => {
                            if (lCustomers.includes(doc.id))
                                result.record.push(doc.data());
                        });
                    }
                    result.total = result.record.length;
                    return result;
                } else {
                    return {
                        success: false,
                        message: "Vous n'avez pas le droit d'accéder aux clients de cette organisation."
                    };
                }
            } else {
                // Je récupère tous les clients 
                result.message = "La récupération des clients a réussi."
                const docUser = adminRef.doc(idAdmin);
                const doc = await docUser.get();
                const listIdOrga: String[] = doc.data().organization;
                for (let index in listIdOrga) {
                    const docOrga = orgaRef.doc(String(listIdOrga[index]));
                    const doc = await docOrga.get();
                    const listIdCusto: String[] = doc.data().customer;
                    for (let iterator in listIdCusto) {
                        const docCusto = custoRef.doc(String(listIdCusto[iterator]));
                        const docData = await docCusto.get();
                        result.record.push(docData.data());
                    }
                }
                result.total = result.record.length;
                return result;
            }
        } catch (error: any) {
            Logger.log({ level: "error", message: error });
            return {
                success: false,
                message: "Une erreur est survenue durant la récupération des clients.",
                error: [{
                    code: error.code,
                    title: error.message
                }],
            };
        }
    }
}

export default CustomerController;