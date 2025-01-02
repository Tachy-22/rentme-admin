"use client";

import {
  AlertDialog,
  //  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
//import AddEventForm from "../forms/AddEventForm";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import React from "react";

interface EditModalProps {
  children: React.ReactElement<{ onClose?: () => void }>;
  title?: string;
}

export function EditModal({ children, title }: EditModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {" "}
        <Pencil className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-7xl z-50  class rounded- bg-white">
        <AlertDialogHeader className="w-full !flex justify-between">
          <AlertDialogTitle className="w-full flex justify-between items-center">
            {title || "Edit "}
            <AlertDialogCancel
              onClick={() => {
                setIsOpen(false);
              }}
              className="w-fit aspect-square rounded-full"
            >
              <X />
            </AlertDialogCancel>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="max-h-[80vh] overflow-auto">
            {React.cloneElement(children, { onClose: () => setIsOpen(false) })}
        </div>
        <AlertDialogFooter></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
