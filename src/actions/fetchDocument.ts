"use server";
import { doc, getDoc, } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirebaseError } from "./addDocument";

export async function fetchDocument<T>(
  collectionName: string,
  documentId: string
): Promise<{ id: string; data: T } | FirebaseError | null> {
  try {
    if (!collectionName || !documentId) {
      throw new Error("Missing required parameters");
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      data: docSnap.data() as T,
    };
  } catch (error) {
    return {
      code: "fetch-document-error",
      message:
        error instanceof Error ? error.message : "Failed to fetch document",
    };
  }
}
