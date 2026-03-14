import type { ObjectId } from "mongodb";

export interface RecipeRequest {
  _id?: string;
  memberId?: string;  // opsional, kalau request dari member
  name: string;
  recipeName: string;
  message?: string;
  status: "pending" | "done";
  createdAt: Date;
}

export type RecipeRequestDoc = Omit<RecipeRequest, "_id"> & { _id?: ObjectId };
