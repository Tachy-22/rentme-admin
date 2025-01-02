"use server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export type FirebaseError = {
  code: string;
  message: string;
};

export async function addDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: T,
  path: string
): Promise<{ id: string; data: T } | FirebaseError> {
  try {
    if (!collectionName || !data) {
      throw new Error("Missing required parameters");
    }

    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    revalidatePath(path);
    return { id: docRef.id, data };
  } catch (error) {
    return {
      code: "add-document-error",
      message:
        error instanceof Error ? error.message : "Failed to add document",
    };
  }
}
