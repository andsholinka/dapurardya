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
}

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
}
