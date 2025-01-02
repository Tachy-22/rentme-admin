import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from 'js-cookie';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAuthToken = (): string | undefined => {
  try {
    let token = Cookies.get("admin-session");
    console.log({ token });
    if (!token) {
      token = sessionStorage.getItem("admin-session") || undefined;
    }
    
    if (!token) return undefined;

    if (token.split(".").length !== 3) {
      removeAuthToken();
      return undefined;
    }

    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return undefined;
  }
};

export const setAuthToken = (token: string) => {
  Cookies.set("admin-session", token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: 1,
    path: '/'
  });
  sessionStorage.setItem("admin-session", token);
};

export const removeAuthToken = () => {
  Cookies.remove("admin-session", { path: '/' });
  sessionStorage.removeItem("admin-session");
};
