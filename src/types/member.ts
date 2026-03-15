import type { ObjectId } from "mongodb";

export type MemberAIPlan = "free" | "premium";

export interface Member {
  _id?: string;
  name: string;
  email: string;
  aiPlan?: MemberAIPlan;
  createdAt: Date;
}

export type MemberDoc = Omit<Member, "_id"> & { _id?: ObjectId; passwordHash: string };
