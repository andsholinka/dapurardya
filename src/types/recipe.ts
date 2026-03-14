import type { ObjectId } from "mongodb";

export interface Recipe {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  ingredients: string[];
  steps: string[];
  category: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  createdAt: Date;
  updatedAt: Date;
  published?: boolean;
  memberOnly?: boolean;
}

/** MongoDB document type (collection uses ObjectId for _id) */
export type RecipeDoc = Omit<Recipe, "_id"> & { _id?: ObjectId };

export interface RecipeInput {
  title: string;
  description: string;
  image?: string;
  ingredients: string[];
  steps: string[];
  category: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  published?: boolean;
  memberOnly?: boolean;
}
