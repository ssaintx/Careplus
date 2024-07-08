"use server"

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import { Appointment } from "@/types/appwrite.types";
import { formatDateTime, parseStringify } from "../utils";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases, messaging } from "../appwrite.config";

export const createAppointment = async (appointment: CreateAppointmentParams) => {
    try {
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            ID.unique(),
            appointment
        );

        revalidatePath('/admin');
        return parseStringify(newAppointment);
    } catch (error: any) {
        throw new Error(`Error in creating appointment: ${error.message}`);
    };
};

export const updateAppointment = async ({
    appointmentId,
    userId,
    appointment,
    type,
}: UpdateAppointmentParams) => {
    try {
        const updatedAppointment = await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            appointment
        );

        if (!updatedAppointment) throw Error;

        revalidatePath("/admin");
        return parseStringify(updatedAppointment);
    } catch (error: any) {
        throw new Error(`An error occurred while scheduling an appointment: ${error.message}`);
    }
};

export const getAppointment = async (appointmentId: string) => {
    try {
        const appointment = await databases.getDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
        );

        return parseStringify(appointment);
    } catch (error: any) {
        throw new Error(`An error occured while retrieving the existing patient: ${error.message}`);
    };
};

export const getRecentAppointmentList = async () => {
    try {
        const appointments = await databases.listDocuments(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            [Query.orderDesc('$createdAt')]
        );

        const initialCounts = {
            scheduledCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
        };

        const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
            if (appointment.status === 'scheduled') {
                acc.scheduledCount += 1;
            } else if (appointment.status === 'pending') {
                acc.pendingCount += 1;
            } else if (appointment.status === 'cancelled') {
                acc.cancelledCount += 1;
            };

            return acc;
        }, initialCounts);

        const data = {
            totalCount: appointments.total,
            ...counts,
            documents: appointments.documents,
        };

        return parseStringify(data);
    } catch (error: any) {
        throw new Error(`Error in fetching appointment list: ${error.message}`);
    }
}