"use client"

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form } from '@/components/ui/form';
import { SubmitButton } from '../SubmitButton';
import { CustomFormField } from '../CustomFormField';
import { UserFormValidation } from '@/lib/validation';
import { createUser } from '@/lib/actions/patient.actions';

export enum FormFieldType {
    INPUT = 'input',
    TEXTAREA = 'textarea',
    PHONE = 'phone',
    DATE_PICKER = 'datePicker',
    SELECT = 'select',
    SKELETON = 'skeleton',
    CHECKBOX = 'checkbox',
};

export const PatientForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof UserFormValidation>>({
        resolver: zodResolver(UserFormValidation),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
        setIsLoading(true);

        try {
            const user = {
                name: values.name,
                email: values.email,
                phone: values.phone,
            };

            const newUser = await createUser(user);

            if (newUser) {
                router.push(`/patients/${newUser.$id}/register`);
            }
        } catch (error: any) {
            throw new Error(`Error in creating user: ${error.message}`);
        }

        setIsLoading(false);
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 outline-none">
                <section className="mb-12 space-y-4">
                    <h1 className="header">Hi There!</h1>
                    <p className="text-dark-700">Schedule your first appointment.</p>
                </section>

                <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    name="name"
                    label="Full name"
                    placeholder="Lazizbek Usmanov..."
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="user"
                />

                <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.INPUT}
                    name="email"
                    label="Email"
                    placeholder="saintx.git@gmail.com"
                    iconSrc="/assets/icons/email.svg"
                    iconAlt="email"
                />
                
                <CustomFormField
                    control={form.control}
                    fieldType={FormFieldType.PHONE}
                    name="phone"
                    label="Phone"
                    placeholder="(555) 123-4567"
                />

                <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
            </form>
        </Form>
    );
};