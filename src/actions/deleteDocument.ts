"use server";

import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirebaseError } from "./addDocument";
import { revalidatePath } from "next/cache";

export async function deleteDocument(
  collectionName: string,
  documentId: string,
  path: string
): Promise<{ success: true } | FirebaseError> {
  try {
    if (!collectionName || !documentId) {
      throw new Error("Missing required parameters");
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Document does not exist");
    }

    await deleteDoc(docRef);
    revalidatePath(path);

    return { success: true };
  } catch (error) {
    return {
      code: "delete-document-error",
      message:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}
