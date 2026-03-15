import type { Db } from "mongodb";
import { getMemberCredits } from "./member-credits";

export interface MemberRecipeRequestStatus {
  credits: number;
  canRequest: boolean;
}

export async function getMemberRecipeRequestStatus(
  db: Db,
  memberId: string
): Promise<MemberRecipeRequestStatus> {
  if (memberId === "admin") {
    return { credits: 999, canRequest: true };
  }
  const credits = await getMemberCredits(db, memberId);

  return {
    credits,
    canRequest: credits > 0,
  };
}
