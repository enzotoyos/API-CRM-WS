import { FieldValue, getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
// import LoggerManager from "../../config/Logger"; // pas besoin de garder du code mort. git fait cela

const db = getFirestore();
const adminRef = db.collection("admins"); // unused
const customerRef = db.collection("customers");
const orgaRef = db.collection("organizations");
const storageRef = admin.storage().bucket(`crm-ws.appspot.com`);
// const Logger = LoggerManager(__filename);

class ImageController {

    /**
     * getImages
     * 
     * Récupère tous les liens d'un client
     * 
     * @param idCustomer string
     * @returns String[]
     */
    async getImages(idCustomer: string): Promise<string[]> {
        let imageLink = [];
        const customerDOC = await customerRef.doc(idCustomer).get();
        imageLink = customerDOC.data().imageLink;
        if (imageLink.length === 0) {
            return [];
        } else {
            return imageLink;
        }
    }

    /**
     * deleteImage
     * 
     * @param imageLink string
     * @param id string
     * @param folder string
     * @returns boolean
     */
    async deleteImage(imageLink: string, id: string, folder: string): Promise<boolean> {
        let doc: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
        let data: { [x: string]: any; imageLink?: any; };
        const tImageLink: string[] = [];
        if (folder === 'customersPhoto') {
            doc = await customerRef.doc(id).get();
            if (!doc.exists)
                return false;

            data = doc.data();
            data.imageLink.forEach((item: string) => {
                tImageLink.push(decodeURIComponent(item));
            });
        } else {
            doc = await orgaRef.doc(id).get();
            if (!doc.exists)
                return false;

            data = doc.data();
            data.logo.forEach((item: string) => {
                tImageLink.push(decodeURIComponent(item));
            });
        }

        const index = tImageLink.indexOf(imageLink);
        if (index > -1) {
            if (folder === 'customersPhoto') {
                data.imageLink.splice(index, 1);
            } else {
                data.logo.splice(index, 1);
            }
            
            const value = imageLink.split("https://storage.googleapis.com/crm-ws.appspot.com/" + folder);
            const value2 = value[1].split("?");

            if (folder === 'customersPhoto') {
                customerRef.doc(id).update(data);
            } else {
                orgaRef.doc(id).update(data);
            }

            storageRef
                .file(folder + value2[0])
                .delete()
                .then(() => {
                    console.log("Successfully deleted photo ");
                    return true;
                })
                .catch((error) => {
                    console.log(error);
                    return false;
                });
        }
    }

    /**
     * uploadImage
     * 
     * @param data string
     * @param id string
     * @param folder string
     * @returns boolean
     */
    async uploadImage(data: string, id: string, folder: string): Promise<any> {
        return new Promise((resolve) => {
            const buf = Buffer.from(data, "base64");
            const file = storageRef.file(
                folder + id + ";" + uuidv4() + ".png"
            );

            const metadata = {
                contentType: "image/png",
                metadata: { contentType: "image/png" },
            }
            file.save(buf, metadata, (SaveCallback) => {
                if (SaveCallback) {
                    throw SaveCallback;
                } else {
                    file.getSignedUrl({
                        action: "read",
                        expires: "03-09-2491",
                    }).then(async (signedUrls) => {
                        if (folder === 'customersPhoto/') {
                            const customerDoc = customerRef.doc(id);
                            customerDoc.update({
                                imageLink: FieldValue.arrayUnion(signedUrls[0]),
                            });
                        } else {
                            const orgaDoc = orgaRef.doc(id);
                            orgaDoc.update({
                                logo: FieldValue.arrayUnion(signedUrls[0]),
                            });
                        }
                        resolve(signedUrls);
                    });
                }
            });
        });
    }
}

export = ImageController;