import { FieldValue, getFirestore } from "firebase-admin/firestore";
import LoggerManager from "../../config/Logger";

const db = getFirestore();
const Logger = LoggerManager(__filename);
const adminRef = db.collection("admins");
const orgaRef = db.collection("organizations");
const custoRef = db.collection("customers");
const rdvRef = db.collection("appointements");

class OrgaController {

    async deleteOrga(idOrga: string, idAdmin: string): Promise<boolean> {
        try {
            const orgaRes = orgaRef.doc(idOrga);
            // Récupération de l'organisation
            const docOrga = await orgaRes.get();
            // Récupération de la liste de clients lié a l'orga
            // Les id de tous les clients a supprimer
            const listIdCusto: string[] = docOrga.data().customer;
            const snapshot = await custoRef.get();

            // Liste des id de tous les RDV a supprimer
            let listIdRdv: string[] = [];
            snapshot.forEach((doc) => {
                if (listIdCusto.includes(doc.id)) {
                    listIdRdv = listIdRdv.concat(doc.data().appointement);
                }
            });

            listIdRdv.forEach(idRdv => {
                rdvRef.doc(idRdv).delete();
            });
            listIdCusto.forEach(idCusto => {
                custoRef.doc(idCusto).delete();
            });
            // Suppression organisation
            await orgaRef.doc(idOrga).delete();

            // Supprimer l'id Organisation dans le tableau de l'Admin
            await adminRef.doc(idAdmin).update({ organization: FieldValue.arrayRemove(idOrga) });

            return true;
        } catch (error) {
            Logger.log({ level: "error", message: error });
            return false;
        }
    }
}

export = OrgaController;