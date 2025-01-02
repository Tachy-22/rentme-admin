"use server";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const signOutAction = async () => {
  try {
    await signOut(auth);
    // Use server-side cookies API instead of js-cookie
    const cookieStore = await cookies();
    cookieStore.delete('admin-session');
    
    // Redirect to signin page
    redirect('/signin');
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export default signOutAction;
