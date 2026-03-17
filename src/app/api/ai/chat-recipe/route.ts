import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-v2";
import { getDb } from "@/lib/mongodb";
import { chatWithChefAI } from "@/lib/gemini-vision";
import { logger, apiError } from "@/lib/logger";

const CHAT_SESSION_CREDIT_COST = 1;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeSlug, message, history, isNewSession } = await req.json();
    
    if (!recipeSlug || !message) {
      return NextResponse.json({ error: "Recipe slug and message required" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check credits only for new session
    if (isNewSession) {
      const membersCol = db.collection("members");
      const member = await membersCol.findOne({ email: session.email });
      
      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const credits = member.credits ?? 0;
      const isAdmin = session.role === "admin";
      
      if (!isAdmin && credits < CHAT_SESSION_CREDIT_COST) {
        return NextResponse.json(
          { 
            error: "Credit tidak cukup untuk chat. Butuh 1 credit.",
            aiStatus: { credits, canUseAI: false }
          },
          { status: 403 }
        );
      }

      // Deduct credit for new session (admin tidak dipotong)
      if (!isAdmin) {
        await membersCol.updateOne(
          { _id: member._id },
          { $inc: { credits: -CHAT_SESSION_CREDIT_COST } }
        );
      }

      logger.info("New chat session started", "CHAT_AI", { 
        recipeSlug, 
        memberEmail: session.email,
        creditDeducted: !isAdmin 
      });
    }

    // Get recipe details
    const recipesCol = db.collection("recipes");
    const recipe = await recipesCol.findOne({ slug: recipeSlug });
    
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Chat with AI
    logger.info("Processing chat message", "CHAT_AI", { recipeSlug, memberEmail: session.email });
    const reply = await chatWithChefAI(recipe, message, history || []);

    return NextResponse.json({ reply });
  } catch (error) {
    return apiError("CHAT_AI", error, "Chef AI tidak bisa merespons sekarang.");
  }
}
