"use server";

import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  QueryConstraint,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type QueryOptions = {
  whereClause?: [
    string,
    "<" | "<=" | "==" | ">=" | ">",
    string | number | boolean
  ][];
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  limitTo?: number;
};

export type FirebaseError = {
  code: string;
  message: string;
};

export async function fetchCollection<T>(
  collectionName: string,
  options?: QueryOptions
): Promise<{ items: T[]; count: number } | FirebaseError> {
  try {
    if (!collectionName) {
      throw new Error("Collection name is required");
    }

    const constraints: QueryConstraint[] = [];
    if (options?.whereClause) {
      options.whereClause.forEach(([field, operator, value]) => {
        constraints.push(where(field, operator, value));
      });
    }

    if (options?.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderDirection || "asc")
      );
    }

    if (options?.limitTo) {
      constraints.push(limit(options.limitTo));
    }

    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    const items = querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Transform data to ensure all fields are plain objects or primitives
      const transformedData = Object.entries(data).reduce(
        (acc, [key, value]) => {
          if (value instanceof Timestamp) {
            acc[key] = value.toDate().toISOString(); // Convert Timestamp to ISO string
          } else if (typeof value === "object" && value !== null) {
            // Recursively handle nested objects if needed
            acc[key] = JSON.parse(JSON.stringify(value));
          } else {
            acc[key] = value; // Keep primitive values as-is
          }
          return acc;
        },
        {} as Record<string, unknown>
      );
      console.log({
        id: doc.id,
        ...transformedData,
      });
      return {
        id: doc.id,
        ...transformedData,
      };
    }) as T[];

    return { items, count: items.length };
  } catch (error) {
    return {
      code: "fetch-collection-error",
      message:
        error instanceof Error ? error.message : "Failed to fetch collection",
    };
  }
}
