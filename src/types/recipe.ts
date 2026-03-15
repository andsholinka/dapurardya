import type { ObjectId } from "mongodb";

export interface RecipeImageAsset {
  url: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
}

export interface Recipe {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  gallery?: RecipeImageAsset[];
  ingredients: string[];
  steps: string[];
  category: string;
  tags?: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  createdAt: Date;
  updatedAt: Date;
  published?: boolean;
  memberOnly?: boolean;
  // Computed — di-join saat fetch list
  avgRating?: number;
  ratingCount?: number;
}

/** MongoDB document type (collection uses ObjectId for _id) */
export type RecipeDoc = Omit<Recipe, "_id"> & { _id?: ObjectId };

export interface RecipeInput {
  title: string;
  description: string;
  image?: string;
  images?: string[];
  gallery?: RecipeImageAsset[];
  ingredients: string[];
  steps: string[];
  category: string;
  tags?: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  published?: boolean;
  memberOnly?: boolean;
}
