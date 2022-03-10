import { FieldValue, getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
// import LoggerManager from "../../config/Logger";

const db = getFirestore();
const adminRef = db.collection("admins");
const customerRef = db.collection("customers");
const storageRef = admin.storage().bucket(`crm-ws.appspot.com`);
// const Logger = LoggerManager(__filename);

class ImageController {

    /**
     * deleteImage
     * 
     * @param imageLink string
     * @param idCustomer string
     * @param folder string
     * @returns boolean
     */
    async deleteImage(imageLink: string, idCustomer: string, folder: string): Promise<boolean> {
        const userDoc = await customerRef.doc(idCustomer).get();
        if (!userDoc.exists) {
            return false;
        } else {
            const custoContent = userDoc.data();
            const tImageLink: string[] = [];
            custoContent.imageLink.forEach((item: string) => {
                tImageLink.push(decodeURIComponent(item));
            });

            const index = tImageLink.indexOf(imageLink);

            if (index > -1) {
                custoContent.imageLink.splice(index, 1);
                const value = imageLink.split("https://storage.googleapis.com/crm-ws.appspot.com/" + folder);
                const value2 = value[1].split("?");

                customerRef.doc(idCustomer).update(custoContent);
                storageRef
                    .file(folder + value2[0])
                    .delete()
                    .then(() => {
                        console.log("Successfully deleted photo ");
                    })
                    .catch((error) => {
                        // Logger.log({ level: "error", message: error });
                        return false;
                    });
                return true;
            }

            return false;
        }
    }

    /**
     * uploadImage
     * 
     * @param data string
     * @param idCustomer string
     * @param folder string
     * @returns boolean
     */
    async uploadImage(data: string, idCustomer: string, folder: string): Promise<any> {
        return new Promise((resolve) => {
            const buf = Buffer.from(data, "base64");
            const file = storageRef.file(
                folder + idCustomer + ";" + uuidv4() + ".png"
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
                        const customerDoc = customerRef.doc(idCustomer);
                        await customerDoc.update({
                            imageLink: FieldValue.arrayUnion(signedUrls[0]),
                        });
                        resolve(signedUrls);
                    });
                }
            }
            );
        });
    }
}

export = ImageController;