import type { Db } from "mongodb";
import { getMemberCredits } from "./member-credits";

export interface MemberAIUsageStatus {
  credits: number;
  canUseAI: boolean;
}

export async function getMemberAIUsageStatus(
  db: Db,
  memberId: string
): Promise<MemberAIUsageStatus> {
  if (memberId === "admin") {
    return { credits: 999, canUseAI: true };
  }
  const credits = await getMemberCredits(db, memberId);
  
  return {
    credits,
    canUseAI: credits > 0,
  };
}

