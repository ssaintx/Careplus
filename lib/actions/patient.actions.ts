"use server"

import { parseStringify } from "../utils";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { BUCKET_ID, users, storage, databases, DATABASE_ID, PATIENT_COLLECTION_ID, ENDPOINT, PROJECT_ID } from "../appwrite.config";

export const createUser = async (user: CreateUserParams) => {
    try {
        const newUser = await users.create(ID.unique(), user.email, user.phone, undefined, user.name);
    } catch (error: any) {
        if (error && error?.code === 409) {
            const documents = await users.list([
                Query.equal('email', [user.email]),
            ]);

            return documents?.users[0];
        };
    };
};

export const getUser = async (userId: string) => {
    try {
        const user = await users.get(userId);

        return parseStringify(user);
    } catch (error: any) {
        throw new Error(`Error in fetching user: ${error.message}`);
    }
}

export const registerPatient = async ({
    identificationDocument,
    ...patient
}: RegisterUserParams) => {
    try {
        let file;
        if (identificationDocument) {
            const inputFile =
                identificationDocument &&
                InputFile.fromBuffer(
                    identificationDocument?.get("blobFile") as Blob,
                    identificationDocument?.get("fileName") as string
                );

            file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
        }

        const newPatient = await databases.createDocument(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                identificationDocumentId: file?.$id ? file.$id : null,
                identificationDocumentUrl: file?.$id
                    ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view??project=${PROJECT_ID}`
                    : null,
                ...patient,
            }
        );

        return parseStringify(newPatient);
    } catch (error: any) {
        throw new Error(`An error occurred while creating a new patient: ${error.message}`);
    }
};

export const getPatient = async (userId: string) => {
    try {
        const patients = await databases.listDocuments(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            [Query.equal('userId', userId)]
        );

        return parseStringify(patients.documents[0]);
    } catch (error: any) {
        throw new Error(`Error in fetching patient: ${error.message}`);
    }
}