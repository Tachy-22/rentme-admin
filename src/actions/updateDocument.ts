"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirebaseError } from "./addDocument";
import { revalidatePath } from "next/cache";

export async function updateDocument<T extends { [key: string]: unknown }>(
  collectionName: string,
  documentId: string,
  data: Partial<T>,
  path:string
): Promise<{ id: string; data: Partial<T> } | FirebaseError> {
  try {
    if (!collectionName || !documentId || !data) {
      throw new Error("Missing required parameters");
    }

    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
revalidatePath(path)
    return { id: documentId, data };
  } catch (error) {
    return {
      code: "update-document-error",
      message:
        error instanceof Error ? error.message : "Failed to update document",
    };
  }
}
