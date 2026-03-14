import type { ObjectId } from "mongodb";

export interface RecipeRequest {
  _id?: string;
  memberId?: string;
  memberEmail?: string; // untuk kirim notifikasi saat selesai
  name: string;
  recipeName: string;
  message?: string;
  status: "pending" | "done";
  createdAt: Date;
}

export type RecipeRequestDoc = Omit<RecipeRequest, "_id"> & { _id?: ObjectId };
