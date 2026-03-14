import type { ObjectId } from "mongodb";

export interface RecipeRequest {
  _id?: string;
  name: string;       // nama peminta
  recipeName: string; // nama resep yang diminta
  message?: string;   // pesan tambahan
  status: "pending" | "done";
  createdAt: Date;
}

export type RecipeRequestDoc = Omit<RecipeRequest, "_id"> & { _id?: ObjectId };
