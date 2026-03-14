import type { ObjectId } from "mongodb";

export interface Member {
  _id?: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type MemberDoc = Omit<Member, "_id"> & { _id?: ObjectId; passwordHash: string };
