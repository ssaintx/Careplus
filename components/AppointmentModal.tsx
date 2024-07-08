"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Appointment } from "@/types/appwrite.types";
import { AppointmentForm } from "./forms/AppointmentForm";

import { useState } from "react";

interface AppointmentModalProps {
  patientId: string;
  userId: string;
  appointment?: Appointment;
  type: 'schedule' | 'cancel';
  title: string;
  description: string;
};

export const AppointmentModal = ({ patientId, userId, appointment, type, title, description }: AppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={`capitalize ${type === 'schedule' && 'text-green-500'}`}>
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{title}?</DialogTitle>
          <DialogDescription>
            Please fill in the following details to {type} and appointment.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm 
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
