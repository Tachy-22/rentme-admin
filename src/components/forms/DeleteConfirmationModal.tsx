"use client";

import { deleteDocument } from "@/actions/deleteDocument";
import {
  AlertDialog,
  //  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
//import { Button } from "../ui/button";
// import SubmitButton from "../ui/SubmitButton";
//import { useFormState } from "react-dom";
import { useState } from "react";
import SubmitButton from "../ui/SubmitButton";

interface DeleteConfirmationModalProps {
  id: string;
  collection: string;
  name?: string;
  title?: string;
}

export function DeleteConfirmationModal({
  id,
  collection,
  name = "item",
  title = "Are you sure?",
}: DeleteConfirmationModalProps) {
  const path = usePathname();
  //console.log(path);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    if (id) {
      await deleteDocument(collection, id, path as string);
      setIsOpen(false);
    }
  };
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4 text-red-500" />{" "}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white rounded">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the {""}
            {name}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
            }}
            className="rounded-xl"
          >
            Cancel
          </AlertDialogCancel>
          <form action={handleDelete} className="">
            <SubmitButton
              loadingtext="deleting..."
              className="bg-red-500 rounded-xl text-white hover:bg-red-600"
            >
              Delete
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
