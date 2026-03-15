import type { Db } from "mongodb";
import type { MemberAIPlan } from "@/types/member";

const MEMBER_AI_USAGE_COLLECTION = "member_ai_usage";
const FREE_MEMBER_WEEKLY_LIMIT = 2;
const WINDOW_DAYS = 7;

export interface MemberAIUsageStatus {
  plan: MemberAIPlan;
  weeklyLimit: number | null;
  usedThisWeek: number;
  remainingThisWeek: number | null;
  canUseAI: boolean;
  upgradeRequired: boolean;
  windowStartedAt: Date;
  nextAvailableAt: Date | null;
}

interface MemberAIUsageDoc {
  memberId: string;
  createdAt: Date;
  ingredientsCount?: number;
  suggestionsCount?: number;
}

export async function getMemberAIUsageStatus(
  db: Db,
  memberId: string,
  plan: MemberAIPlan
): Promise<MemberAIUsageStatus> {
  const windowStartedAt = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const usageCollection = db.collection<MemberAIUsageDoc>(MEMBER_AI_USAGE_COLLECTION);
  const usedThisWeek = await usageCollection.countDocuments({
    memberId,
    createdAt: { $gte: windowStartedAt },
  });

  if (plan === "premium") {
    return {
      plan,
      weeklyLimit: null,
      usedThisWeek,
      remainingThisWeek: null,
      canUseAI: true,
      upgradeRequired: false,
      windowStartedAt,
      nextAvailableAt: null,
    };
  }

  const remainingThisWeek = Math.max(0, FREE_MEMBER_WEEKLY_LIMIT - usedThisWeek);
  let nextAvailableAt: Date | null = null;

  if (remainingThisWeek === 0) {
    const oldestUsage = await usageCollection.find({
      memberId,
      createdAt: { $gte: windowStartedAt },
    }).sort({ createdAt: 1 }).limit(1).next();

    nextAvailableAt = oldestUsage?.createdAt
      ? new Date(oldestUsage.createdAt.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000)
      : null;
  }

  return {
    plan,
    weeklyLimit: FREE_MEMBER_WEEKLY_LIMIT,
    usedThisWeek,
    remainingThisWeek,
    canUseAI: remainingThisWeek > 0,
    upgradeRequired: remainingThisWeek === 0,
    windowStartedAt,
    nextAvailableAt,
  };
}

export async function recordMemberAIUsage(
  db: Db,
  memberId: string,
  meta?: { ingredientsCount?: number; suggestionsCount?: number }
) {
  const usageCollection = db.collection<MemberAIUsageDoc>(MEMBER_AI_USAGE_COLLECTION);
  await usageCollection.insertOne({
    memberId,
    createdAt: new Date(),
    ingredientsCount: meta?.ingredientsCount,
    suggestionsCount: meta?.suggestionsCount,
  });
}
