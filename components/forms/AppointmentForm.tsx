"use client"

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useState } from 'react';

import { Doctors } from '@/constants';
import { SelectItem } from '../ui/select';
import { Form } from '@/components/ui/form';
import { FormFieldType } from './PatientForm';
import { SubmitButton } from '../SubmitButton';
import { CustomFormField } from '../CustomFormField';
import { Appointment } from '@/types/appwrite.types';
import { getAppointmentSchema } from '@/lib/validation';
import { createAppointment, updateAppointment } from '@/lib/actions/appointment.actions';

import Image from 'next/image';

interface AppointmentProps {
    userId: string,
    patientId: string,
    type: "create" | "schedule" | "cancel",
    appointment?: Appointment,
    setOpen?: Dispatch<SetStateAction<boolean>>,
};

export const AppointmentForm = ({ userId, patientId, type, appointment, setOpen }: AppointmentProps) => {
    const router = useRouter();

    const AppointmentFormValidation = getAppointmentSchema(type);

    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: appointment ? appointment?.primaryPhysician : "",
            schedule: appointment ? new Date(appointment?.schedule!) : new Date(Date.now()),
            reason: appointment ? appointment.reason : "",
            note: appointment?.note || "",
            cancellationReason: appointment?.cancellationReason || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
        setIsLoading(true);

        let status;
        switch (type) {
            case "schedule":
                status = "scheduled";
                break;
            case "cancel":
                status = "cancelled";
                break;
            default:
                status = "pending";
        }

        try {
            if (type === "create" && patientId) {
                const appointment = {
                    userId,
                    patient: patientId,
                    primaryPhysician: values.primaryPhysician,
                    schedule: new Date(values.schedule),
                    reason: values.reason!,
                    status: status as Status,
                    note: values.note,
                };

                const newAppointment = await createAppointment(appointment);

                if (newAppointment) {
                    form.reset();
                    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`);
                };
            } else {
                const appointmentToUpdate = {
                    userId,
                    appointmentId: appointment?.$id!,
                    appointment: {
                        primaryPhysician: values.primaryPhysician,
                        schedule: new Date(values.schedule),
                        status: status as Status,
                        cancellationReason: values.cancellationReason,
                    },
                    type,
                };

                const updatedAppointment = await updateAppointment(appointmentToUpdate);

                if (updatedAppointment) {
                    setOpen && setOpen(false);
                    form.reset();
                };
            };
        } catch (error: any) {
            throw new Error(`Error in creating appointment: ${error.message}`);
        }
        setIsLoading(false);
    };

    let buttonLabel;

    switch (type) {
        case 'cancel':
            buttonLabel = 'Cancel Appointment';
            break;
        case 'create':
            buttonLabel = 'Create Appointment';
            break;
        case 'schedule':
            buttonLabel = 'Schedule Appointment';
            break;
        default:
            buttonLabel = 'May luck another time!';
            break;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 outline-none">
                {type === 'create' && <section className="mb-12 space-y-4">
                    <h1 className="header">New Appointment!</h1>
                    <p className="text-dark-700">Request a new appointment in 10 seconds.</p>
                </section>}

                {type !== "cancel" && (
                    <>
                        <CustomFormField
                            control={form.control}
                            fieldType={FormFieldType.SELECT}
                            name="primaryPhysician"
                            label="Doctor"
                            placeholder="Choose a doctor..."
                        >
                            {Doctors.map((doctor) => (
                                <SelectItem key={doctor.name} value={doctor.name}>
                                    <div className="flex cursor-pointer items-center gap-2">
                                        <Image
                                            src={doctor.image}
                                            width={32}
                                            height={32}
                                            alt={doctor.name}
                                            className="rounded-full border border-dark-500"
                                        />
                                        <p>{doctor.name}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </CustomFormField>

                        <div className="flex flex-col gap-6 xl:flex-row">
                            <CustomFormField
                                control={form.control}
                                fieldType={FormFieldType.TEXTAREA}
                                name="reason"
                                label="Reason for appointment"
                                placeholder="ex: Annual monthly check-up"
                            />
                            <CustomFormField
                                control={form.control}
                                fieldType={FormFieldType.TEXTAREA}
                                name="note"
                                label="Additonal notes/comments"
                                placeholder="ex: Prefer afternoon appointments, if possible..."
                            />
                        </div>

                        <CustomFormField
                            control={form.control}
                            fieldType={FormFieldType.DATE_PICKER}
                            name="schedule"
                            label="Excepted appointment date..."
                            showTimeSelect
                            dateFormat="MM/dd/yyy - h:mm aa"
                        />
                    </>
                )}

                {type === "cancel" && (
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="cancellationReason"
                        label="Reason for cancellation"
                        placeholder="ex: My graphic changed, i found better service..."
                    />
                )}

                <SubmitButton isLoading={isLoading} className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}>{buttonLabel}</SubmitButton>
            </form>
        </Form>
    );
};