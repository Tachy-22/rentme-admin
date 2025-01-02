"use server";

import { auth } from "@/lib/firebase";
import { cookies } from "next/headers";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
} from "firebase/auth";
import { db } from "@/lib/firebase"; // Assume Firestore is initialized in firebase.ts
import { doc, setDoc } from "firebase/firestore";
import { fetchCollection } from "./fetchCollection";

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();
  //  console.log({ token, email });
    // Fetch user data from Firestore using email
    // const result = await fetchCollection("users", [["email", "==", email]]);
    // if ("code" in result || result.length === 0) {
    //   throw new Error("User data not found");
    // }

    // const userData = result[0];

    // Set cookies for both token and user data
    const cookieStore = await cookies();
    cookieStore.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });

    const userId = userCredential.user.uid;

    return {
      success: true,
      userId,
      token,
    };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return {
      success: false,
      error: firebaseError.message || "Invalid credentials",
    };
  }
}

export async function signOut() {
  try {
    await auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete("admin-session");
    cookieStore.delete("user-data"); // Also delete user data cookie
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function register(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: name });
    const token = await userCredential.user.getIdToken();

    const cookieStore = await cookies();
    cookieStore.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, token };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return { success: false, error: firebaseError.message };
  }
}

export async function registerLandlord(
  data: Omit<LandlordUser, "id" | "role" | "createdAt">
): Promise<AuthResponse> {
  try {
    // Check if email already exists
    const existingUsers = await fetchCollection("users", [
      ["email", "==", data.email],
    ]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return { success: false, error: "Email already exists" };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    await updateProfile(userCredential.user, { displayName: data.name });
    const token = await userCredential.user.getIdToken();

    // Clean the data before storing
    const { password, ...cleanData } = data;

    // Set user role and cleaned form data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      role: "landlord",
      ...cleanData,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return { success: false, error: firebaseError.message };
  }
}

export async function registerRenter(
  data: Omit<RenterUser, "id" | "role" | "createdAt">
): Promise<AuthResponse> {
  try {
    // Check if email already exists
    const existingUsers = await fetchCollection("users", [
      ["email", "==", data.email],
    ]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return { success: false, error: "Email already exists" };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    await updateProfile(userCredential.user, { displayName: data.name });
    const token = await userCredential.user.getIdToken();

    // Clean the data before storing
    const { password, ...cleanData } = data;

    // Set user role and cleaned form data in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      role: "renter",
      ...cleanData,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return { success: false, error: firebaseError.message };
  }
}

export async function forgotPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return { success: false, error: firebaseError.message };
  }
}

export async function resetPassword(oobCode: string, newPassword: string) {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as import("firebase/app").FirebaseError;
    return { success: false, error: firebaseError.message };
  }
}
