import type { Db, ObjectId } from "mongodb";
import { tryConvertObjectId } from "@/lib/mongodb";

export async function getMemberCredits(db: Db, memberId: string): Promise<number> {
  const id = tryConvertObjectId(memberId);
  if (!id) return 0;

  const member = await db.collection("members").findOne({ _id: id });
  return member?.credits ?? 0;
}

export async function deductMemberCredit(db: Db, memberId: string): Promise<boolean> {
  const id = tryConvertObjectId(memberId);
  if (!id) return false;

  const result = await db.collection("members").updateOne(
    { _id: id, credits: { $gt: 0 } },
    { $inc: { credits: -1 } }
  );

  return result.modifiedCount > 0;
}
export async function recordCreditUsage(
  db: Db,
  memberId: string,
  payload: {
    action: "ai_suggest" | "recipe_request" | "admin_adjustment";
    amount: number;
    description?: string;
    metadata?: any;
  }
) {
  const id = tryConvertObjectId(memberId);
  if (!id) return;

  await db.collection("credit_usage_logs").insertOne({
    memberId: id,
    action: payload.action,
    amount: payload.amount,
    description: payload.description,
    metadata: payload.metadata,
    createdAt: new Date(),
  });
}
