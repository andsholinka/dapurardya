import type { Db } from "mongodb";
import type { MemberSession } from "@/lib/auth";
import type { RecipeRequestDoc } from "@/types/recipe-request";

const REQUEST_COLLECTION = "recipe_requests";
const FREE_MONTHLY_REQUEST_LIMIT = 1;

export interface MemberRecipeRequestStatus {
  plan: "free" | "premium";
  monthlyLimit: number | null;
  usedThisMonth: number;
  remainingThisMonth: number | null;
  canRequest: boolean;
  upgradeRequired: boolean;
  periodStartedAt: string;
  nextAvailableAt: string | null;
}

function getCurrentMonthRange(now = new Date()) {
  const periodStartedAt = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextAvailableAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { periodStartedAt, nextAvailableAt };
}

export async function getMemberRecipeRequestStatus(
  db: Db,
  session: Pick<MemberSession, "id" | "email" | "aiPlan">
): Promise<MemberRecipeRequestStatus> {
  const { periodStartedAt, nextAvailableAt } = getCurrentMonthRange();
  const isPremium = session.aiPlan === "premium";
  const monthlyLimit = isPremium ? null : FREE_MONTHLY_REQUEST_LIMIT;

  const usedThisMonth = await db.collection<RecipeRequestDoc>(REQUEST_COLLECTION).countDocuments({
    $and: [
      {
        $or: [
          { memberId: session.id },
          { memberId: session.email },
          { memberEmail: session.email },
        ],
      },
      { createdAt: { $gte: periodStartedAt, $lt: nextAvailableAt } },
    ],
  });

  const canRequest = isPremium || usedThisMonth < FREE_MONTHLY_REQUEST_LIMIT;

  return {
    plan: session.aiPlan,
    monthlyLimit,
    usedThisMonth,
    remainingThisMonth: monthlyLimit === null ? null : Math.max(0, monthlyLimit - usedThisMonth),
    canRequest,
    upgradeRequired: !canRequest && !isPremium,
    periodStartedAt: periodStartedAt.toISOString(),
    nextAvailableAt: isPremium ? null : nextAvailableAt.toISOString(),
  };
}
